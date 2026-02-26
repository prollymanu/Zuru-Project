import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import {
    ArrowLeft, Star, MapPin, Waves, Wifi, Sparkles,
    Baby, Dumbbell, Umbrella, Binoculars, Palette,
    Users, Calendar, CheckCircle2, X, Info,
    Utensils, Coffee, CreditCard, Construction,
    Navigation, ChevronRight, Heart, Share2,
    Gem, Trees, Clock, ShieldCheck
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';

const AMENITY_MAP = {
    'Pool': Waves,
    'Swimming Pools': Waves,
    'Infinity Pool': Waves,
    'Spa': Sparkles,
    'Free WiFi': Wifi,
    'Beachfront': Umbrella,
    'Private Beach': Umbrella,
    'Kids Club': Baby,
    'Gym': Dumbbell,
    'Butler Service': ShieldCheck,
    'Safari Drives': Binoculars,
    'Art Gallery': Palette,
    'Water Sports': Waves,
    'Horseback Riding': Trees,
    'Boat Rides': Navigation,
    'Rooftop Pool': Waves,
    'Eco-friendly': Trees,
};

const HotelDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingModal, setBookingModal] = useState({ isOpen: false, type: 'STAY' });
    const [bookingData, setBookingData] = useState({ date: '', guests: 2 });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
    };

    useEffect(() => {
        const fetchHotel = async () => {
            try {
                const response = await api.get(`/api/listings/hotels/${id}/`);
                setHotel(response.data);
            } catch (err) {
                console.error("FETCH HOTEL ERROR:", err);
                showToast("Hotel not found.", "error");
                setTimeout(() => navigate('/listings/hotels'), 2000);
            } finally {
                setLoading(false);
            }
        };
        fetchHotel();
    }, [id, navigate]);

    const handleBooking = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/api/listings/hotels/book/', {
                hotel_id: id,
                type: bookingModal.type,
                ...bookingData
            });
            showToast("Booking request sent successfully!", "success");
            setBookingModal({ isOpen: false, type: 'STAY' });
        } catch (err) {
            showToast("Failed to process booking.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-2 border-orange-500/20 border-t-orange-500 rounded-full"
                />
            </div>
        );
    }

    if (!hotel) return null;

    const today = new Date().toISOString().split('T')[0];

    return (
        <DashboardLayout>
            <div className="relative min-h-screen bg-neutral-950 pb-32">
                {/* Hero Gallery Carousel */}
                <div className="relative h-[45vh] md:h-[60vh] overflow-hidden">
                    <div className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide no-scrollbar">
                        {[hotel.cover_image, ...(hotel.gallery || [])].map((img, i) => (
                            <div key={i} className="min-w-full h-full snap-center">
                                <img
                                    src={img}
                                    alt={`${hotel.name} ${i}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200";
                                        e.target.onerror = null;
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Hero Overlays */}
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-neutral-950 to-transparent" />

                    {/* Floating Controls */}
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-6 left-6 p-3 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl text-white active:scale-90 transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="absolute bottom-10 left-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-orange-500 px-3 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                                <Star size={12} className="fill-white text-white" />
                                <span className="text-white text-xs font-black">{hotel.rating}</span>
                            </div>
                            <span className="text-white/60 text-xs font-bold uppercase tracking-widest">{hotel.total_reviews} Reviews</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">{hotel.name}</h1>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="px-6 py-10 space-y-12 max-w-lg mx-auto md:max-w-4xl">
                    {/* Location & Description */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-orange-500">
                            <MapPin size={16} />
                            <span className="font-black text-xs uppercase tracking-widest">{hotel.county}, Kenya</span>
                        </div>
                        <p className="text-neutral-400 text-sm leading-relaxed font-medium">
                            {hotel.description}
                        </p>
                    </section>

                    {/* Amenities Grid */}
                    <section className="space-y-6">
                        <h2 className="text-white font-black text-xs uppercase tracking-[0.3em]">Amenities & Features</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {hotel.amenities?.map((amenity, i) => {
                                const Icon = AMENITY_MAP[amenity] || Gem;
                                return (
                                    <div key={i} className="bg-neutral-900/50 border border-white/5 p-4 rounded-3xl flex flex-col items-center justify-center gap-3 text-center">
                                        <div className="p-3 bg-white/5 rounded-2xl text-orange-500">
                                            <Icon size={20} />
                                        </div>
                                        <span className="text-[10px] text-neutral-400 font-black uppercase tracking-widest leading-tight">{amenity}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Dining Highlights */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Utensils size={18} className="text-orange-500" />
                            <h2 className="text-white font-black text-xs uppercase tracking-[0.3em]">Dining Experience</h2>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {hotel.food_types?.map((food, i) => (
                                <div key={i} className="bg-neutral-900 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-2">
                                    <Coffee size={14} className="text-neutral-500" />
                                    <span className="text-white text-[10px] font-black uppercase tracking-widest">{food}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Day Pass Highlighting Card */}
                    {hotel.day_pass_price > 0 && (
                        <section className="relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-neutral-900 rounded-[2.5rem]" />
                            <div className="relative border border-orange-500/30 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-orange-500 mb-1">
                                        <Clock size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Day Experience</span>
                                    </div>
                                    <h3 className="text-white text-xl font-black uppercase tracking-tight">Non-Guest Day Pass</h3>
                                    <p className="text-neutral-400 text-xs font-medium max-w-xs">Full access to swimming pools, gym, beach areas, and resort gardens for the entire day.</p>
                                </div>
                                <div className="text-center md:text-right">
                                    <p className="text-3xl font-black text-white tracking-tighter">KES {hotel.day_pass_price.toLocaleString()}</p>
                                    <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mt-1">Per Person / Day</p>
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                {/* Sticky Dual Booking Bar */}
                <div className="fixed bottom-0 inset-x-0 z-[60] bg-neutral-950/80 backdrop-blur-3xl border-t border-white/5 px-6 py-6 lg:py-8 lg:px-12">
                    <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                        <div className="hidden sm:block">
                            <p className="text-neutral-500 text-[9px] font-black uppercase tracking-widest">Starting from</p>
                            <p className="text-white text-xl font-black">KES {hotel.price_per_night?.toLocaleString()} <span className="text-[10px] text-neutral-500">/ night</span></p>
                        </div>

                        <div className="flex-1 flex gap-3 max-w-sm ml-auto">
                            {hotel.day_pass_price > 0 && (
                                <button
                                    onClick={() => setBookingModal({ isOpen: true, type: 'DAY_PASS' })}
                                    className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-[1.25rem] py-4 text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Day Pass
                                </button>
                            )}
                            <button
                                onClick={() => setBookingModal({ isOpen: true, type: 'STAY' })}
                                className="flex-[2] bg-orange-500 hover:bg-orange-600 text-white rounded-[1.25rem] py-4 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
                            >
                                Book a Room
                            </button>
                        </div>
                    </div>
                </div>

                {/* Booking Modal */}
                <AnimatePresence>
                    {bookingModal.isOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setBookingModal({ isOpen: false, type: 'STAY' })}
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
                                    <div className="space-y-1">
                                        <h2 className="text-white font-black text-2xl tracking-tighter uppercase">
                                            {bookingModal.type === 'STAY' ? 'Reserve Your Stay' : 'Book a Day Pass'}
                                        </h2>
                                        <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">{hotel.name}</p>
                                    </div>
                                    <button onClick={() => setBookingModal({ isOpen: false, type: 'STAY' })} className="p-2 bg-neutral-900 rounded-full text-neutral-500">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleBooking} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="bg-neutral-900/50 border border-white/5 p-4 rounded-3xl space-y-2">
                                            <label className="text-neutral-500 text-[9px] font-black uppercase tracking-widest ml-2 flex items-center gap-2">
                                                <Calendar size={12} /> Date of {bookingModal.type === 'STAY' ? 'Check-in' : 'Visit'}
                                            </label>
                                            <input
                                                type="date"
                                                min={today}
                                                required
                                                value={bookingData.date}
                                                onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                                                className="w-full bg-transparent text-white font-bold p-2 focus:outline-none [color-scheme:dark]"
                                            />
                                        </div>

                                        <div className="bg-neutral-900/50 border border-white/5 p-4 rounded-3xl space-y-2">
                                            <label className="text-neutral-500 text-[9px] font-black uppercase tracking-widest ml-2 flex items-center gap-2">
                                                <Users size={12} /> Number of Guests
                                            </label>
                                            <div className="flex items-center justify-between px-2">
                                                <span className="text-white font-black text-lg">{bookingData.guests}</span>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setBookingData({ ...bookingData, guests: Math.max(1, bookingData.guests - 1) })}
                                                        className="w-10 h-10 bg-neutral-800 rounded-xl flex items-center justify-center text-white"
                                                    >-</button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setBookingData({ ...bookingData, guests: Math.min(10, bookingData.guests + 1) })}
                                                        className="w-10 h-10 bg-neutral-800 rounded-xl flex items-center justify-center text-white"
                                                    >+</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex items-start gap-3">
                                        <Info size={16} className="text-orange-500 shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-orange-500/80 font-bold leading-relaxed uppercase tracking-wider">
                                            Our concierge will call you within 15 minutes to confirm availability and finalize payment details.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-800 text-white rounded-[1.5rem] py-5 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                                <X size={16} className="rotate-45" />
                                            </motion.div>
                                        ) : (
                                            <>Confirm Booking Request</>
                                        )}
                                    </button>
                                </form>
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
                            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 bg-neutral-900 border border-white/10 px-6 py-4 rounded-3xl shadow-2xl min-w-[280px]"
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

export default HotelDetail;
