from django.db import models
from django.conf import settings

class ServiceRequest(models.Model):
    SERVICE_TYPES = (
        ('laundry', 'Laundry'),
        ('legal', 'Legal'),
        ('event', 'Event Booking'),
    )
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='service_requests')
    service_type = models.CharField(max_length=50, choices=SERVICE_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.service_type} for {self.user.email} ({self.status})"
