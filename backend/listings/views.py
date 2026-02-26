from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Q
import random
from datetime import datetime
from .models import Restaurant
from .services import MockGooglePlacesService, MockHotelService

# --- RESTAURANT VIEWS ---

class RestaurantListView(APIView):
    permission_classes = [permissions.AllowAny]
    """
    GET: List restaurants with precision filtering.
    """
    def get(self, request):
        try:
            search = request.query_params.get('search')
            cuisine = request.query_params.get('cuisine')
            county = request.query_params.get('county')
            min_rating = request.query_params.get('min_rating')

            # 1. Fetch from Database
            db_query = Restaurant.objects.all()
            if search:
                db_query = db_query.filter(Q(name__icontains=search) | Q(address__icontains=search))
            if cuisine and cuisine.lower() != 'all':
                db_query = db_query.filter(cuisine_type__iexact=cuisine)
            if county and county.lower() != 'all':
                db_query = db_query.filter(county__iexact=county)
            
            db_results = [
                {
                    'id': str(r.id),
                    'name': r.name,
                    'county': r.county,
                    'cuisine_type': r.cuisine_type,
                    'rating': float(r.rating),
                    'total_ratings': r.total_ratings,
                    'cover_image': r.image_url,
                    'address': r.address,
                    'is_manual_entry': True
                }
                for r in db_query
            ]

            # 2. Fetch from Mock Service with explicit filtering
            mock_results = MockGooglePlacesService.search_nearby_restaurants(
                cuisine=cuisine,
                search=search,
                county=county
            )

            # 3. Merge
            seen_names = {r['name'].lower() for r in db_results}
            final_results = db_results
            for mr in mock_results:
                if mr['name'].lower() not in seen_names:
                    final_results.append(mr)

            # 4. Rating Filter
            if min_rating:
                try:
                    mr_val = float(min_rating)
                    final_results = [r for r in final_results if r['rating'] >= mr_val]
                except ValueError:
                    pass

            return Response(final_results, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error in RestaurantListView: {e}")
            return Response([], status=status.HTTP_200_OK)

class RestaurantDetailView(APIView):
    permission_classes = [permissions.AllowAny]
    """
    GET: Return full details of a specific restaurant.
    """
    def get(self, request, pk):
        try:
            # Check DB
            try:
                r = Restaurant.objects.get(id=pk)
                return Response({
                    'id': str(r.id),
                    'name': r.name,
                    'county': r.county,
                    'cuisine_type': r.cuisine_type,
                    'rating': float(r.rating),
                    'total_ratings': r.total_ratings,
                    'cover_image': r.image_url,
                    'address': r.address,
                    'is_manual_entry': True
                })
            except (Restaurant.DoesNotExist, ValueError):
                pass
            
            # Check Mock
            all_mock = MockGooglePlacesService.get_all_restaurants()
            found = next((r for r in all_mock if r['id'] == pk), None)
            
            if found:
                return Response(found)
                
            return Response({"error": "Restaurant not found"}, status=status.HTTP_404_NOT_FOUND)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RestaurantReservationView(APIView):
    permission_classes = [permissions.AllowAny]
    """
    POST: Mock reservation submission with time validation.
    """
    def post(self, request):
        restaurant_id = request.data.get('restaurant_id')
        requested_time_str = request.data.get('time') # Expected HH:MM
        date = request.data.get('date')

        if not restaurant_id or not requested_time_str or not date:
            return Response({"error": "Missing reservation details (restaurant_id, time, date)"}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch restaurant info
        all_mock = MockGooglePlacesService.get_all_restaurants()
        restaurant = next((r for r in all_mock if r['id'] == restaurant_id), None)

        if not restaurant:
            # Check DB as fallback
            try:
                res_obj = Restaurant.objects.get(id=restaurant_id)
                # DB objects don't have hours yet, assume open for mock validation
                return Response({
                    "status": "success",
                    "message": "Reservation confirmed!",
                    "confirmation_code": f"ZURU-{random.randint(1000, 9999)}"
                }, status=status.HTTP_200_OK)
            except (Restaurant.DoesNotExist, ValueError):
                return Response({"error": "Restaurant not found"}, status=status.HTTP_404_NOT_FOUND)

        # Validation Logic
        if restaurant.get('is_24_hours'):
            return Response({
                "status": "success",
                "message": "Reservation confirmed!",
                "confirmation_code": f"ZURU-{random.randint(1000, 9999)}"
            }, status=status.HTTP_200_OK)

        try:
            req_time = datetime.strptime(requested_time_str, "%H:%M").time()
            open_time = datetime.strptime(restaurant['open_time'], "%H:%M").time()
            close_time = datetime.strptime(restaurant['close_time'], "%H:%M").time()

            is_valid = False
            if close_time < open_time: # Past midnight case
                # Valid if time is after open OR before close
                if req_time >= open_time or req_time <= close_time:
                    is_valid = True
            else:
                # Standard case
                if open_time <= req_time <= close_time:
                    is_valid = True

            if is_valid:
                return Response({
                    "status": "success",
                    "message": "Reservation confirmed!",
                    "confirmation_code": f"ZURU-{random.randint(1000, 9999)}"
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "error": f"Sorry, the restaurant operates from {restaurant['open_time']} to {restaurant['close_time']}."
                }, status=status.HTTP_400_BAD_REQUEST)

        except ValueError:
            return Response({"error": "Invalid time format. Use HH:MM (e.g., 19:00)"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Validation error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- HOTEL VIEWS ---

class HotelListView(APIView):
    permission_classes = [permissions.AllowAny]
    """
    GET: List hotels & resorts with filtering.
    """
    def get(self, request):
        search = request.query_params.get('search')
        county = request.query_params.get('county')
        min_rating = request.query_params.get('min_rating')
        
        hotels = MockHotelService.search_hotels(
            search=search,
            county=county,
            min_rating=min_rating
        )
        return Response(hotels, status=status.HTTP_200_OK)

class HotelDetailView(APIView):
    permission_classes = [permissions.AllowAny]
    """
    GET: Return full details of a specific hotel.
    """
    def get(self, request, pk):
        all_hotels = MockHotelService.get_all_hotels()
        hotel = next((h for h in all_hotels if h['id'] == pk), None)
        
        if hotel:
            return Response(hotel, status=status.HTTP_200_OK)
        return Response({"error": "Hotel not found"}, status=status.HTTP_404_NOT_FOUND)

class HotelBookingView(APIView):
    permission_classes = [permissions.AllowAny]
    """
    POST: Mock hotel booking (STAY or DAY_PASS).
    """
    def post(self, request):
        # Expected: {"hotel_id": 1, "type": "STAY", "date": "...", "guests": 2}
        hotel_id = request.data.get('hotel_id')
        booking_type = request.data.get('type') # STAY or DAY_PASS
        
        if not hotel_id or not booking_type:
            return Response({"error": "Missing booking details"}, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({
            "status": "success",
            "message": f"{booking_type.capitalize()} booking confirmed successfully!",
            "booking_reference": f"ZURU-H-{random.randint(10000, 99999)}"
        }, status=status.HTTP_200_OK)
