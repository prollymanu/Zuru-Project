from django.urls import path
from .views import (
    RegisterView, 
    VerifyOTPView, 
    ResendOTPView, 
    LoginView, 
    UpdateArrivalStatusView, 
    UpdateChecklistView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    path('login/', LoginView.as_view(), name='login'),
    
    # Business Logic Paths
    path('update-arrival-status/', UpdateArrivalStatusView.as_view(), name='update-status'),
    path('update-checklist/', UpdateChecklistView.as_view(), name='update-checklist'),
]
