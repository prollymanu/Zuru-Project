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
    print("--- Features Verification ---")

    email = "features@zuru.com"
    User.objects.filter(email=email).delete()

    print("1. Testing Date Validation...")
    past_date = (timezone.now() - timedelta(days=1)).date()
    data = {
        "email": email,
        "password": "password123",
        "full_name": "Features User",
        "nationality": "Kenyan",
        "is_in_kenya": False,
        "expected_arrival_date": str(past_date)
    }
    response = client.post("/api/auth/register/", data, content_type="application/json", HTTP_HOST='localhost')
    
    if response.status_code == 400:
        content = response.json()
        if "expected_arrival_date" in content and "Date cannot be in the past" in content["expected_arrival_date"][0]:
            print("PASS: Date validation correct.")
        else:
             print(f"FAIL: Unexpected error content: {content}")
    else:
        print(f"FAIL: Expected 400, got {response.status_code}")

    # Register correctly for OTP tests
    data["expected_arrival_date"] = str((timezone.now() + timedelta(days=5)).date())
    response = client.post("/api/auth/register/", data, content_type="application/json", HTTP_HOST='localhost')
    if response.status_code != 201:
        print(f"FAIL: Valid registration failed: {response.content.decode()}")
        exit(1)
    
    user = User.objects.get(email=email)
    otp = user.otp.otp_code

    print("2. Testing Strict OTP...")
    # Test Invalid
    verify_data = {"email": email, "otp_code": "000000"}
    response = client.post("/api/auth/verify-otp/", verify_data, content_type="application/json", HTTP_HOST='localhost')
    if response.status_code == 400:
        content = response.json()
        if content.get("otp") == "invalid":
            print("PASS: Invalid OTP response correct.")
        else:
            print(f"FAIL: Unexpected response for invalid OTP: {content}")
    else:
         print(f"FAIL: Expected 400 for invalid OTP, got {response.status_code}")

    # Test Expired
    otp_obj = user.otp
    otp_obj.expires_at = timezone.now() - timedelta(minutes=1)
    otp_obj.save()
    
    verify_data["otp_code"] = otp
    response = client.post("/api/auth/verify-otp/", verify_data, content_type="application/json", HTTP_HOST='localhost')
    if response.status_code == 400:
        content = response.json()
        if content.get("otp") == "expired":
             print("PASS: Expired OTP response correct.")
        else:
             print(f"FAIL: Unexpected response for expired OTP: {content}")
    else:
         print(f"FAIL: Expected 400 for expired OTP, got {response.status_code}")

    # Reset Access for checklist test
    user.is_verified = True
    user.is_active = True
    user.save()
    user.otp.delete()
    from rest_framework_simplejwt.tokens import RefreshToken
    token = str(RefreshToken.for_user(user).access_token)

    print("3. Testing Checklist Update...")
    checklist_data = {"visa": True, "packing": False}
    auth_headers = {"HTTP_AUTHORIZATION": f"Bearer {token}", "HTTP_HOST": "localhost"}
    
    response = client.patch("/api/auth/update-checklist/", checklist_data, content_type="application/json", **auth_headers)
    
    if response.status_code == 200:
        content = response.json()
        user.refresh_from_db()
        if user.travel_checklist_progress.get("visa") is True:
             print("PASS: Checklist updated and persisted.")
        else:
             print(f"FAIL: Checklist not persisted: {user.travel_checklist_progress}")
    else:
         print(f"FAIL: Checklist update failed: {response.status_code}")

if __name__ == "__main__":
    run_test()
