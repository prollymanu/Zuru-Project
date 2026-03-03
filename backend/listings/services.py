import random

# PREMIUM IMAGE POOLS (Direct URLs to bypass caching/deprecation)
RESTAURANT_COVERS = [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80", # Cozy interior
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80", # Modern bright dining
    "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800&q=80", # Rustic/Meat/Grill
    "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80", # Fine dining table
    "https://images.unsplash.com/photo-1579027989536-b7b1262a3c45?w=800&q=80", # Fast food/Casual
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80", # Cafe style
    "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800&q=80", # Outdoor patio
    "https://images.unsplash.com/photo-1505826759037-406b40feb4cd?w=800&q=80"  # Luxury bar
]

AMBIANCE_PHOTOS = [
    "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=600&q=80",
    "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&q=80",
    "https://images.unsplash.com/photo-1505826759037-406b40feb4cd?w=600&q=80",
    "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=600&q=80"
]

FOOD_PHOTOS = [
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80", # Burger
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80", # Pizza
    "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600&q=80", # Pasta
    "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&q=80", # Steak
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80", # Grill
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80"  # Salad
]

# HOTEL IMAGE POOLS
HOTEL_COVERS = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80", # Resort pool
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80", # Luxury room
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80", # Hotel facade
    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80", # Beach resort
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", # Infinity pool
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80"  # Spa/Lounge
]

HOTEL_GALLERY = [
    "https://images.unsplash.com/photo-1590490360182-c33d59735288?w=600&q=80", # Bedroom
    "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&q=80", # Pool view
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80", # Modern bathroom
    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&q=80", # Lounge area
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80", # Breakfast balcony
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80"  # Garden view
]

class MockGooglePlacesService:
    @staticmethod
    def get_all_restaurants():
        # ICONIC KENYAN RESTAURANT LIST
        premium_names = [
            # Kenyan / Nyama Choma
            {"name": "Carnivore Kenya", "county": "Nairobi", "cuisine": "Nyama Choma"},
            {"name": "Kosewe Ranalo Foods", "county": "Nairobi", "cuisine": "Kenyan"},
            {"name": "Roadhouse Grill", "county": "Nairobi", "cuisine": "Nyama Choma"},
            {"name": "Mama Oliech Restaurant", "county": "Nairobi", "cuisine": "Kenyan"},
            {"name": "The Kikuyu Roast", "county": "Murang'a", "cuisine": "Nyama Choma"},
            
            # Swahili / Coastal
            {"name": "Ali Barbour's Cave Restaurant", "county": "Kwale", "cuisine": "Swahili"},
            {"name": "Tamarind Dhow", "county": "Mombasa", "cuisine": "Swahili"},
            {"name": "Swahili Plate", "county": "Nairobi", "cuisine": "Swahili"},
            {"name": "Forodhani House", "county": "Lamu", "cuisine": "Swahili"},
            {"name": "Jahazi Coffee House", "county": "Mombasa", "cuisine": "Swahili"},
            
            # Fine Dining / International
            {"name": "The Talisman", "county": "Nairobi", "cuisine": "International"},
            {"name": "CJ's - Cafe Javas", "county": "Nairobi", "cuisine": "International"},
            {"name": "About Thyme", "county": "Nairobi", "cuisine": "International"},
            {"name": "Zen Garden", "county": "Nairobi", "cuisine": "Asian"},
            {"name": "Lord Erroll Gourmet Restaurant", "county": "Nairobi", "cuisine": "International"},
            
            # Italian / European
            {"name": "Osteria del Chianti", "county": "Nairobi", "cuisine": "Italian"},
            {"name": "Trattoria Ristorante", "county": "Nairobi", "cuisine": "Italian"},
            {"name": "Roberto's Italian", "county": "Mombasa", "cuisine": "Italian"},
            
            # Asian / Indian
            {"name": "Hashmi Barbeque", "county": "Nairobi", "cuisine": "Indian"},
            {"name": "Open House Restaurant", "county": "Nairobi", "cuisine": "Indian"},
            {"name": "Mister Wok Chinese", "county": "Nairobi", "cuisine": "Chinese"},
        ]

        mock_data = []
        
        # Build the full 30 entries using a circular reference to premium_names
        for i in range(30):
            entry = premium_names[i % len(premium_names)]
            unique_id = f"res_{i+1}"
            
            # Deterministic selection logic (Zero Randomness)
            cover_idx = i % len(RESTAURANT_COVERS)
            amb_start = i % len(AMBIANCE_PHOTOS)
            food_start = i % len(FOOD_PHOTOS)
            
            # Sub-galleries
            amb_list = []
            for j in range(3):
                amb_list.append(AMBIANCE_PHOTOS[(amb_start + j) % len(AMBIANCE_PHOTOS)])
                
            food_list = []
            for j in range(3):
                food_list.append(FOOD_PHOTOS[(food_start + j) % len(FOOD_PHOTOS)])

            # Specific County adjustments for repeats to keep it realistic
            county = entry["county"]
            if i >= len(premium_names):
                # For entries past the first unique 21, mix up the counties slightly
                alt_counties = ["Nakuru", "Kisumu", "Machakos", "Eldoret", "Nairobi"]
                county = alt_counties[i % len(alt_counties)]

            mock_data.append({
                'id': unique_id,
                'name': f"{entry['name']} (Branch {i//len(premium_names) + 1})" if i >= len(premium_names) else entry['name'],
                'county': county,
                'cuisine_type': entry['cuisine'],
                'rating': round(4.0 + (i % 10) / 10, 1), # High ratings for premium spots
                'total_ratings': 500 + (i * 200),
                'address': f"Location {i+1}, {county}",
                'is_24_hours': (i % 7 == 0),
                'open_time': None if (i % 7 == 0) else '08:00',
                'close_time': None if (i % 7 == 0) else ('22:00' if i % 2 == 0 else '00:00'),
                'is_halal': (entry['cuisine'] in ['Swahili', 'Indian', 'Kenyan'] or i % 3 == 0),
                'kids_friendly': (i % 2 == 0),
                'serves_alcohol': (entry['cuisine'] != 'Swahili' and i % 5 != 0),
                'cover_image': RESTAURANT_COVERS[cover_idx],
                'ambiance_photos': amb_list,
                'menu_photos': food_list
            })

        for r in mock_data:
            r['place_id'] = r['id']
            r['is_manual_entry'] = False
        
        return mock_data

    @staticmethod
    def search_nearby_restaurants(cuisine=None, search=None, county=None):
        all_data = MockGooglePlacesService.get_all_restaurants()
        
        filtered = all_data
        
        if county and county.lower() != 'all':
            filtered = [r for r in filtered if r['county'].lower() == county.lower()]
            
        if cuisine and cuisine.lower() != 'all':
            filtered = [r for r in filtered if r['cuisine_type'].lower() == cuisine.lower()]
            
        if search:
            search_query = search.lower()
            filtered = [
                r for r in filtered 
                if search_query in r['name'].lower() or search_query in r['address'].lower()
            ]
            
        return filtered

