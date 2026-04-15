from django.urls import path
from .views import (
    RegisterView, 
    VerifyOTPView, 
    ResendOTPView, 
    LoginView, 
    LogoutView,
    UserProfileView,
    UpdateArrivalStatusView, 
    TravelChecklistView,
    DatabaseHealthCheckView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    
    # Business Logic Paths
    path('update-arrival-status/', UpdateArrivalStatusView.as_view(), name='update-status'),
    path('checklist/', TravelChecklistView.as_view(), name='checklist'),

    # Hidden diagnostic — remove before public launch
    path('db-health/', DatabaseHealthCheckView.as_view(), name='db-health'),
]
