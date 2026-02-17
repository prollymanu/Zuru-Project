from django.db import models

class BaseListing(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to='listings/covers/', null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    location_name = models.CharField(max_length=255, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def __str__(self):
        return self.name

class Hotel(BaseListing):
    stars = models.IntegerField(default=3)
    has_pool = models.BooleanField(default=False)

class Restaurant(BaseListing):
    cuisine_type = models.CharField(max_length=100, blank=True)
    is_fine_dining = models.BooleanField(default=False)

class Apartment(BaseListing):
    num_bedrooms = models.IntegerField(default=1)
    is_serviced = models.BooleanField(default=True)
