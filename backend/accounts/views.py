from django.utils import timezone
from datetime import timedelta
from django.db import transaction
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.hashers import make_password
from rest_framework import status, views, generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
import random
import logging
import smtplib
import socket

from .serializers import RegistrationSerializer, UserSerializer, UserChecklistSerializer
from .models import OTPVerification, PendingRegistration, UserChecklist
from .utils import send_verification_email

User = get_user_model()
logger = logging.getLogger(__name__)

def generate_otp():
    """Helper to generate 6-digit OTP"""
    return str(random.randint(100000, 999999))

class RegisterView(generics.GenericAPIView):
    serializer_class = RegistrationSerializer
    
    def post(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            email = serializer.validated_data['email']
            
            if User.objects.filter(email=email).exists():
                return Response({'email': ['User with this email already exists.']}, status=status.HTTP_400_BAD_REQUEST)

            # --- Phase 1: Save to DB atomically (always succeeds or fails cleanly) ---
            otp_code = None
            with transaction.atomic():
                password = serializer.validated_data['password']
                encrypted_password = make_password(password)
                
                otp_code = generate_otp()
                expires_at = timezone.now() + timedelta(minutes=10)
                
                reg_data = {
                    'full_name': serializer.validated_data.get('full_name'),
                    'nationality': serializer.validated_data.get('nationality'),
                    'is_in_kenya': serializer.validated_data.get('is_in_kenya'),
                    'expected_arrival_date': serializer.validated_data.get('expected_arrival_date'),
                }
                # Fix: ONLY stringify if date exists, otherwise stay None
                if reg_data['expected_arrival_date']:
                     reg_data['expected_arrival_date'] = str(reg_data['expected_arrival_date'])
                else:
                     reg_data['expected_arrival_date'] = None

                PendingRegistration.objects.update_or_create(
                    email=email,
                    defaults={
                        'encrypted_password': encrypted_password,
                        'registration_data': reg_data,
                        'otp_code': otp_code,
                        'expires_at': expires_at
                    }
                )

            # --- Phase 2: Send email OUTSIDE the transaction ---
            # If this fails, the PendingRegistration row is preserved so the
            # user can request a resend without losing their registration data.
            email_sent = send_verification_email(email, otp_code)

            if email_sent:
                return Response({
                    "message": "Verification code sent. Please check your email.",
                    "email": email,
                    "email_sent": True,
                }, status=status.HTTP_200_OK)
            else:
                # PendingRegistration is saved — user can resend from the login/signup page.
                # Return 503 so the frontend does NOT redirect to the OTP screen.
                return Response({
                    "error": "mail_delivery_failed",
                    "email": email,
                    "email_sent": False,
                    "detail": "Registration successful, but we couldn't send your verification email. Please try resending from the login page.",
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
        except Exception as e:
            logger.error("SYSTEM ERROR during registration.")
            return Response({'detail': 'System error.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyOTPView(views.APIView):
    def post(self, request):
        try:
            email = request.data.get('email')
            otp_code = request.data.get('otp')
            
            if not email or not otp_code:
                return Response({'error': 'Email and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                pending_user = PendingRegistration.objects.get(email=email)
            except PendingRegistration.DoesNotExist:
                return Response({'error': 'User not found or already verified'}, status=status.HTTP_400_BAD_REQUEST)
            
            if str(pending_user.otp_code).strip() != str(otp_code).strip():
                return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
            
            if timezone.now() > pending_user.expires_at:
                return Response({'error': 'OTP Expired'}, status=status.HTTP_400_BAD_REQUEST)
                
            with transaction.atomic():
                reg_data = pending_user.registration_data
                reg_data.pop('username', None)
                
                user = User.objects.create(
                    email=email,
                    **reg_data
                )
                
                user.password = pending_user.encrypted_password
                user.is_verified = True
                user.is_active = True
                user.save()
                
                # Create initial checklist
                UserChecklist.objects.get_or_create(user=user)
                
                pending_user.delete()
                
                refresh = RefreshToken.for_user(user)
                
            return Response({
                "message": "Account created successfully.",
                "token": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error("SYSTEM ERROR (VerifyOTP): Error occurred during OTP verification.")
            return Response({'detail': 'System error.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ResendOTPView(views.APIView):
    def post(self, request):
        try:
            email = request.data.get('email')
            if not email:
                return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.filter(email=email).exists():
                 return Response({"message": "User is already registered. Please login."}, status=status.HTTP_200_OK)

            try:
                pending_user = PendingRegistration.objects.get(email=email)
            except PendingRegistration.DoesNotExist:
                return Response({"error": "No pending registration found."}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                otp_code = generate_otp()
                expires_at = timezone.now() + timedelta(minutes=10)
                
                pending_user.otp_code = otp_code
                pending_user.expires_at = expires_at
                pending_user.save()

                email_sent = send_verification_email(email, otp_code)
                if not email_sent:
                    raise Exception("Mail delivery failed.")
            
            return Response({"detail": "New code sent."}, status=status.HTTP_200_OK)
            
        except Exception as e:
             logger.error("SYSTEM ERROR (ResendOTP): Error occurred during OTP resend.")
             if "Mail delivery failed" in str(e):
                 return Response({'detail': 'Mail delivery failed. Please try again later.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
             return Response({'detail': 'System error.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(views.APIView):
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
            
            # Dynamic Progress Calculation for the response
            try:
                checklist = UserChecklist.objects.get(user=user)
                total_items = 6
                checked_count = len(checklist.checked_items)
                progress_percentage = int((checked_count / total_items) * 100)
            except UserChecklist.DoesNotExist:
                progress_percentage = 0

            return Response({
                "token": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
                "checklist_progress": progress_percentage
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
             logger.error("SYSTEM ERROR (Login): Error occurred during login.")
             return Response({'detail': 'System error.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Returns the real data of the currently logged-in user."""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class LogoutView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"error": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)
        except TokenError:
            return Response({"error": "Invalid or expired refresh token."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error("SYSTEM ERROR (Logout): Error occurred during logout.")
            return Response({'detail': 'System error.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UpdateArrivalStatusView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        """Updates is_in_kenya status and returns latest user profile data."""
        try:
            user = request.user
            is_in_kenya = request.data.get("is_in_kenya")
            
            # Robust parsing of is_in_kenya
            if is_in_kenya is not None:
                if isinstance(is_in_kenya, str):
                    user.is_in_kenya = is_in_kenya.lower() == 'true'
                else:
                    user.is_in_kenya = bool(is_in_kenya)
            else:
                user.is_in_kenya = True
                
            user.save()
            return Response({
                "message": "Status updated successfully.",
                "user": UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error("SYSTEM ERROR (UpdateArrivalStatus): Error occurred during status update.")
            return Response({'detail': 'System error.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TravelChecklistView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Returns the current user's checklist state."""
        checklist, created = UserChecklist.objects.get_or_create(user=request.user)
        return Response({
            'checked_items': checklist.checked_items,
            'is_complete': checklist.is_complete
        }, status=status.HTTP_200_OK)

    def patch(self, request):
        """Updates the user's checklist state."""
        try:
            checklist, created = UserChecklist.objects.get_or_create(user=request.user)
            checked_items = request.data.get('checked_items')
            is_complete = request.data.get('is_complete')

            if checked_items is not None:
                if isinstance(checked_items, list):
                    checklist.checked_items = checked_items
                else:
                    return Response({"error": "checked_items must be a list."}, status=status.HTTP_400_BAD_REQUEST)

            if is_complete is not None:
                checklist.is_complete = bool(is_complete)

            checklist.save()
            return Response({
                "message": "Checklist updated successfully.",
                "checked_items": checklist.checked_items,
                "is_complete": checklist.is_complete
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error("SYSTEM ERROR (TravelChecklist): Error occurred during checklist update.")
            return Response({'detail': 'System error.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

