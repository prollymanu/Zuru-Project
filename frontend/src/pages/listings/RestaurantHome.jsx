import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
    ArrowLeft, Search, SlidersHorizontal, MapPin,
    Star, Navigation, ChevronRight, Loader2,
    UtensilsCrossed, AlertTriangle, RefreshCw,
    CircleSlash, X, CheckCircle2, Info
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getRestaurantStatus } from '../../utils/timeHelpers';

const CUISINES = [
    { id: 'all', label: 'All', icon: '🍽️' },
    { id: 'Kenyan', label: 'Kenyan', icon: '🇰🇪' },
    { id: 'Nyama Choma', label: 'Nyama Choma', icon: '🥩' },
    { id: 'Italian', label: 'Italian', icon: '🍕' },
    { id: 'Chinese', label: 'Chinese', icon: '🍜' },
    { id: 'Swahili', label: 'Swahili', icon: '🌴' },
    { id: 'Fast Food', label: 'Fast Food', icon: '🍔' },
];

const COUNTIES = ["All", "Nairobi", "Mombasa", "Nakuru", "Kisumu", "Murang'a", "Kiambu"];

const RestaurantHome = () => {
    const navigate = useNavigate();

    // Core State
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCuisine, setActiveCuisine] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Filter State
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedCounty, setSelectedCounty] = useState('All');
    const [minRating, setMinRating] = useState('Any');

    // Rating State
    const [ratingModal, setRatingModal] = useState({ isOpen: false, restaurant: null, value: 0 });
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);

    // Toast State
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
    };

    const fetchRestaurants = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Task 1: Fix Filter API Call
            // Ensuring state variables are passed properly to Axios
            const params = {
                cuisine: activeCuisine !== 'all' ? activeCuisine : undefined,
                county: selectedCounty !== 'All' ? selectedCounty : undefined,
                min_rating: minRating !== 'Any' ? minRating.replace('+', '') : undefined,
                search: searchQuery || undefined
            };

            // Note: baseURL handles the host, but we include /api/ as per config/urls.py
            const response = await api.get('/api/listings/restaurants/', { params });
            console.log("API RESPONSE:", response);

            const resData = response.data;
            const restaurantsArray = Array.isArray(resData) ? resData : (resData.results || resData.data || resData.restaurants || []);
            setRestaurants(restaurantsArray);
        } catch (err) {
            console.error("API ERROR:", err.response || err.message);
            setError("Connection Error. Please check your network and try again.");
            setRestaurants([]);
        } finally {
            setLoading(false);
        }
    }, [activeCuisine, searchQuery, selectedCounty, minRating]);

    useEffect(() => {
        fetchRestaurants();
    }, [activeCuisine, fetchRestaurants]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchRestaurants();
    };

    const handleViewDetails = (id) => {
        // Task 3: Navigation to Detail Page
        navigate(`/listings/restaurants/${id}`);
    };

    const submitRating = async () => {
        if (ratingModal.value === 0) return;
        setIsSubmittingRating(true);
        try {
            await api.post('/api/listings/restaurants/', {
                restaurant_id: ratingModal.restaurant.id || ratingModal.restaurant.place_id,
                rating: ratingModal.value
            });
            showToast(`Rated ${ratingModal.restaurant.name} successfully!`, 'success');
            setRatingModal({ isOpen: false, restaurant: null, value: 0 });
        } catch (err) {
            console.error("RATING ERROR:", err.response || err.message);
            showToast("Failed to submit rating. Try again.", "error");
        } finally {
            setIsSubmittingRating(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="relative min-h-screen overflow-hidden">
                {/* Task 2: Subtle Restaurant Background */}
                <div
                    className="fixed inset-0 z-0 bg-neutral-900"
                    style={{
                        backgroundImage: 'url("https://images.unsplash.com/photo-1414235077428-338988a2e8c0?auto=format&fit=crop&q=80")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundAttachment: 'fixed'
                    }}
                />
                <div className="fixed inset-0 bg-black/85 backdrop-blur-[2px] z-0" />

                {/* Main Content Container */}
                <div className="relative z-10 max-w-4xl mx-auto space-y-6 pb-20 px-4 pt-4">
                    {/* Header */}
                    <div className="sticky top-0 z-30 bg-neutral-950/90 backdrop-blur-xl -mx-4 px-4 py-4 md:mx-0 md:rounded-b-3xl border-b border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors"
                            >
                                <ArrowLeft className="text-white" />
                            </button>
                            <h1 className="text-white font-black text-xl tracking-tighter uppercase">Dining</h1>
                            <div className="w-10"></div>
                        </div>

                        {/* Search & Filter Bar */}
                        <div className="flex gap-2">
                            <form onSubmit={handleSearchSubmit} className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search 'Pizza', 'Nyama'..."
                                    className="w-full bg-neutral-900 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500/50 transition-all text-sm font-medium"
                                />
                            </form>
                            <button
                                onClick={() => setIsFilterOpen(true)}
                                className="bg-neutral-900 border border-white/5 p-3.5 rounded-2xl hover:bg-white/5 transition-all relative"
                            >
                                <SlidersHorizontal className="text-white" size={20} />
                                {(selectedCounty !== 'All' || minRating !== 'Any') && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Cuisine Horizontal Categories */}
                    <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
                        {CUISINES.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setActiveCuisine(c.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full whitespace-nowrap transition-all border ${activeCuisine === c.id
                                    ? 'bg-orange-500 border-orange-400 text-white shadow-xl shadow-orange-500/30'
                                    : 'bg-neutral-900 border-white/5 text-neutral-400 hover:border-white/10'
                                    }`}
                            >
                                <span className="text-lg">{c.icon}</span>
                                <span className="text-xs font-black uppercase tracking-widest">{c.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="min-h-[400px]">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[1, 2, 3].map(i => <RestaurantSkeleton key={i} />)}
                            </div>
                        ) : error ? (
                            <ErrorState message={error} onRetry={fetchRestaurants} />
                        ) : (restaurants && restaurants.length > 0) ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <AnimatePresence>
                                    {restaurants.map((res, i) => {
                                        console.log("Rendering:", res.name, "Image:", res.cover_image);
                                        return (
                                            <RestaurantCard
                                                key={res.id || res.place_id || i}
                                                restaurant={res}
                                                index={i}
                                                onRate={(e) => { e.stopPropagation(); setRatingModal({ isOpen: true, restaurant: res, value: 0 }); }}
                                                onDirections={(e) => { e.stopPropagation(); showToast("Directions feature is coming soon!", "info"); }}
                                                onClick={() => handleViewDetails(res.id || res.place_id)}
                                            />
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <EmptyState onReset={() => {
                                setActiveCuisine('all');
                                setSearchQuery('');
                                setSelectedCounty('All');
                                setMinRating('Any');
                            }} />
                        )}
                    </div>
                </div>

                {/* Filter Drawer Overlay */}
                <AnimatePresence>
                    {isFilterOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsFilterOpen(false)}
                                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                            />
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed bottom-0 inset-x-0 bg-neutral-950 rounded-t-[3rem] z-[101] border-t border-white/10 p-8 space-y-8 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="text-white font-black text-2xl tracking-tighter uppercase">Filters</h2>
                                    <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-neutral-900 rounded-full text-neutral-500 hover:text-white transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* County Selection */}
                                    <div className="space-y-3">
                                        <label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest ml-1">Select County</label>
                                        <div className="flex flex-wrap gap-2">
                                            {COUNTIES.map(county => (
                                                <button
                                                    key={county}
                                                    onClick={() => setSelectedCounty(county)}
                                                    className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border ${selectedCounty === county
                                                        ? 'bg-white text-black border-white shadow-lg'
                                                        : 'bg-neutral-900 text-neutral-400 border-white/5 hover:border-white/10'
                                                        }`}
                                                >
                                                    {county}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Rating Selection */}
                                    <div className="space-y-3">
                                        <label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest ml-1">Min Rating</label>
                                        <div className="flex gap-2">
                                            {['Any', '4+', '5'].map(rating => (
                                                <button
                                                    key={rating}
                                                    onClick={() => setMinRating(rating)}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs font-bold transition-all border ${minRating === rating
                                                        ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/20'
                                                        : 'bg-neutral-900 text-neutral-400 border-white/5 hover:border-white/10'
                                                        }`}
                                                >
                                                    {rating !== 'Any' && <Star size={14} className={minRating === rating ? 'fill-white' : ''} />}
                                                    {rating === 'Any' ? 'Any Rating' : `${rating} Stars`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => { setIsFilterOpen(false); fetchRestaurants(); }}
                                    className="w-full bg-white text-black py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl"
                                >
                                    Apply Filters
                                </button>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Rating Modal */}
                <AnimatePresence>
                    {ratingModal.isOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setRatingModal({ ...ratingModal, isOpen: false })}
                                className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]"
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-neutral-900 border border-white/10 rounded-[3rem] z-[101] p-10 text-center space-y-8 shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
                            >
                                <div className="space-y-2">
                                    <h3 className="text-white font-black text-2xl tracking-tighter uppercase">Rate {ratingModal.restaurant?.name}</h3>
                                    <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">Your feedback powers the mission.</p>
                                </div>

                                {/* Stars */}
                                <div className="flex justify-center gap-3">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            onClick={() => setRatingModal({ ...ratingModal, value: star })}
                                            className="p-1 hover:scale-125 transition-transform"
                                        >
                                            <Star
                                                size={40}
                                                className={`${ratingModal.value >= star
                                                    ? 'fill-orange-500 text-orange-500 hover:text-orange-400'
                                                    : 'text-neutral-700 hover:text-neutral-500'
                                                    } transition-colors`}
                                            />
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setRatingModal({ ...ratingModal, isOpen: false })}
                                        className="flex-1 text-neutral-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        disabled={ratingModal.value === 0 || isSubmittingRating}
                                        onClick={submitRating}
                                        className="flex-2 bg-orange-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSubmittingRating ? <Loader2 className="animate-spin" size={16} /> : "Submit Rating"}
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Custom Toast Hooked to State */}
                <AnimatePresence>
                    {toast.show && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 bg-neutral-900 border border-white/10 px-6 py-4 rounded-3xl shadow-2xl min-w-[280px]"
                        >
                            <div className={`p-2 rounded-xl bg-opacity-10 ${toast.type === 'success' ? 'bg-green-500 text-green-500' :
                                toast.type === 'error' ? 'bg-red-500 text-red-500' : 'bg-orange-500 text-orange-500'
                                }`}>
                                {toast.type === 'success' ? <CheckCircle2 size={20} /> :
                                    toast.type === 'error' ? <AlertTriangle size={20} /> : <Info size={20} />}
                            </div>
                            <p className="text-white text-xs font-black uppercase tracking-widest truncate">{toast.message}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

/* --- Sub-Components --- */

const RestaurantCard = ({ restaurant, index, onRate, onDirections, onClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        onClick={onClick}
        className="group bg-neutral-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-orange-500/20 transition-all shadow-2xl relative cursor-pointer"
    >
        <div className="relative h-48 overflow-hidden bg-neutral-800">
            <img
                src={restaurant.cover_image || restaurant.image_url || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800"}
                alt={restaurant.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80";
                    e.target.onerror = null;
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

            <div className="absolute bottom-4 left-4 bg-orange-500 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
                <Star size={14} className="fill-white text-white" />
                <span className="text-white text-xs font-black">{restaurant.rating || 'New'}</span>
            </div>
            <button
                onClick={onRate}
                className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all active:scale-95"
            >
                Rate
            </button>
        </div>

        <div className="p-6 space-y-5">
            <div>
                <h3 className="text-xl font-black text-white tracking-tight group-hover:text-orange-500 transition-colors uppercase">{restaurant.name}</h3>
                <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                    {restaurant.cuisine_type} • {restaurant.county || 'Nairobi'}
                </p>

                {/* Real-Time Status Badge */}
                <div className="flex items-center gap-2 mt-3">
                    <span className={`relative flex h-2 w-2 ${getRestaurantStatus(restaurant.hours).isOpen ? '' : 'hidden'}`}>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    {!getRestaurantStatus(restaurant.hours).isOpen && (
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    )}
                    <span className={`text-[10px] font-black uppercase tracking-widest ${getRestaurantStatus(restaurant.hours).isOpen ? 'text-green-500' : 'text-red-500'}`}>
                        {getRestaurantStatus(restaurant.hours).isOpen ? 'Open Now' : 'Closed'}
                        <span className="text-neutral-500 font-bold lowercase normal-case tracking-normal ml-1">
                            • {getRestaurantStatus(restaurant.hours).statusText.split(' • ')[1]}
                        </span>
                    </span>
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onClick}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-2xl py-3.5 px-4 font-black text-[10px] uppercase tracking-widest transition-all border border-white/5 active:scale-95"
                >
                    View Details
                </button>
                <button
                    onClick={onDirections}
                    className="flex-2 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl py-3.5 px-6 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-2"
                >
                    <Navigation size={14} className="fill-white" />
                    Directions
                </button>
            </div>
        </div>
    </motion.div>
);

const RestaurantSkeleton = () => (
    <div className="bg-neutral-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden">
        <div className="h-48 bg-neutral-800/50 animate-pulse" />
        <div className="p-6 space-y-6">
            <div className="space-y-3">
                <div className="h-6 w-3/4 bg-neutral-800/50 rounded-lg animate-pulse" />
                <div className="h-4 w-1/2 bg-neutral-800/50 rounded-lg animate-pulse" />
            </div>
            <div className="flex gap-3 pt-2">
                <div className="h-12 flex-1 bg-neutral-800/50 rounded-2xl animate-pulse" />
                <div className="h-12 flex-2 bg-neutral-800/50 rounded-2xl animate-pulse" />
            </div>
        </div>
    </div>
);

const ErrorState = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
            <AlertTriangle size={32} className="text-red-500" />
        </div>
        <div className="space-y-2">
            <h3 className="text-white font-black text-lg tracking-tight">{message}</h3>
            <p className="text-neutral-500 text-sm max-w-xs mx-auto leading-relaxed">We're having trouble reaching Zuru servers.</p>
        </div>
        <button
            onClick={onRetry}
            className="flex items-center gap-3 bg-neutral-900 hover:bg-white/5 border border-white/10 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
        >
            <RefreshCw size={16} />
            Retry Connection
        </button>
    </div>
);

const EmptyState = ({ onReset }) => (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
        <div className="relative">
            <div className="w-32 h-32 bg-neutral-900 rounded-full flex items-center justify-center border border-white/5">
                <UtensilsCrossed size={48} className="text-neutral-700" />
            </div>
            <CircleSlash size={24} className="absolute bottom-1 right-1 text-orange-500" />
        </div>
        <div className="space-y-2 px-4">
            <h3 className="text-white font-black text-xl tracking-tight uppercase">No Spots Found</h3>
            <p className="text-neutral-500 text-sm font-medium max-w-xs mx-auto leading-relaxed">
                We couldn't find any dining spots matching your mission criteria.
            </p>
        </div>
        <button
            onClick={onReset}
            className="text-orange-500 text-xs font-black uppercase tracking-widest hover:underline"
        >
            Reset all missions
        </button>
    </div>
);

export default RestaurantHome;
