import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import {
    ArrowLeft, MapPin, CheckCircle2, X, Info,
    Home, Shield, ShieldCheck, Map, PhoneCall,
    CalendarDays, Clock, Route, CheckSquare
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';

const HousingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);

    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [bookingData, setBookingData] = useState({ date: '', time: 'Morning', phone: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 4000);
    };

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const response = await api.get(`/api/listings/housing/${id}/`);
                setProperty(response.data);
            } catch (err) {
                console.error("FETCH HOUSING DETAIL ERROR:", err);
                showToast("Property not found.", "error");
                setTimeout(() => navigate('/listings/housing'), 2000);
            } finally {
                setLoading(false);
            }
        };
        fetchProperty();
    }, [id, navigate]);

    // The original code did not have a top carousel, it used cover_image directly.
    // The galleryRef, handleScroll, and currentImageIndex states/functions
    // were not present in the provided code snippet for a top carousel.
    // The "Property Gallery Grid" section already uses a CSS grid.
    // Therefore, no changes are needed based on the textual instruction.

    const handleBooking = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/api/listings/housing/book-tour/', {
                property_id: id,
                ...bookingData
            });
            showToast("Viewing scheduled! An agent will contact you shortly.", "success");
            setBookingModalOpen(false);
            setBookingData({ date: '', time: 'Morning', phone: '' }); // Reset form
        } catch (err) {
            console.error("BOOKING ERROR:", err);
            showToast("Failed to schedule viewing. Please try again.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatPrice = (price, status) => {
        const numPrice = Number(price);
        if (isNaN(numPrice)) return price;
        const formatted = `KES ${numPrice.toLocaleString()}`;
        return status?.toLowerCase() === 'rent' ? `${formatted} / month` : formatted;
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

    if (!property) return null;

    const today = new Date().toISOString().split('T')[0];

    return (
        <DashboardLayout>
            <div className="relative min-h-screen bg-neutral-950 pb-32">
                {/* Hero Cover Image */}
                <div className="relative h-[50vh] md:h-[65vh] overflow-hidden">
                    <img
                        src={property.cover_image}
                        alt={property.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80"; // Fallback luxury home
                            e.target.onerror = null;
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

                    {/* Floating Controls */}
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-6 left-6 p-3 bg-black/30 backdrop-blur-xl border border-white/10 rounded-full text-white active:scale-95 transition-all shadow-lg z-10 hover:bg-black/50"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    {/* Badge Overlay */}
                    {property.status && (
                        <div className={`absolute top-6 right-6 px-4 py-2 rounded-full border shadow-2xl z-10 backdrop-blur-sm
                            ${property.status.toLowerCase() === 'rent'
                                ? 'bg-blue-500/90 border-blue-400 text-white'
                                : 'bg-red-500/90 border-red-400 text-white'}`}
                        >
                            <span className="text-xs font-black uppercase tracking-widest">
                                FOR {property.status}
                            </span>
                        </div>
                    )}
                </div>

                {/* Content Sections */}
                <div className="px-6 py-8 space-y-10 max-w-lg mx-auto md:max-w-4xl relative -mt-8 z-20">

                    {/* Header Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-neutral-400">
                            <MapPin size={16} className="text-orange-500" />
                            <span className="font-black text-[11px] uppercase tracking-widest truncate">{property.location}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                            {property.title}
                        </h1>
                        <p className="text-3xl font-black text-white tracking-tighter">
                            {formatPrice(property.price, property.status)}
                        </p>
                    </div>

                    {/* Tags Row */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                        {property.property_type && (
                            <span className="bg-neutral-900 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-neutral-300">
                                {property.property_type}
                            </span>
                        )}
                        {property.vibe && (
                            <span className="bg-neutral-900 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-orange-400/90">
                                {property.vibe}
                            </span>
                        )}
                        <span className="bg-neutral-900 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-400/90">
                            {property.furnishing ? property.furnishing.toUpperCase() : 'UNFURNISHED'}
                        </span>
                        {property.bedrooms && (
                            <span className="bg-neutral-900 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-neutral-300">
                                {property.bedrooms} Beds
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    <section className="space-y-4">
                        <h2 className="text-white font-black text-xs uppercase tracking-[0.3em]">About the Property</h2>
                        <p className="text-neutral-400 text-sm leading-relaxed font-medium">
                            {property.description}
                        </p>
                    </section>

                    {/* Property Gallery Grid */}
                    {property.gallery && property.gallery.length > 0 && (
                        <section className="space-y-6">
                            <h2 className="text-white font-black text-xs uppercase tracking-[0.3em]">Interior Gallery</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {property.gallery.map((img, i) => (
                                    <div key={i} className={`relative rounded-[1.5rem] overflow-hidden shadow-xl bg-neutral-900 ${i === 0 && property.gallery.length % 2 !== 0 ? 'col-span-2 md:col-span-2 h-64' : 'h-40 md:h-56'}`}>
                                        <img
                                            src={img}
                                            alt={`Interior ${i + 1}`}
                                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-700 ease-out"
                                            onError={(e) => {
                                                e.target.src = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"; // Fallback luxury home
                                                e.target.onerror = null;
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Location & Access */}
                    {property.distance_to_tarmac && (
                        <section className="relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/40 to-neutral-900 rounded-[2rem]" />
                            <div className="relative border border-white/10 p-6 rounded-[2rem] flex items-center gap-5">
                                <div className="p-4 bg-orange-500/10 rounded-2xl flex-shrink-0">
                                    <Route size={24} className="text-orange-500" />
                                </div>
                                <div>
                                    <h3 className="text-white text-sm font-black uppercase tracking-widest mb-1">Access & Proximity</h3>
                                    <p className="text-neutral-400 text-xs font-bold leading-relaxed">
                                        Located approx <span className="text-orange-400">{property.distance_to_tarmac}</span> from the main tarmac road, ensuring quiet residency while remaining highly accessible.
                                    </p>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Security Details */}
                    {property.security_features && property.security_features.length > 0 && (
                        <section className="space-y-6 bg-neutral-900/40 border border-white/5 p-6 md:p-8 rounded-[2rem]">
                            <div className="flex items-center gap-3 mb-2">
                                <ShieldCheck size={20} className="text-emerald-500" />
                                <h2 className="text-white font-black text-xs uppercase tracking-[0.3em]">Security Features</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {property.security_features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3 bg-neutral-900 border border-white/5 p-4 rounded-2xl">
                                        <Shield size={16} className="text-emerald-500/80 shrink-0 mt-0.5" />
                                        <span className="text-xs text-neutral-300 font-bold tracking-wide">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Amenities Grid */}
                    {property.amenities && property.amenities.length > 0 && (
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <Home size={18} className="text-orange-500" />
                                <h2 className="text-white font-black text-xs uppercase tracking-[0.3em]">Property Amenities</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {property.amenities.map((amenity, i) => (
                                    <div key={i} className="bg-neutral-900 border border-white/5 px-4 py-3 rounded-2xl flex items-center gap-2">
                                        <CheckSquare size={14} className="text-orange-500 shrink-0" />
                                        <span className="text-white text-[10px] font-black uppercase tracking-widest leading-tight">{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sticky Booking Bar */}
                <div className="fixed bottom-0 inset-x-0 z-[60] bg-neutral-950/90 backdrop-blur-xl border-t border-white/10 px-6 py-6 lg:py-8 lg:px-12">
                    <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
                        <div className="hidden md:block flex-shrink-0">
                            <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Pricing Strategy</p>
                            <p className="text-white text-xl font-black truncate">{formatPrice(property.price, property.status)}</p>
                        </div>
                        <button
                            onClick={() => setBookingModalOpen(true)}
                            className="w-full md:w-auto flex-1 md:max-w-xs bg-orange-500 hover:bg-orange-600 text-white rounded-full py-4 px-8 text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <PhoneCall size={16} />
                            Schedule a Viewing
                        </button>
                    </div>
                </div>

                {/* Booking Modal */}
                <AnimatePresence>
                    {bookingModalOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setBookingModalOpen(false)}
                                className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100]"
                            />
                            <motion.div
                                initial={{ y: '100%', opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: '100%', opacity: 0 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed bottom-0 inset-x-0 bg-neutral-900 rounded-t-[2.5rem] z-[101] border-t border-white/10 p-8 pt-10 space-y-8 max-w-lg mx-auto shadow-2xl"
                            >
                                <div className="flex items-start justify-between border-b border-white/5 pb-6">
                                    <div className="space-y-1">
                                        <h2 className="text-white font-black text-2xl tracking-tighter uppercase mb-2">
                                            Request a Viewing
                                        </h2>
                                        <p className="text-neutral-400 text-xs font-bold leading-relaxed pr-8">
                                            When would you like to see <span className="text-orange-400">{property.title}?</span>
                                        </p>
                                    </div>
                                    <button onClick={() => setBookingModalOpen(false)} className="p-2 bg-neutral-800 hover:bg-neutral-700 transition-colors rounded-full text-neutral-400 mt-1">
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleBooking} className="space-y-6">

                                    {/* Date */}
                                    <div className="bg-neutral-950 border border-white/5 p-4 rounded-2xl group focus-within:border-orange-500/50 transition-colors">
                                        <label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-2 ml-1">
                                            <CalendarDays size={14} className="text-orange-500" /> Dedicated Date
                                        </label>
                                        <input
                                            type="date"
                                            min={today}
                                            required
                                            value={bookingData.date}
                                            onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                                            className="w-full bg-transparent text-white font-bold p-2 focus:outline-none [color-scheme:dark] placeholder-neutral-600"
                                        />
                                    </div>

                                    {/* Time Select */}
                                    <div className="bg-neutral-950 border border-white/5 p-4 rounded-2xl group focus-within:border-orange-500/50 transition-colors">
                                        <label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-2 ml-1">
                                            <Clock size={14} className="text-orange-500" /> Preferred Time Slot
                                        </label>
                                        <select
                                            value={bookingData.time}
                                            onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                                            className="w-full bg-transparent text-white font-bold p-2 focus:outline-none appearance-none outline-none"
                                        >
                                            <option value="Morning" className="bg-neutral-900 text-white font-bold py-2">Morning (8am - 12pm)</option>
                                            <option value="Afternoon" className="bg-neutral-900 text-white font-bold py-2">Afternoon (1pm - 4pm)</option>
                                            <option value="Evening" className="bg-neutral-900 text-white font-bold py-2">Evening (4pm - 6pm)</option>
                                        </select>
                                    </div>

                                    {/* Phone */}
                                    <div className="bg-neutral-950 border border-white/5 p-4 rounded-2xl group focus-within:border-orange-500/50 transition-colors">
                                        <label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-2 ml-1">
                                            <PhoneCall size={14} className="text-orange-500" /> Phone Number (For Agent)
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="+254 7XX XXX XXX"
                                            value={bookingData.phone}
                                            onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                                            className="w-full bg-transparent text-white font-bold p-2 focus:outline-none placeholder:text-neutral-600"
                                        />
                                    </div>

                                    <div className="bg-orange-500/10 border border-orange-500/20 px-4 py-3 rounded-xl flex items-start gap-3">
                                        <Info size={16} className="text-orange-500 shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-orange-400/90 font-bold leading-relaxed uppercase tracking-widest pr-4">
                                            An agent will quickly contact you to confirm and arrange property access logic.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-800 text-white rounded-full py-5 text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                                <X size={16} className="rotate-45" />
                                            </motion.div>
                                        ) : (
                                            <>Submit Booking</>
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
                            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 bg-neutral-900 border border-white/10 px-6 py-4 rounded-3xl shadow-2xl min-w-[300px]"
                        >
                            <div className={`p-2 rounded-xl bg-opacity-10 shrink-0 ${toast.type === 'success' ? 'bg-green-500 text-green-500' :
                                toast.type === 'error' ? 'bg-red-500 text-red-500' : 'bg-orange-500 text-orange-500'
                                }`}>
                                {toast.type === 'success' ? <CheckCircle2 size={20} /> :
                                    toast.type === 'error' ? <Info size={20} /> : <Info size={20} />}
                            </div>
                            <p className="text-white text-[10px] font-black uppercase tracking-widest">{toast.message}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

export default HousingDetail;
