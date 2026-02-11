import os
import django
import sys
import json

sys.path.append('/code')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model

User = get_user_model()
client = Client()

def run_test():
    print("--- Hardening Verification ---")

    # Ensure a user exists
    email = "harden@zuru.com"
    if not User.objects.filter(email=email).exists():
        User.objects.create_user(email=email, password="password123")
        print(f"Created existing user: {email}")

    print("1. Testing Duplicate Email Registration...")
    data = {
        "email": email,
        "password": "newpassword123",
        "full_name": "Dupe User",
        "nationality": "Kenyan",
        "is_in_kenya": True
    }
    response = client.post("/api/auth/register/", data, content_type="application/json", HTTP_HOST='localhost')
    
    if response.status_code == 400:
        content = response.json()
        print(f"Response: {content}")
        if "email" in content and "registered" in content["email"][0]:
            print("PASS: Correct error message received.")
        else:
            print(f"FAIL: Unexpected error message: {content}")
    else:
        print(f"FAIL: Expected 400, got {response.status_code}")

    print("2. Testing Short Password...")
    data["email"] = "short@zuru.com"
    data["password"] = "short"
    response = client.post("/api/auth/register/", data, content_type="application/json", HTTP_HOST='localhost')
    
    if response.status_code == 400:
        content = response.json()
        print(f"Response: {content}")
        if "password" in content:
            print("PASS: Password validation triggered.")
        else:
            print(f"FAIL: Unexpected error message: {content}")
    else:
        print(f"FAIL: Expected 400, got {response.status_code}")

if __name__ == "__main__":
    run_test()
