from django.db import models

class BaseListing(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to='listings/covers/', null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    location_name = models.CharField(max_length=255, blank=True)
    latitude = models.DecimalField(max_digits=12, decimal_places=9, null=True, blank=True)
    longitude = models.DecimalField(max_digits=12, decimal_places=9, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def __str__(self):
        return self.name

class Restaurant(BaseListing):
    CUISINE_CHOICES = [
        ('Kenyan', 'Kenyan'),
        ('Swahili', 'Swahili'),
        ('Nyama Choma', 'Nyama Choma'),
        ('Italian', 'Italian'),
        ('Chinese', 'Chinese'),
        ('Indian', 'Indian'),
        ('Fast Food', 'Fast Food'),
        ('Other', 'Other'),
    ]

    place_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    address = models.TextField(blank=True, null=True)
    county = models.CharField(max_length=100, blank=True, null=True)
    cuisine_type = models.CharField(max_length=50, choices=CUISINE_CHOICES, default='Other')
    total_ratings = models.IntegerField(default=0)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    is_manual_entry = models.BooleanField(default=False)

class Hotel(BaseListing):
    stars = models.IntegerField(default=3)
    has_pool = models.BooleanField(default=False)

class Apartment(BaseListing):
    num_bedrooms = models.IntegerField(default=1)
    is_serviced = models.BooleanField(default=True)
