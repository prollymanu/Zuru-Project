import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, Search, SlidersHorizontal, MapPin,
    Star, Navigation, ChevronRight, Loader2,
    UtensilsCrossed
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';

const CUISINES = [
    { id: 'all', label: 'All', icon: '🍽️' },
    { id: 'kenyan', label: 'Kenyan', icon: '🇰🇪' },
    { id: 'nyama_choma', label: 'Nyama Choma', icon: '🥩' },
    { id: 'italian', label: 'Italian', icon: '🍕' },
    { id: 'chinese', label: 'Chinese', icon: '🍜' },
    { id: 'indian', label: 'Indian', icon: '🍛' },
    { id: 'swahili', label: 'Swahili', icon: '🌴' },
];

const RestaurantHome = () => {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [activeCuisine, setActiveCuisine] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [locationStatus, setLocationStatus] = useState('Finding near you...');

    const fetchRestaurants = useCallback(async (lat, lng, cuisine, search) => {
        setLoading(true);
        try {
            const params = {
                lat,
                lng,
                cuisine: cuisine !== 'all' ? cuisine : undefined,
                search: search || undefined
            };
            const response = await axios.get('/api/listings/restaurants/', { params });
            setRestaurants(response.data);
        } catch (error) {
            console.error("Error fetching restaurants:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ lat: latitude, lng: longitude });
                    setLocationStatus("Nearby Nairobi"); // Defaulting to a helpful label or reverse geocode later
                    fetchRestaurants(latitude, longitude, activeCuisine, searchQuery);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    setLocationStatus("Location disabled");
                    fetchRestaurants(null, null, activeCuisine, searchQuery);
                }
            );
        } else {
            setLocationStatus("Location not supported");
            fetchRestaurants(null, null, activeCuisine, searchQuery);
        }
    }, [activeCuisine, fetchRestaurants]); // Trigger on cuisine change

    // Handle search local state then trigger refetch on debounce or explicit action
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        // In a real app, we'd debounce here
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchRestaurants(userLocation?.lat, userLocation?.lng, activeCuisine, searchQuery);
    };

    const getDirections = (lat, lng) => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
                {/* Header Section */}
                <div className="sticky top-0 z-30 bg-neutral-950/80 backdrop-blur-xl -mx-4 px-4 py-4 md:mx-0 md:rounded-b-3xl">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors"
                        >
                            <ArrowLeft className="text-white" />
                        </button>
                        <div className="text-center">
                            <h1 className="text-white font-black text-xl tracking-tighter uppercase">Dining</h1>
                            <div className="flex items-center justify-center gap-1 text-orange-500">
                                <MapPin size={10} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{locationStatus}</span>
                            </div>
                        </div>
                        <div className="w-10"></div> {/* Spacer */}
                    </div>

                    {/* Search & Filter */}
                    <form onSubmit={handleSearchSubmit} className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearch}
                                placeholder="Search restaurants, dishes..."
                                className="w-full bg-neutral-900 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500/50 transition-all text-sm font-medium"
                            />
                        </div>
                        <button type="button" className="bg-neutral-900 border border-white/5 p-3 rounded-2xl hover:bg-white/5 transition-all">
                            <SlidersHorizontal className="text-white" size={20} />
                        </button>
                    </form>
                </div>

                {/* Cuisine Chips */}
                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
                    {CUISINES.map((cuisine) => (
                        <button
                            key={cuisine.id}
                            onClick={() => setActiveCuisine(cuisine.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap transition-all border ${activeCuisine === cuisine.id
                                    ? 'bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/20'
                                    : 'bg-neutral-900 border-white/5 text-neutral-400 hover:border-white/10'
                                }`}
                        >
                            <span className="text-lg">{cuisine.icon}</span>
                            <span className="text-xs font-black uppercase tracking-widest">{cuisine.label}</span>
                        </button>
                    ))}
                </div>

                {/* Results List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {loading ? (
                        Array(4).fill(0).map((_, i) => <RestaurantSkeleton key={i} />)
                    ) : (
                        restaurants.length > 0 ? (
                            restaurants.map((res, i) => (
                                <motion.div
                                    key={res.place_id || i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group bg-neutral-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-white/10 transition-all shadow-2xl"
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={res.image_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800"}
                                            alt={res.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
                                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                                            <Star size={14} className="text-orange-500 fill-orange-500" />
                                            <span className="text-white text-xs font-black">{res.rating || 'New'}</span>
                                            <span className="text-neutral-400 text-[10px] font-bold">({res.total_ratings || 0})</span>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-4">
                                        <div>
                                            <h3 className="text-xl font-black text-white tracking-tight">{res.name}</h3>
                                            <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-1">
                                                {res.cuisine_type || 'International'} • {res.county || 'Nairobi'}
                                            </p>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => navigate(`/restaurants/${res.place_id}`, { state: { restaurant: res } })}
                                                className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-2xl py-3 px-4 flex items-center justify-center gap-2 transition-all group/btn"
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-widest">Details</span>
                                                <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                            <button
                                                onClick={() => getDirections(res.latitude, res.longitude)}
                                                className="flex-2 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl py-3 px-6 flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                                            >
                                                <Navigation size={16} className="fill-white" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Get Directions</span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center space-y-4">
                                <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mx-auto border border-white/5">
                                    <UtensilsCrossed size={32} className="text-neutral-700" />
                                </div>
                                <h3 className="text-white font-black text-lg tracking-tight">No restaurants found</h3>
                                <p className="text-neutral-500 text-sm max-w-xs mx-auto">Try adjusting your filters or searching for something else.</p>
                                <button
                                    onClick={() => { setActiveCuisine('all'); setSearchQuery(''); }}
                                    className="text-orange-500 text-xs font-black uppercase tracking-widest hover:underline"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

const RestaurantSkeleton = () => (
    <div className="bg-neutral-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden animate-pulse">
        <div className="h-48 bg-neutral-800" />
        <div className="p-6 space-y-4">
            <div className="space-y-2">
                <div className="h-6 w-2/3 bg-neutral-800 rounded-lg" />
                <div className="h-4 w-1/3 bg-neutral-800 rounded-lg" />
            </div>
            <div className="flex gap-3 mt-4">
                <div className="h-12 flex-1 bg-neutral-800 rounded-2xl" />
                <div className="h-12 flex-2 bg-neutral-800 rounded-2xl" />
            </div>
        </div>
    </div>
);

export default RestaurantHome;
