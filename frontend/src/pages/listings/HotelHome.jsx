import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import {
    ArrowLeft, Search, SlidersHorizontal, MapPin,
    Star, Navigation, ChevronRight, Loader2,
    X, CheckCircle2, Info, Building2
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';

const COUNTIES = ["All", "Nairobi", "Mombasa", "Diani", "Maasai Mara", "Naivasha", "Lamu", "Nanyuki"];

const HotelHome = () => {
    const navigate = useNavigate();

    // State
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCounty, setSelectedCounty] = useState('All');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
    };

    const fetchHotels = async () => {
        setLoading(true);
        try {
            const params = {};
            if (searchQuery) params.search = searchQuery;
            if (selectedCounty !== 'All') params.county = selectedCounty;

            const response = await api.get('/api/listings/hotels/', { params });
            setHotels(response.data);
        } catch (err) {
            console.error("FETCH HOTELS ERROR:", err);
            showToast("Failed to load stays.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchHotels();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, selectedCounty]);

    const HotelCard = ({ hotel, index }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => navigate(`/listings/hotels/${hotel.id}`)}
            className="group relative bg-neutral-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-orange-500/20 transition-all shadow-2xl cursor-pointer"
        >
            {/* Image Section */}
            <div className="relative h-72 overflow-hidden bg-neutral-800">
                <img
                    src={hotel.cover_image}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                    onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80";
                        e.target.onerror = null;
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
                    <Star size={14} className="fill-orange-500 text-orange-500" />
                    <span className="text-white text-xs font-black">{hotel.rating}</span>
                </div>

                {/* Overlay Content */}
                <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-2xl font-black text-white tracking-tight leading-none uppercase">{hotel.name}</h3>
                    <div className="flex items-center gap-2 mt-2 text-neutral-400">
                        <MapPin size={12} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{hotel.county}</span>
                    </div>
                </div>

                {/* Directions Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        showToast("Directions feature coming soon!", "info");
                    }}
                    className="absolute bottom-6 right-6 bg-white/10 backdrop-blur-md p-3 rounded-full text-white border border-white/20 active:scale-90 transition-all"
                >
                    <Navigation size={18} />
                </button>
            </div>

            {/* Price & Amenities */}
            <div className="p-6 space-y-4">
                <div className="flex items-baseline gap-1">
                    <span className="text-white text-lg font-black tracking-tight">KES {hotel.price_per_night?.toLocaleString()}</span>
                    <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">/ Night</span>
                </div>

                <div className="flex flex-wrap gap-2">
                    {hotel.amenities?.slice(0, 3).map((amenity, i) => (
                        <div key={i} className="bg-neutral-800/50 border border-white/5 px-3 py-1.5 rounded-xl text-[9px] font-black text-neutral-400 uppercase tracking-widest">
                            {amenity}
                        </div>
                    ))}
                    {hotel.amenities?.length > 3 && (
                        <div className="bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-xl text-[9px] font-black text-orange-500 uppercase tracking-widest">
                            +{hotel.amenities.length - 3} More
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );

    const SkeletonCard = () => (
        <div className="bg-neutral-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden animate-pulse">
            <div className="h-72 bg-neutral-800" />
            <div className="p-6 space-y-4">
                <div className="h-6 w-1/2 bg-neutral-800 rounded-lg" />
                <div className="flex gap-2">
                    <div className="h-6 w-16 bg-neutral-800 rounded-lg" />
                    <div className="h-6 w-16 bg-neutral-800 rounded-lg" />
                </div>
            </div>
        </div>
    );

    return (
        <DashboardLayout>
            <div className="relative min-h-screen bg-neutral-950 overflow-hidden">
                {/* Background Decor */}
                <div className="fixed inset-0 z-0 bg-neutral-900" style={{
                    backgroundImage: 'radial-gradient(circle at 50% -20%, #f9731610, transparent 70%)'
                }} />

                {/* Sticky Header */}
                <div className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-3xl border-b border-white/5 px-6 py-6">
                    <div className="flex items-center gap-4 max-w-lg mx-auto">
                        <button onClick={() => navigate(-1)} className="p-2 text-neutral-400 hover:text-white transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-xl font-black text-white tracking-tighter uppercase leading-none">Stays & Resorts</h1>
                        <div className="ml-auto w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center border border-orange-500/20">
                            <Building2 size={20} className="text-orange-500" />
                        </div>
                    </div>
                </div>

                <div className="relative z-10 px-6 py-8 space-y-8 max-w-lg mx-auto">
                    {/* Search & Filter Bar */}
                    <div className="flex gap-3">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-orange-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search luxury stays..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-neutral-900/50 border border-white/10 rounded-[1.5rem] py-4 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500/50 transition-all font-bold placeholder:text-neutral-600"
                            />
                        </div>
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className={`p-4 rounded-[1.5rem] border transition-all flex items-center justify-center ${selectedCounty !== 'All'
                                    ? 'bg-orange-500 border-orange-500 text-white'
                                    : 'bg-neutral-900/50 border-white/10 text-neutral-400'
                                }`}
                        >
                            <SlidersHorizontal size={20} />
                        </button>
                    </div>

                    {/* Hotel List */}
                    <div className="space-y-8 pb-32">
                        {loading ? (
                            <>
                                <SkeletonCard />
                                <SkeletonCard />
                            </>
                        ) : hotels.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <AnimatePresence mode='popLayout'>
                                    {hotels.map((hotel, i) => (
                                        <HotelCard key={hotel.id} hotel={hotel} index={i} />
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="text-center py-20 space-y-4">
                                <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mx-auto border border-white/5">
                                    <X size={32} className="text-neutral-500" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-white font-black uppercase tracking-tight">No Stays Found</h3>
                                    <p className="text-neutral-500 text-xs font-bold px-10">We couldn't find any resorts matching your current filters.</p>
                                </div>
                                <button
                                    onClick={() => { setSelectedCounty('All'); setSearchQuery(''); }}
                                    className="text-orange-500 text-[10px] font-black uppercase tracking-widest"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Filter Drawer */}
                <AnimatePresence>
                    {isFilterOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsFilterOpen(false)}
                                className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]"
                            />
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed bottom-0 inset-x-0 bg-neutral-950 rounded-t-[3rem] z-[101] border-t border-white/10 p-8 space-y-8 max-w-lg mx-auto"
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="text-white font-black text-2xl tracking-tighter uppercase">Filter Stays</h2>
                                    <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-neutral-900 rounded-full text-neutral-500">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Select County</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {COUNTIES.map(county => (
                                            <button
                                                key={county}
                                                onClick={() => { setSelectedCounty(county); setIsFilterOpen(false); }}
                                                className={`py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${selectedCounty === county
                                                        ? 'bg-orange-500 border-orange-500 text-white'
                                                        : 'bg-neutral-900 border-white/5 text-neutral-500 hover:border-white/20'
                                                    }`}
                                            >
                                                {county}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Toast Component */}
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
                                    toast.type === 'error' ? <Info size={20} /> : <Info size={20} />}
                            </div>
                            <p className="text-white text-xs font-black uppercase tracking-widest truncate">{toast.message}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

export default HotelHome;
