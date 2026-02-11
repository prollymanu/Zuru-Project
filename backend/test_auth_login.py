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
    print("--- Login Refinement Verification ---")

    email = "login_test@zuru.com"
    password = "password123"
    
    # Clean setup
    User.objects.filter(email=email).delete()
    user = User.objects.create_user(
        email=email, 
        password=password, 
        full_name="Login Tester",
        is_in_kenya=False,
        is_verified=True # Pre-verify for login test
    )
    user.is_active = True
    user.save()
    print(f"Created test user: {email}")

    print("1. Testing Custom Login...")
    login_data = {"email": email, "password": password}
    response = client.post("/api/auth/login/", login_data, content_type="application/json", HTTP_HOST='localhost')
    
    if response.status_code == 200:
        content = response.json()
        if "access" in content and "refresh" in content and "user" in content:
            user_data = content["user"]
            if user_data.get("email") == email and user_data.get("first_name") == "Login":
                print("PASS: Custom Login response correct.")
                access_token = content["access"]
            else:
                print(f"FAIL: User data mismatch: {user_data}")
                exit(1)
        else:
             print(f"FAIL: Missing keys in response: {content.keys()}")
             exit(1)
    else:
        print(f"FAIL: Login failed: {response.status_code} - {response.content.decode()}")
        exit(1)

    print("2. Testing Update Arrival Status...")
    auth_headers = {"HTTP_AUTHORIZATION": f"Bearer {access_token}", "HTTP_HOST": "localhost"}
    update_data = {"is_in_kenya": True}
    
    response = client.patch(
        "/api/auth/update-arrival-status/", 
        update_data, 
        content_type="application/json", 
        **auth_headers
    )
    
    if response.status_code == 200:
        content = response.json()
        if content.get("is_in_kenya") is True:
            # Verify DB Persistence
            user.refresh_from_db()
            if user.is_in_kenya:
                 print("PASS: Status updated content and persisted in DB.")
            else:
                 print("FAIL: Status not persisted in DB.")
        else:
            print(f"FAIL: Response content incorrect: {content}")
    else:
        print(f"FAIL: Update Status failed: {response.status_code} - {response.content.decode()}")

if __name__ == "__main__":
    run_test()
