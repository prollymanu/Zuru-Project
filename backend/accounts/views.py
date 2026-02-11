from django.utils import timezone
from datetime import timedelta
from django.db import transaction
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.hashers import make_password
from rest_framework import status, views, generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
import random
import logging

from .serializers import RegistrationSerializer
from .models import OTPVerification, PendingRegistration
from .utils import send_verification_email

User = get_user_model()
logger = logging.getLogger(__name__)

def generate_otp():
    """Helper to generate 6-digit OTP"""
    return str(random.randint(100000, 999999))

class RegisterView(generics.GenericAPIView):
    """
    New Flow:
    1. Check if email exists in User -> 400.
    2. Hash password.
    3. Generate OTP.
    4. Save to PendingRegistration (Registration Data + Encrypted Password).
    5. Send Email.
    """
    serializer_class = RegistrationSerializer
    
    def post(self, request, *args, **kwargs):
        try:
            print("\n\n********** REGISTER ENDPOINT HIT **********")
            print(f"Received Data: {request.data}")
            print("*******************************************\n", flush=True)

            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            email = serializer.validated_data['email']
            
            # 1. Check if email already in CustomUser
            if User.objects.filter(email=email).exists():
                return Response({'email': 'Account with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                # 2. Hash Password
                password = serializer.validated_data['password']
                encrypted_password = make_password(password)
                
                # 3. Generate OTP
                otp_code = generate_otp()
                expires_at = timezone.now() + timedelta(minutes=10)
                
                # Prepare Registration Data (excluding sensitive/temp fields)
                reg_data = {
                    'full_name': serializer.validated_data.get('full_name'),
                    'nationality': serializer.validated_data.get('nationality'),
                    'is_in_kenya': serializer.validated_data.get('is_in_kenya'),
                    'expected_arrival_date': serializer.validated_data.get('expected_arrival_date'),
                    # Serializers.DateField returns object, need string for JSON? 
                    # JSONField serializes Date objects to strings usually, but safe to cast if needed. 
                    # Django JSONField handles datetime/date objects in recent versions, but explicit str() is safe.
                }
                # Handle date serialization explicitly to be safe
                if reg_data['expected_arrival_date']:
                     reg_data['expected_arrival_date'] = str(reg_data['expected_arrival_date'])

                # 4. Update or Create PendingRegistration
                PendingRegistration.objects.update_or_create(
                    email=email,
                    defaults={
                        'encrypted_password': encrypted_password,
                        'registration_data': reg_data,
                        'otp_code': otp_code,
                        'expires_at': expires_at
                    }
                )
                
                # DEBUG PRINT
                print(f"--- OTP FOR {email}: {otp_code} ---")
                
                # 5. Send Email
                send_verification_email(email, otp_code)
                
            return Response({
                "message": "Verification code sent. Please check your email.",
                "email": email
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"SYSTEM ERROR: {str(e)}")
            return Response({'detail': str(e) if True else 'System error.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) # Force debug msg for now

class VerifyOTPView(views.APIView):
    """
    Creation Step:
    1. Find PendingRegistration.
    2. Check Code & Expiry.
    3. Create CustomUser.
    4. Delete PendingRegistration.
    5. Return Tokens + User Data.
    """
    def post(self, request):
        try:
            print(f"\n*** VERIFY OTP HIT ***")
            print(f"Received Data: {request.data}")
            
            # Manual Validation (Bypass Serializer for Debugging)
            email = request.data.get('email')
            otp_code = request.data.get('otp')
            
            if not email or not otp_code:
                print("ERROR: Missing email or otp")
                return Response({'error': 'Email and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                pending_user = PendingRegistration.objects.get(email=email)
            except PendingRegistration.DoesNotExist:
                print(f"ERROR: No pending registration found for {email}")
                return Response({'error': 'User not found or already verified'}, status=status.HTTP_400_BAD_REQUEST)
            
            print(f"DB OTP: '{pending_user.otp_code}' vs INPUT OTP: '{otp_code}'")
            
            if str(pending_user.otp_code).strip() != str(otp_code).strip():
                return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
            
            if timezone.now() > pending_user.expires_at:
                return Response({'error': 'OTP Expired'}, status=status.HTTP_400_BAD_REQUEST)
                
            # Success: Move to Real User Table
            with transaction.atomic():
                reg_data = pending_user.registration_data
                
                # CRITICAL: Sanitize username if it exists in JSON
                reg_data.pop('username', None)
                
                # Create user strictly without 'username' field
                user = User.objects.create(
                    email=email,
                    # password=... handled below manually or passed hash?
                    # User.objects.create hashes plain text default. 
                    # If we pass hash, we should set it after or use standard create and set password.
                    # But wait, pending_user.encrypted_password IS hashed.
                    # User(password=...) stores raw. 
                    # So we construct User instance, set password field directly, then save.
                    **reg_data
                )
                
                # Directly assign the hashed password
                user.password = pending_user.encrypted_password
                user.is_verified = True
                user.is_active = True
                user.save()
                
                # Delete Pending Record
                pending_user.delete()
                
                # Generate Tokens
                refresh = RefreshToken.for_user(user)
                
            return Response({
                "message": "Account created successfully.",
                "token": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "email": user.email,
                    "first_name": user.full_name.split()[0] if user.full_name else "",
                    "is_in_kenya": user.is_in_kenya,
                    "is_verified": user.is_verified
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"SYSTEM ERROR (VerifyOTP): {str(e)}")
            return Response({'detail': 'System error.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ResendOTPView(views.APIView):
    """
    Resend for PendingRegistration.
    """
    def post(self, request):
        try:
            email = request.data.get('email')
            
            if not email:
                return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if user already exists fully
            if User.objects.filter(email=email).exists():
                 return Response({"message": "User is already registered. Please login."}, status=status.HTTP_200_OK)

            try:
                pending_user = PendingRegistration.objects.get(email=email)
            except PendingRegistration.DoesNotExist:
                return Response({"error": "No pending registration found."}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                # Generate New OTP
                otp_code = generate_otp()
                expires_at = timezone.now() + timedelta(minutes=10)
                
                pending_user.otp_code = otp_code
                pending_user.expires_at = expires_at
                pending_user.save()

                print(f"OTP RESENT: {otp_code}")
                send_verification_email(email, otp_code)
            
            return Response({"detail": "New code sent."}, status=status.HTTP_200_OK)
            
        except Exception as e:
             print(f"SYSTEM ERROR (ResendOTP): {str(e)}")
             return Response({'detail': 'System error.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(views.APIView):
    """
    Strict Mode:
    MUST use user = authenticate(email=..., password=...).
    If user is None: Return 401.
    If user is_verified is False: Return 403.
    """
    def post(self, request):
        try:
            email = request.data.get('email')
            password = request.data.get('password')
            
            user = authenticate(request=request, email=email, password=password)
            
            if user is None:
                return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
            
            if not user.is_verified:
                return Response({"error": "Verify your email first."}, status=status.HTTP_403_FORBIDDEN)
                
            refresh = RefreshToken.for_user(user)
            
            return Response({
                "token": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "email": user.email,
                    "first_name": user.full_name.split()[0] if user.full_name else "",
                    "is_in_kenya": user.is_in_kenya,
                    "is_verified": user.is_verified
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
             print(f"SYSTEM ERROR (Login): {str(e)}")
             return Response({'detail': 'System error.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Preserved Business Logic Views
class UpdateArrivalStatusView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        try:
            user = request.user
            is_in_kenya = request.data.get("is_in_kenya")

            if is_in_kenya is not None:
                user.is_in_kenya = is_in_kenya
                user.save()
                return Response({"message": "Status updated successfully.", "is_in_kenya": user.is_in_kenya}, status=status.HTTP_200_OK)
            
            return Response({"error": "Missing is_in_kenya field."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'detail': 'System error.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UpdateChecklistView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        try:
            user = request.user
            checklist_data = request.data
            
            current_progress = user.travel_checklist_progress
            if isinstance(checklist_data, dict):
                 current_progress.update(checklist_data)
                 user.travel_checklist_progress = current_progress
                 user.save()
                 return Response({"message": "Checklist updated.", "progress": user.travel_checklist_progress}, status=status.HTTP_200_OK)
            
            return Response({"error": "Invalid data format. Expected JSON object."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
             return Response({'detail': 'System error.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
