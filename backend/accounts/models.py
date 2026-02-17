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
    
    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

class OTPVerification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def __str__(self):
        return f"{self.user.email} - {self.otp_code}"

class UserChecklist(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='checklist')
    checked_items = models.JSONField(default=list)
    is_complete = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Checklist for {self.user.email} (Complete: {self.is_complete})"


class PendingRegistration(models.Model):
    email = models.EmailField(unique=True)
    encrypted_password = models.CharField(max_length=255)
    registration_data = models.JSONField(default=dict)
    expected_arrival_date = models.DateField(null=True, blank=True)
    otp_code = models.CharField(max_length=6)
    expires_at = models.DateTimeField() 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pending: {self.email}"

