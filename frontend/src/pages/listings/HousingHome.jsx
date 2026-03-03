import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import {
    ArrowLeft, Search, SlidersHorizontal, MapPin,
    Star, Navigation, ChevronRight, Loader2,
    X, CheckCircle2, Info, Home
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';

const LOCATION_OPTIONS = ["All", "Nairobi", "Mombasa", "Kisumu", "Kwale", "Laikipia"];
const STATUS_OPTIONS = ["All", "Rent", "Sale"];
const VIBE_OPTIONS = ["All", "Urban", "Serene", "Beachfront", "Nature"];
const TYPE_OPTIONS = ["All", "Apartment", "Mansion", "Bungalow", "Studio"];
const FURNISHING_OPTIONS = ["All", "Furnished", "Unfurnished"];

const HousingHome = () => {
    const navigate = useNavigate();

    // State
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Filters
    const [location, setLocation] = useState('All');
    const [transactionType, setTransactionType] = useState('All');
    const [vibe, setVibe] = useState('All');
    const [propertyType, setPropertyType] = useState('All');
    const [furnishing, setFurnishing] = useState('All');

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
    };

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const params = {};
            if (searchQuery) params.search = searchQuery;
            if (location !== 'All') params.location = location;
            if (vibe !== 'All') params.vibe = vibe;
            if (transactionType !== 'All') params.transaction_type = transactionType;
            if (propertyType !== 'All') params.property_type = propertyType;
            if (furnishing !== 'All') params.furnishing = furnishing;

            const response = await api.get('/api/listings/housing/', { params });
            // Handle both paginated and unpaginated responses
            setProperties(response.data.results || response.data);
        } catch (err) {
            console.error("FETCH HOUSING ERROR:", err);
            showToast("Failed to load properties.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProperties();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, location, transactionType, vibe, propertyType, furnishing]);

    const formatPrice = (price, status) => {
        const numPrice = Number(price);
        if (isNaN(numPrice)) return price;
        const formatted = `KES ${numPrice.toLocaleString()}`;
        return status?.toLowerCase() === 'rent' ? `${formatted} / month` : formatted;
    };

    const PropertyCard = ({ property, index }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => navigate(`/listings/housing/${property.id}`)}
            className="group relative bg-neutral-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-orange-500/20 transition-all shadow-2xl cursor-pointer"
        >
            {/* Image Section */}
            <div className="relative h-72 overflow-hidden bg-neutral-800">
                <img
                    src={property.cover_image}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                    onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"; // Fallback luxury home
                        e.target.onerror = null;
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

                {/* Top Left Badge - Status */}
                {property.status && (
                    <div className={`absolute top-4 left-4 border px-3 py-1.5 rounded-xl shadow-lg
                        ${property.status.toLowerCase() === 'rent'
                            ? 'bg-blue-500/90 border-blue-400 text-white'
                            : 'bg-red-500/90 border-red-400 text-white'}`}
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            FOR {property.status}
                        </span>
                    </div>
                )}

                {/* Top Right Badge - Furnishing */}
                <div className="absolute top-2 right-2 bg-gray-900/80 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                    {property.furnishing ? property.furnishing.toUpperCase() : 'UNFURNISHED'}
                </div>

                {/* Overlay Content */}
                <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-2xl font-black text-white tracking-tight leading-none uppercase truncate">{property.title}</h3>
                    <div className="flex items-center gap-2 mt-2 text-neutral-400">
                        <MapPin size={12} />
                        <span className="text-[10px] font-black uppercase tracking-widest truncate">
                            {property.location} {property.vibe ? `• ${property.vibe}` : ''}
                        </span>
                    </div>
                </div>
            </div>

            {/* Price section */}
            <div className="p-6 space-y-4">
                <div className="flex items-baseline gap-1">
                    <span className="text-white text-xl font-black tracking-tight">{formatPrice(property.price, property.status)}</span>
                </div>

                {property.bedrooms && (
                    <div className="flex items-baseline gap-1">
                        <span className="text-neutral-500 text-[11px] font-bold uppercase tracking-widest text-emerald-400">{property.bedrooms} Beds</span>
                    </div>
                )}
            </div>
        </motion.div>
    );

    const SkeletonCard = () => (
        <div className="bg-neutral-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden animate-pulse">
            <div className="h-72 bg-neutral-800" />
            <div className="p-6 space-y-4">
                <div className="h-8 w-1/2 bg-neutral-800 rounded-lg" />
                <div className="h-6 w-3/4 bg-neutral-800 rounded-lg" />
            </div>
        </div>
    );

    const FilterPill = ({ label, options, selected, onChange }) => (
        <div className="flex flex-col gap-2 min-w-max">
            <span className="text-neutral-500 text-[10px] font-black uppercase tracking-widest px-2">{label}</span>
            <div className="flex gap-2 bg-neutral-900/50 p-1.5 rounded-full border border-white/5">
                {options.map(opt => (
                    <button
                        key={opt}
                        onClick={() => onChange(opt)}
                        className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide transition-all ${selected === opt
                            ? 'bg-orange-500 text-white shadow-lg'
                            : 'text-neutral-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {opt}
                    </button>
                ))}
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
                <div className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-3xl border-b border-white/5 px-6 py-4">
                    <div className="flex items-center gap-4 max-w-2xl mx-auto">
                        <button onClick={() => navigate(-1)} className="p-2 text-neutral-400 hover:text-white transition-colors bg-neutral-900/50 rounded-full border border-white/5">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-lg font-black text-white tracking-tighter uppercase leading-none">Long-Term Housing</h1>
                        <div className="ml-auto w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center border border-orange-500/20">
                            <Home size={18} className="text-orange-500" />
                        </div>
                    </div>
                </div>

                <div className="relative z-10 pt-6 pb-24 space-y-6 max-w-2xl mx-auto">
                    {/* Search Bar - No Horizontal Padding to allow edge-to-edge scroll */}
                    <div className="px-6 relative group">
                        <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-orange-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search neighborhoods or property names..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-neutral-900/80 border border-white/10 rounded-full py-4 pl-14 pr-4 text-white focus:outline-none focus:border-orange-500/50 transition-all font-bold placeholder:text-neutral-600 shadow-inner"
                        />
                    </div>

                    {/* Horizontal Filter Ribbon */}
                    <div className="w-full overflow-x-auto no-scrollbar pb-4 px-6">
                        <div className="flex gap-6 pb-2">
                            <FilterPill label="Location" options={LOCATION_OPTIONS} selected={location} onChange={setLocation} />
                            <FilterPill label="Status" options={STATUS_OPTIONS} selected={transactionType} onChange={setTransactionType} />
                            <FilterPill label="Vibe" options={VIBE_OPTIONS} selected={vibe} onChange={setVibe} />
                            <FilterPill label="Type" options={TYPE_OPTIONS} selected={propertyType} onChange={setPropertyType} />
                            <FilterPill label="Furnishing" options={FURNISHING_OPTIONS} selected={furnishing} onChange={setFurnishing} />
                        </div>
                    </div>

                    {/* Property List */}
                    <div className="px-6 space-y-8">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <SkeletonCard />
                                <SkeletonCard />
                            </div>
                        ) : properties.length > 0 ? (
                            <div className="grid grid-cols-1 gap-8">
                                <AnimatePresence mode='popLayout'>
                                    {properties.map((property, i) => (
                                        <PropertyCard key={property.id} property={property} index={i} />
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="text-center py-20 space-y-4 bg-neutral-900/20 rounded-[3rem] border border-white/5 shadow-inner mx-4">
                                <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mx-auto border border-white/5">
                                    <X size={32} className="text-neutral-500" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-white font-black uppercase tracking-tight">No Properties Found</h3>
                                    <p className="text-neutral-500 text-xs font-bold px-10">We couldn't find any housing matching your current filters.</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setLocation('All');
                                        setTransactionType('All');
                                        setVibe('All');
                                        setPropertyType('All');
                                        setFurnishing('All');
                                        setSearchQuery('');
                                    }}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-orange-500 text-xs font-black uppercase tracking-widest border border-white/10 rounded-full transition-all mt-4"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>

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

export default HousingHome;
