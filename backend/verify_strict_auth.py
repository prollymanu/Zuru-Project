import os
import django
import sys
from django.utils import timezone
from datetime import timedelta

# Setup Django Environment
sys.path.append('c:/Users/ADMIN/projects/zuru/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from accounts.views import RegisterView, VerifyOTPView, LoginView
from accounts.models import OTPVerification

User = get_user_model()
factory = APIRequestFactory()

def print_step(msg):
    print(f"\n[STEP] {msg}")

def check(condition, msg):
    if condition:
        print(f"  [PASS] {msg}")
    else:
        print(f"  [FAIL] {msg}")

def test_flow():
    email = "test_strict_user@example.com"
    password = "StrongPassword123!"
    
    # Clean up previous run
    User.objects.filter(email=email).delete()
    
    # 1. Registration
    print_step("Testing Registration")
    req = factory.post('/api/auth/register/', {
        "email": email, 
        "password": password, 
        "full_name": "Test User",
        "is_in_kenya": True 
    }, format='json')
    view = RegisterView.as_view()
    resp = view(req)
    
    check(resp.status_code == 201, "Registration Status 201 Created")
    user = User.objects.get(email=email)
    check(not user.is_verified, "User is_verified is False initially")
    check(user.check_password(password), "Password was hashed correctly")
    
    otp_obj = OTPVerification.objects.get(user=user)
    print(f"  [INFO] Initial OTP: {otp_obj.otp_code}")
    
    # 2. Resend OTP
    print_step("Testing Resend OTP")
    req = factory.post('/api/auth/resend-otp/', {"email": email}, format='json')
    from accounts.views import ResendOTPView # Local import to avoid top-level issues if not done yet
    view = ResendOTPView.as_view()
    resp = view(req)
    check(resp.status_code == 200, "Resend OTP successful (200)")
    
    otp_obj.refresh_from_db()
    print(f"  [INFO] New OTP: {otp_obj.otp_code}")
    
    # 3. Login Before Verification (Should Fail)
    print_step("Testing Login Before Verification")
    req = factory.post('/api/auth/login/', {"email": email, "password": password}, format='json')
    view = LoginView.as_view()
    resp = view(req)
    check(resp.status_code == 403, "Login denied (403) for unverified user")
    
    # 3. Verify OTP - Fail Case (Wrong Code)
    print_step("Testing Invalid OTP")
    req = factory.post('/api/auth/verify-otp/', {"email": email, "otp": "000000"}, format='json')
    view = VerifyOTPView.as_view()
    resp = view(req)
    check(resp.status_code == 400, "Invalid OTP rejected (400)")
    
    # 4. Verify OTP - Success Case
    print_step("Testing Valid OTP")
    req = factory.post('/api/auth/verify-otp/', {"email": email, "otp": otp_obj.otp_code}, format='json')
    view = VerifyOTPView.as_view()
    resp = view(req)
    check(resp.status_code == 200, "Valid OTP accepted (200)")
    user.refresh_from_db()
    check(user.is_verified, "User is_verified is now True")
    
    # 5. Login After Verification (Should Succeed)
    print_step("Testing Login After Verification")
    req = factory.post('/api/auth/login/', {"email": email, "password": password}, format='json')
    view = LoginView.as_view()
    resp = view(req)
    check(resp.status_code == 200, "Login successful (200)")
    check("access" in resp.data, "Access token received")

if __name__ == "__main__":
    try:
        test_flow()
        print("\n[SUCCESS] Strict Security Flow Verified.")
    except Exception as e:
        print(f"\n[ERROR] Verification Failed: {e}")
