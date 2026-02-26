from django.urls import path
from . import views

urlpatterns = [
    # RESTAURANTS
    path('restaurants/', views.RestaurantListView.as_view(), name='restaurant-list'),
    path('restaurants/reserve/', views.RestaurantReservationView.as_view(), name='restaurant-reserve'),
    path('restaurants/<str:pk>/', views.RestaurantDetailView.as_view(), name='restaurant-detail'),
    
    # HOTELS
    path('hotels/', views.HotelListView.as_view(), name='hotel-list'),
    path('hotels/book/', views.HotelBookingView.as_view(), name='hotel-book'),
    path('hotels/<str:pk>/', views.HotelDetailView.as_view(), name='hotel-detail'),
]
