import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from .managers import CustomUserManager

class User(AbstractUser):
    username = None
    email = models.EmailField(_("email address"), unique=True)
    full_name = models.CharField(max_length=255, blank=True)
    nationality = models.CharField(max_length=100, blank=True, null=True)
    is_in_kenya = models.BooleanField(default=False)
    expected_arrival_date = models.DateField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    travel_checklist_progress = models.JSONField(default=dict, blank=True)
    
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email

class OTPVerification(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="otp")
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def __str__(self):
        return f"OTP for {self.user.email}"

class PendingRegistration(models.Model):
    email = models.EmailField(unique=True)
    encrypted_password = models.CharField(max_length=255)
    registration_data = models.JSONField(default=dict)
    otp_code = models.CharField(max_length=6)
    expires_at = models.DateTimeField() 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pending: {self.email}"