class MockHotelService:
    @staticmethod
    def get_all_hotels():
        # PREMIUM KENYAN HOTELS & RESORTS
        hotels = [
            {
                "id": "hotel_1",
                "name": "Hemingways Nairobi",
                "county": "Nairobi",
                "description": "A luxury boutique hotel in Karen with breathtaking views of the Ngong Hills.",
                "rating": 4.9,
                "total_reviews": 1250,
                "price_per_night": 45000,
                "day_pass_price": 5000,
                "food_types": ["Fine Dining", "English Tea", "International"],
                "amenities": ["Infinity Pool", "Spa", "Butler Service", "Free WiFi"],
                "cover_image": HOTEL_COVERS[0],
                "gallery": HOTEL_GALLERY[0:3]
            },
            {
                "id": "hotel_2",
                "name": "Sarova Whitesands Beach Resort",
                "county": "Mombasa",
                "description": "One of East Africa's finest resorts located on the white sandy beaches of the Indian Ocean.",
                "rating": 4.7,
                "total_reviews": 4500,
                "price_per_night": 25000,
                "day_pass_price": 4000,
                "food_types": ["Swahili Buffet", "Seafood", "Poolside Grill"],
                "amenities": ["Beachfront", "5 Swimming Pools", "Spa", "Kids Club"],
                "cover_image": HOTEL_COVERS[3],
                "gallery": HOTEL_GALLERY[1:4]
            },
            {
                "id": "hotel_3",
                "name": "Mahali Mzuri",
                "county": "Maasai Mara",
                "description": "Sir Richard Branson’s Kenyan safari camp located in the private Olare Motorogi Conservancy.",
                "rating": 5.0,
                "total_reviews": 850,
                "price_per_night": 80000,
                "day_pass_price": 0, # Safari camps usually don't have day passes
                "food_types": ["Bush Dining", "Fine Dining", "African Fusion"],
                "amenities": ["Safari Drives", "Infinity Pool", "Eco-friendly", "Maasai Guides"],
                "cover_image": HOTEL_COVERS[2],
                "gallery": [HOTEL_GALLERY[5], HOTEL_GALLERY[1], HOTEL_GALLERY[3]]
            },
            {
                "id": "hotel_4",
                "name": "The Majlis Resort",
                "county": "Lamu",
                "description": "An elegant boutique hotel on Manda Island, Lamu, blending local culture with luxury.",
                "rating": 4.8,
                "total_reviews": 1100,
                "price_per_night": 35000,
                "day_pass_price": 3500,
                "food_types": ["Seafood", "Italian", "Swahili"],
                "amenities": ["Private Beach", "Pool", "Dhow Trips", "Art Gallery"],
                "cover_image": HOTEL_COVERS[4],
                "gallery": [HOTEL_GALLERY[4], HOTEL_GALLERY[0], HOTEL_GALLERY[2]]
            },
            {
                "id": "hotel_5",
                "name": "Enashipai Resort & Spa",
                "county": "Naivasha",
                "description": "A world-class resort on the shores of Lake Naivasha, perfect for an escape from the city.",
                "rating": 4.6,
                "total_reviews": 2800,
                "price_per_night": 22000,
                "day_pass_price": 3000,
                "food_types": ["Continental", "Nyama Choma", "Lakeside Dining"],
                "amenities": ["Siyad Spa", "Pool", "Boat Rides", "Museum"],
                "cover_image": HOTEL_COVERS[1],
                "gallery": [HOTEL_GALLERY[1], HOTEL_GALLERY[3], HOTEL_GALLERY[5]]
            },
            {
                "id": "hotel_6",
                "name": "Elewana Afro Chic",
                "county": "Diani",
                "description": "A small, intimate boutique hotel located on the spectacular Diani Beach.",
                "rating": 4.9,
                "total_reviews": 600,
                "price_per_night": 38000,
                "day_pass_price": 4500,
                "food_types": ["Seafood Fusion", "French", "Coastal"],
                "amenities": ["Beachfront", "Personalized Service", "Pool", "Free WiFi"],
                "cover_image": HOTEL_COVERS[5],
                "gallery": [HOTEL_GALLERY[0], HOTEL_GALLERY[2], HOTEL_GALLERY[4]]
            },
            {
                "id": "hotel_7",
                "name": "Fairmont Mount Kenya Safari Club",
                "county": "Nanyuki",
                "description": "Historical landmark hotel with majestic views of Mount Kenya, set on a sprawling manicured estate.",
                "rating": 4.8,
                "total_reviews": 1500,
                "price_per_night": 32000,
                "day_pass_price": 3500,
                "food_types": ["Game Meat", "British Traditional", "International"],
                "amenities": ["Horseback Riding", "Pool", "Animal Orphanage", "Golf"],
                "cover_image": HOTEL_COVERS[2],
                "gallery": [HOTEL_GALLERY[5], HOTEL_GALLERY[1], HOTEL_GALLERY[3]]
            },
            {
                "id": "hotel_8",
                "name": "Villa Rosa Kempinski",
                "county": "Nairobi",
                "description": "Opulent luxury hotel in Westlands, combining European elegance with Kenyan hospitality.",
                "rating": 4.7,
                "total_reviews": 3200,
                "price_per_night": 28000,
                "day_pass_price": 4000,
                "food_types": ["Italian", "Middle Eastern", "International"],
                "amenities": ["Rooftop Bar", "Spa", "Pool", "Fine Dining"],
                "cover_image": HOTEL_COVERS[0],
                "gallery": [HOTEL_GALLERY[2], HOTEL_GALLERY[3], HOTEL_GALLERY[4]]
            },
            {
                "id": "hotel_9",
                "name": "Sankara Nairobi",
                "county": "Nairobi",
                "description": "Modern urban hotel focused on contemporary African art and sophisticated service.",
                "rating": 4.6,
                "total_reviews": 2100,
                "price_per_night": 24000,
                "day_pass_price": 3000,
                "food_types": ["Steakhouse", "Tapas", "Art Deco Dining"],
                "amenities": ["Rooftop Pool", "Art Gallery", "Gym", "Lounge"],
                "cover_image": HOTEL_COVERS[1],
                "gallery": [HOTEL_GALLERY[0], HOTEL_GALLERY[1], HOTEL_GALLERY[2]]
            },
            {
                "id": "hotel_10",
                "name": "Medina Palms",
                "county": "Watamu",
                "description": "Luxury villas and suites set in a lush beachfront garden in the Watamu Marine Park.",
                "rating": 4.9,
                "total_reviews": 950,
                "price_per_night": 42000,
                "day_pass_price": 5000,
                "food_types": ["Modern Swahili", "Seafood", "Cocktails"],
                "amenities": ["Water Sports", "Spa", "Private Pools", "Kids Club"],
                "cover_image": HOTEL_COVERS[4],
                "gallery": [HOTEL_GALLERY[3], HOTEL_GALLERY[4], HOTEL_GALLERY[5]]
            }
        ]
        return hotels

    @staticmethod
    def search_hotels(search=None, county=None, min_rating=None):
        all_hotels = MockHotelService.get_all_hotels()
        filtered = all_hotels
        
        if county and county.lower() != 'all':
            filtered = [h for h in filtered if h['county'].lower() == county.lower()]
            
        if search:
            q = search.lower()
            filtered = [
                h for h in filtered 
                if q in h['name'].lower() or q in h['description'].lower()
            ]
            
        if min_rating:
            try:
                mr = float(min_rating)
                filtered = [h for h in filtered if h['rating'] >= mr]
            except ValueError:
                pass
                
        return filtered

