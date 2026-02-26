import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import {
    ArrowLeft, Star, Clock, MapPin,
    ShieldCheck, Users, Wine, GlassWater,
    Instagram, Facebook, X, Calendar,
    UserPlus, Loader2, CheckCircle2, AlertTriangle,
    Info, ChevronRight
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getRestaurantStatus } from '../../utils/timeHelpers';

const RestaurantDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);

    // Reservation State
    const [resData, setResData] = useState({
        date: '',
        time: '',
        guests: 2
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reservationError, setReservationError] = useState(null);

    // Toast State
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
    };

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/api/listings/restaurants/${id}/`);
                setRestaurant(response.data);
            } catch (err) {
                console.error("FETCH ERROR:", err);
                setError("Failed to load restaurant details.");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const handleReserve = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setReservationError(null);

        // Client-side validation: Prevent past time for today
        const todayStr = new Date().toISOString().split('T')[0];
        if (resData.date === todayStr) {
            const currentTime = new Date().toTimeString().slice(0, 5);
            if (resData.time < currentTime) {
                setReservationError("You cannot make a reservation in the past.");
                setIsSubmitting(false);
                return;
            }
        }

        try {
            const response = await api.post('/api/listings/restaurants/reserve/', {
                restaurant_id: id,
                ...resData
            });
            if (response.data.status === 'success') {
                showToast("Reservation sent successfully!", "success");
                setTimeout(() => {
                    setIsReserveModalOpen(false);
                    setResData({ date: '', time: '', guests: 2 });
                }, 1500);
            }
        } catch (err) {
            console.error("RESERVE ERROR:", err);
            if (err.response && err.response.status === 400) {
                setReservationError(err.response.data.error || "Invalid reservation time or details.");
            } else {
                showToast("Failed to send reservation.", "error");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                <p className="text-neutral-500 font-black text-xs uppercase tracking-widest">Infiltrating Kitchen...</p>
            </div>
        </DashboardLayout>
    );

    if (error || !restaurant) return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-6">
                <AlertTriangle size={48} className="text-red-500" />
                <h2 className="text-white font-black text-xl uppercase tracking-tight">{error || "Mission Aborted"}</h2>
                <button
                    onClick={() => navigate('/listings/restaurants')}
                    className="bg-white text-black px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest"
                >
                    Back to Base
                </button>
            </div>
        </DashboardLayout>
    );

    const is247 = restaurant.hours === '24/7';

    return (
        <DashboardLayout>
            <div className="relative min-h-screen bg-neutral-950 pb-32">
                {/* Hero Section */}
                <div className="relative h-[25rem] w-full overflow-hidden bg-neutral-900">
                    <img
                        src={restaurant.cover_image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80"}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80";
                            e.target.onerror = null;
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-6 left-6 p-3 bg-black/50 backdrop-blur-xl rounded-full text-white border border-white/10 active:scale-90 transition-transform"
                    >
                        <ArrowLeft size={20} />
                    </button>
                </div>

                {/* Main Content */}
                <div className="relative -mt-20 px-6 space-y-8 z-10">
                    {/* Header Info */}
                    <div className="bg-neutral-900/80 backdrop-blur-2xl border border-white/5 p-8 rounded-[3rem] shadow-2xl space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">{restaurant.name}</h1>
                                <p className="text-orange-500 text-xs font-black uppercase tracking-widest">{restaurant.cuisine_type} • {restaurant.county}</p>
                            </div>
                            <div className="flex items-center gap-2 bg-orange-500 px-3 py-1.5 rounded-xl">
                                <Star size={14} className="fill-white text-white" />
                                <span className="text-white text-sm font-black">{restaurant.rating}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                            <div className="flex items-center gap-2 text-neutral-400">
                                <Clock size={16} className="text-neutral-500" />
                                <span className={`text-xs font-bold ${getRestaurantStatus(restaurant.hours).isOpen ? 'text-green-500' : 'text-red-500'}`}>
                                    {getRestaurantStatus(restaurant.hours).statusText}
                                </span>
                            </div>
                            {getRestaurantStatus(restaurant.hours).isOpen && (
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-neutral-400 ml-auto">
                                <MapPin size={16} className="text-neutral-500" />
                                <span className="text-xs font-bold">{restaurant.address}</span>
                            </div>
                        </div>
                    </div>

                    {/* Industry Badges */}
                    <div className="flex flex-wrap gap-3">
                        {restaurant.is_halal && (
                            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2.5 rounded-2xl text-green-500">
                                <ShieldCheck size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Halal Certified</span>
                            </div>
                        )}
                        {restaurant.kids_friendly && (
                            <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2.5 rounded-2xl text-blue-500">
                                <Users size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Family Friendly</span>
                            </div>
                        )}
                        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl ${restaurant.serves_alcohol
                            ? 'bg-purple-500/10 border border-purple-500/20 text-purple-500'
                            : 'bg-neutral-800 border border-white/5 text-neutral-400'
                            }`}>
                            {restaurant.serves_alcohol ? <Wine size={16} /> : <GlassWater size={16} />}
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {restaurant.serves_alcohol ? "Serves Alcohol" : "Alcohol-Free"}
                            </span>
                        </div>
                    </div>

                    {/* Galleries */}
                    <div className="space-y-10">
                        {/* Ambiance */}
                        <div className="space-y-4">
                            <h3 className="text-white text-xs font-black uppercase tracking-[0.3em] ml-2">Ambiance Gallery</h3>
                            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-2 snap-x">
                                {restaurant.ambiance_photos?.map((photo, i) => (
                                    <div key={i} className="min-w-[18rem] h-48 rounded-[2rem] overflow-hidden border border-white/10 snap-center shadow-xl bg-neutral-900">
                                        <img
                                            src={photo}
                                            alt="Ambiance"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80";
                                                e.target.onerror = null;
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Menu Highlights */}
                        <div className="space-y-4">
                            <h3 className="text-white text-xs font-black uppercase tracking-[0.3em] ml-2">Menu Highlights</h3>
                            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-2 snap-x">
                                {restaurant.menu_photos?.map((photo, i) => (
                                    <div key={i} className="min-w-[14rem] h-48 rounded-[2rem] overflow-hidden border border-white/10 snap-center shadow-xl relative group bg-neutral-900">
                                        <img
                                            src={photo}
                                            alt="Menu"
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            onError={(e) => {
                                                e.target.src = "https://images.unsplash.com/photo-1529692236671-f1f6e9460272?auto=format&fit=crop&w=800&q=80";
                                                e.target.onerror = null;
                                            }}
                                        />
                                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                            <div className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center ml-auto">
                                                <ChevronRight size={16} className="text-white" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="flex flex-col items-center py-10 space-y-6 border-t border-white/5">
                        <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Follow the Flavor</p>
                        <div className="flex gap-8">
                            <button
                                onClick={() => showToast("Social media integration coming soon!", "info")}
                                className="p-4 bg-neutral-900/50 rounded-2xl text-neutral-400 hover:text-white transition-colors border border-white/5 hover:border-orange-500/30"
                            >
                                <Instagram size={24} />
                            </button>
                            <button
                                onClick={() => showToast("Social media integration coming soon!", "info")}
                                className="p-4 bg-neutral-900/50 rounded-2xl text-neutral-400 hover:text-white transition-colors border border-white/5 hover:border-orange-500/30"
                            >
                                <Facebook size={24} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sticky Bottom Bar */}
                <div className="fixed bottom-0 inset-x-0 bg-neutral-950/80 backdrop-blur-3xl border-t border-white/5 p-6 z-[90]">
                    <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                        <div className="hidden md:block">
                            <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Recommended for you</p>
                            <p className="text-white text-sm font-black uppercase">{restaurant.name}</p>
                        </div>
                        <button
                            onClick={() => setIsReserveModalOpen(true)}
                            className="flex-1 bg-white text-black py-4 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-2"
                        >
                            Make a Reservation
                        </button>
                    </div>
                </div>

                {/* Reservation Modal */}
                <AnimatePresence>
                    {isReserveModalOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsReserveModalOpen(false)}
                                className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]"
                            />
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed bottom-0 inset-x-0 bg-neutral-950 rounded-t-[3rem] z-[101] border-t border-white/10 p-8 space-y-8 max-w-2xl mx-auto"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h2 className="text-white font-black text-2xl tracking-tighter uppercase">Reserve a Table</h2>
                                        <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Secure your spot at {restaurant.name}</p>
                                    </div>
                                    <button
                                        onClick={() => { setIsReserveModalOpen(false); setReservationError(null); }}
                                        className="p-2 bg-neutral-900 rounded-full text-neutral-500 hover:text-white transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                {reservationError && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500"
                                    >
                                        <AlertTriangle size={18} />
                                        <p className="text-[10px] font-black uppercase tracking-widest">{reservationError}</p>
                                    </motion.div>
                                )}

                                <form onSubmit={handleReserve} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest ml-1">Select Date</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={18} />
                                                <input
                                                    type="date"
                                                    required
                                                    min={new Date().toISOString().split('T')[0]}
                                                    value={resData.date}
                                                    onChange={(e) => setResData({ ...resData, date: e.target.value })}
                                                    className="w-full bg-neutral-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500/50 transition-all text-sm font-bold appearance-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest ml-1">Select Time</label>
                                            <div className="relative">
                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={18} />
                                                <input
                                                    type="time"
                                                    required
                                                    value={resData.time}
                                                    onChange={(e) => setResData({ ...resData, time: e.target.value })}
                                                    className="w-full bg-neutral-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500/50 transition-all text-sm font-bold appearance-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest ml-1">Number of Guests</label>
                                        <div className="relative">
                                            <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={18} />
                                            <select
                                                value={resData.guests}
                                                onChange={(e) => setResData({ ...resData, guests: parseInt(e.target.value) })}
                                                className="w-full bg-neutral-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500/50 transition-all text-sm font-bold appearance-none"
                                            >
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map(num => (
                                                    <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-orange-500 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-orange-600 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                Confirming...
                                            </>
                                        ) : (
                                            <>Confirm Reservation</>
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Toasts */}
                <AnimatePresence>
                    {toast.show && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 bg-neutral-900 border border-white/10 px-6 py-4 rounded-3xl shadow-2xl min-w-[280px]"
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

                <style dangerouslySetInnerHTML={{
                    __html: `
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .no-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}} />
            </div>
        </DashboardLayout>
    );
};

export default RestaurantDetail;
