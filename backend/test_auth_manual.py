import os
import django
import sys

# Add the project directory to sys.path
sys.path.append('/code')

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from accounts.models import OTPVerification
import json

User = get_user_model()
client = Client()

def run_test():
    print("--- Starting Auth System Verification ---")
    
    # Clean up previous runs
    User.objects.filter(email="test@zuru.com").delete()

    print("1. Testing Registration...")
    data = {
        "email": "test@zuru.com",
        "password": "password123",
        "full_name": "Test User",
        "nationality": "Kenyan",
        "is_in_kenya": True,
        "expected_arrival_date": "2026-01-01"
    }
    response = client.post("/api/auth/register/", data, content_type="application/json", HTTP_HOST='localhost')
    if response.status_code != 201:
        print(f"FAILED: {response.status_code} - {response.content.decode()}")
        exit(1)
    print("Registration Successful.")

    print("2. Retrieving OTP...")
    try:
        user = User.objects.get(email="test@zuru.com")
        otp_obj = OTPVerification.objects.get(user=user)
        otp = otp_obj.otp_code
        print(f"OTP Found: {otp}")
    except Exception as e:
        print(f"FAILED to retrieve OTP: {e}")
        exit(1)

    print("3. Testing/Verifying OTP...")
    verify_data = {
        "email": "test@zuru.com",
        "otp_code": otp
    }
    response = client.post("/api/auth/verify-otp/", verify_data, content_type="application/json", HTTP_HOST='localhost')
    if response.status_code != 200:
        print(f"FAILED: {response.status_code} - {response.content.decode()}")
        exit(1)
    
    tokens = response.json()
    if 'access' not in tokens or 'refresh' not in tokens:
        print(f"FAILED: Tokens missing in response: {tokens}")
        exit(1)
        
    print("Verification Successful. Tokens received.")

    print("4. Check User Verification Status...")
    user.refresh_from_db()
    if not user.is_verified:
        print("FAILED: User is_verified is False")
        exit(1)
    if not user.is_active:
        print("FAILED: User is_active is False")
        exit(1)
    print("User status verified.")

    print("--- ALL TESTS PASSED ---")

if __name__ == "__main__":
    run_test()