class MockHousingService:
    @staticmethod
    def get_all_housing():
        return [
            {
                "id": "house_1",
                "title": "Executive Furnished Studio",
                "property_type": "Studio",
                "vibe": "Urban City",
                "transaction_type": "FOR RENT",
                "furnishing": "Fully Furnished",
                "price": 65000, 
                "currency": "KES",
                "location": "Kilimani, Nairobi",
                "distance_to_tarmac": "0.1km",
                "security": ["Biometric Access", "CCTV", "24/7 Guards", "Electric Fence"],
                "amenities": ["Rooftop Pool", "High-Speed WiFi", "Gym", "Backup Generator"],
                "cover_image": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
                "gallery": [
                    "https://images.unsplash.com/photo-1502672260266-1c1c95ed731d?w=800&q=80",
                    "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=800&q=80",
                    "https://images.unsplash.com/photo-1522771731478-4eaeb06fc99d?w=800&q=80",
                    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80"
                ]
            },
            {
                "id": "house_2",
                "title": "Spacious 3-Bedroom Apartment",
                "property_type": "Apartment",
                "vibe": "Urban City",
                "transaction_type": "FOR SALE",
                "furnishing": "Unfurnished",
                "price": 14500000, 
                "currency": "KES",
                "location": "Kileleshwa, Nairobi",
                "distance_to_tarmac": "Tarmac touch",
                "security": ["CCTV", "24/7 Guards", "Intercom"],
                "amenities": ["Borehole Water", "Backup Generator", "Elevator", "Large Balcony"],
                "cover_image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
                "gallery": [
                    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
                    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
                    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
                    "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=800&q=80"
                ]
            },
            {
                "id": "house_3",
                "title": "Luxury Oceanfront Villa",
                "property_type": "Mansion",
                "vibe": "Beachfront",
                "transaction_type": "FOR RENT",
                "furnishing": "Fully Furnished",
                "price": 250000, 
                "currency": "KES",
                "location": "Diani Beach, Kwale",
                "distance_to_tarmac": "0.2km",
                "security": ["Gated Community", "CCTV", "Electric Fencing", "Perimeter Wall"],
                "amenities": ["Private Infinity Pool", "Private Beach Access", "Solar Heating", "Ocean View"],
                "cover_image": "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80",
                "gallery": [
                    "https://images.unsplash.com/photo-1590490360182-c33d59735288?w=800&q=80",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
                    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80",
                    "https://images.unsplash.com/photo-1507652313656-b7af0d91d09e?w=800&q=80"
                ]
            },
            {
                "id": "house_4",
                "title": "Family Bungalow with Garden",
                "property_type": "Bungalow",
                "vibe": "Serene Suburb",
                "transaction_type": "FOR SALE",
                "furnishing": "Unfurnished",
                "price": 22000000, 
                "currency": "KES",
                "location": "Karen, Nairobi",
                "distance_to_tarmac": "1km",
                "security": ["Dog Kennel", "Electric Fence", "Estate Guards"],
                "amenities": ["Mountain View", "Fireplace", "Large Garden", "Solar Power", "Borehole Water"],
                "cover_image": "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80",
                "gallery": [
                    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
                    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
                    "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&q=80",
                    "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&q=80"
                ]
            },
            {
                "id": "house_5",
                "title": "Skyline View Penthouse",
                "property_type": "Penthouse",
                "vibe": "Urban City",
                "transaction_type": "FOR SALE",
                "furnishing": "Fully Furnished",
                "price": 45000000, 
                "currency": "KES",
                "location": "Westlands, Nairobi",
                "distance_to_tarmac": "Tarmac touch",
                "security": ["Biometric Access", "24/7 Guards"],
                "amenities": ["High-Speed Fiber", "Private Elevator", "Wine Cellar", "Rooftop Terrace"],
                "cover_image": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
                "gallery": [
                    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80",
                    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
                    "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80",
                    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80"
                ]
            },
            {
                "id": "house_6",
                "title": "Standard 2-Bedroom Unit",
                "property_type": "Apartment",
                "vibe": "Urban City",
                "transaction_type": "FOR RENT",
                "furnishing": "Unfurnished",
                "price": 45000, 
                "currency": "KES",
                "location": "Ruaka, Kiambu",
                "distance_to_tarmac": "0.1km",
                "security": ["Diplomatic Zone", "Gated Security", "CCTV", "Panic Buttons", "Electric Fence"],
                "amenities": ["Heated Pool", "Tennis Court", "DSQ", "Backup Generator", "Solar Water Heating"],
                "cover_image": "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80",
                "gallery": [
                    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
                    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80",
                    "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&q=80",
                    "https://images.unsplash.com/photo-1600607687126-848248e583e2?w=800&q=80"
                ]
            },
            {
                "id": "house_7",
                "title": "Rustic Woodland Cabin",
                "property_type": "Self-Contained",
                "vibe": "Nature",
                "transaction_type": "FOR RENT",
                "furnishing": "Fully Furnished",
                "price": 80000, 
                "currency": "KES",
                "location": "Nanyuki, Laikipia",
                "distance_to_tarmac": "2km",
                "security": ["Perimeter Wall", "Electric Fence", "Night Guard"],
                "amenities": ["Lake View", "Swimming Pool", "Greenhouse", "Outdoor Barbecue", "Borehole Water"],
                "cover_image": "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80",
                "gallery": [
                    "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&q=80",
                    "https://images.unsplash.com/photo-1556909211-36987daf11d1?w=800&q=80",
                    "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80",
                    "https://images.unsplash.com/photo-1533779283484-8ad4941aa4a8?w=800&q=80"
                ]
            },
            {
                "id": "house_8",
                "title": "Compact Investment Studio",
                "property_type": "Studio",
                "vibe": "Urban City",
                "transaction_type": "FOR SALE",
                "furnishing": "Unfurnished",
                "price": 4500000, 
                "currency": "KES",
                "location": "South B, Nairobi",
                "distance_to_tarmac": "0.1km",
                "security": ["Manned Gate", "Electric Fence"],
                "amenities": ["Gym", "High-Speed WiFi", "Laundry Area"],
                "cover_image": "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80",
                "gallery": [
                    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80",
                    "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80",
                    "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&q=80",
                    "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80"
                ]
            }
        ]

    @staticmethod
    def get_housing_by_id(housing_id):
        all_housing = MockHousingService.get_all_housing()
        for h in all_housing:
            if h["id"] == str(housing_id):
                return h
        return None

    @staticmethod
    def search_housing(transaction_type=None, property_type=None, vibe=None, furnishing=None, location=None):
        filtered = MockHousingService.get_all_housing()
        
        if transaction_type and transaction_type.upper() != "ALL":
            filtered = [h for h in filtered if h["transaction_type"].upper() == transaction_type.upper()]
            
        if property_type and property_type.lower() != "all":
            filtered = [h for h in filtered if h["property_type"].lower() == property_type.lower()]
            
        if vibe and vibe.lower() != "all":
            filtered = [h for h in filtered if h["vibe"].lower() == vibe.lower()]
            
        if furnishing and furnishing.lower() != "all":
            filtered = [h for h in filtered if h["furnishing"].lower() == furnishing.lower()]
            
        if location and location.lower() != "all":
            filtered = [h for h in filtered if location.lower() in h["location"].lower()]
            
        return filtered
