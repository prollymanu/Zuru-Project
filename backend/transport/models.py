from django.db import models
from django.conf import settings

class RideRequest(models.Model):
    STATUS_CHOICES = (
        ('searching', 'Searching'),
        ('accepted', 'Accepted'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ride_requests')
    pickup_location = models.CharField(max_length=255)
    dropoff_location = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='searching')
    driver_details = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Ride from {self.pickup_location} to {self.dropoff_location} ({self.status})"
