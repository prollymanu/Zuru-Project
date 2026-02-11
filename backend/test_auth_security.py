import os
import django
import sys
import json
from datetime import timedelta
from django.utils import timezone

sys.path.append('/code')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from accounts.models import OTPVerification

User = get_user_model()
client = Client()

def run_test():
    print("--- Security Fixes Verification ---")

    email = "security@zuru.com"
    password = "password123"
    
    User.objects.filter(email=email).delete()
    
    # 1. Registration (Hashing Check)
    print("1. Testing Registration (Password Hashing)...")
    data = {"email": email, "password": password, "full_name": "Sec", "is_in_kenya": False}
    response = client.post("/api/auth/register/", data, content_type="application/json", HTTP_HOST='localhost')
    if response.status_code == 201:
        user = User.objects.get(email=email)
        if user.check_password(password):
            print("PASS: Password hashed correctly.")
        else:
             print("FAIL: Password not hashed.")
    else:
        print(f"FAIL: Registration failed: {response.content}")
        exit(1)

    # 2. OTP Logic
    print("2. Testing OTP Logic Vulnerability...")
    otp = user.otp.otp_code
    
    # Test Invalid
    verify_data = {"email": email, "otp_code": "000000"}
    response = client.post("/api/auth/verify-otp/", verify_data, content_type="application/json", HTTP_HOST='localhost')
    if response.status_code == 400 and response.json().get("error") == "Invalid code":
        print("PASS: Invalid code rejected with correct message.")
    else:
        print(f"FAIL: Invalid OTP check: {response.status_code} - {response.content}")

    # Test Expired
    otp_obj = user.otp
    otp_obj.expires_at = timezone.now() - timedelta(minutes=1)
    otp_obj.save()
    
    verify_data["otp_code"] = otp
    response = client.post("/api/auth/verify-otp/", verify_data, content_type="application/json", HTTP_HOST='localhost')
    if response.status_code == 400 and response.json().get("error") == "Expired code":
        print("PASS: Expired code rejected with correct message.")
    else:
        print(f"FAIL: Expired OTP check: {response.status_code} - {response.content}")

    # Manual verify for Login test
    user.is_verified = True
    user.is_active = True
    user.save()
    user.otp.delete()

    # 3. Login Logic
    print("3. Testing Login Bypass Remediation...")
    
    # Wrong Password
    login_data = {"email": email, "password": "wrongpassword"}
    response = client.post("/api/auth/login/", login_data, content_type="application/json", HTTP_HOST='localhost')
    if response.status_code == 401:
        print("PASS: Wrong password rejected.")
    else:
        print(f"FAIL: Login accepted wrong password: {response.status_code} - {response.content}")

    # Correct Password
    login_data["password"] = password
    response = client.post("/api/auth/login/", login_data, content_type="application/json", HTTP_HOST='localhost')
    if response.status_code == 200:
         print("PASS: Correct password accepted.")
         if "user" in response.json():
             print("PASS: User context returned.")
    else:
         print(f"FAIL: Correct login failed: {response.status_code} - {response.content}")

if __name__ == "__main__":
    run_test()
