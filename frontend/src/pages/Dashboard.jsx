import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Wallet, Utensils, Sunset, BedDouble,
    Home, Key, Shirt, CarTaxiFront, X, Bell,
    Sparkles, Info, Scale, Siren, Loader2
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingService, setLoadingService] = useState(null);

    const handleImageError = (e) => {
        e.target.src = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800";
    };

    const services = [
        {
            title: "Digital Wallet",
            icon: Wallet,
            color: "from-purple-500 to-indigo-600",
            image: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            path: "/wallet"
        },
        {
            title: "Restaurants & Dining",
            icon: Utensils,
            color: "from-orange-500 to-red-600",
            image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            path: "/listings/restaurants"
        },
        {
            title: "Hotels & Resorts",
            icon: Sunset,
            color: "from-cyan-500 to-blue-600",
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            path: "/listings/hotels"
        },
        {
            title: "BnBs & Short Stays",
            icon: BedDouble,
            color: "from-rose-500 to-pink-600",
            image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            path: "/short-stays"
        },
        {
            title: "Long-Term Housing",
            icon: Home,
            color: "from-emerald-500 to-teal-600",
            image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
            path: "/housing"
        },
        {
            title: "Emergency Services",
            icon: Siren,
            color: "from-red-600 to-rose-700",
            image: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            path: "/emergency"
        },
        {
            title: "Legal Services",
            icon: Scale,
            color: "from-indigo-500 to-blue-600",
            image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
            path: "/legal"
        },
        {
            title: "Car Hire & Rental",
            icon: Key,
            color: "from-slate-500 to-zinc-600",
            image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            path: "/car-hire"
        },
        {
            title: "Laundry & Dry Cleaning",
            icon: Shirt,
            color: "from-blue-500 to-sky-600",
            image: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=800&q=80",
            path: "/laundry"
        },
        {
            title: "Book a Cab",
            icon: CarTaxiFront,
            color: "from-yellow-400 to-orange-500",
            image: "https://images.unsplash.com/photo-1556122071-e404be745793?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            path: "/cabs"
        },
    ];

    const handleServiceClick = (service) => {
        setIsLoading(true);
        setLoadingService(service);

        // Simulating processing delay for "Heavy" deliberate feel
        setTimeout(() => {
            navigate(service.path, { state: { serviceName: service.title } });
        }, 900);
    };

    return (
        <DashboardLayout>
            {/* Immersive Zuru Loader Overlay */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative flex flex-col items-center"
                        >
                            {/* Animated Rings */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="w-32 h-32 border-2 border-orange-500/20 rounded-full border-t-orange-500 shadow-[0_0_50px_rgba(249,115,22,0.2)]"
                            />

                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${loadingService?.color} flex items-center justify-center text-white shadow-2xl`}
                                >
                                    {loadingService && <loadingService.icon className="w-6 h-6" strokeWidth={2.5} />}
                                </motion.div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mt-8 text-center"
                            >
                                <h2 className="text-white font-black text-xl tracking-tighter uppercase mb-2">
                                    Initializing {loadingService?.title}...
                                </h2>
                                <div className="flex items-center justify-center gap-2 text-neutral-500 font-bold text-[10px] tracking-[0.2em] uppercase">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span>Syncing with Mission Control</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-8 pb-10 px-2 sm:px-0">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-1"
                >
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                        Habari, {user?.full_name?.split(' ')[0] || "Traveler"}.
                    </h1>
                    <p className="text-neutral-500 font-black uppercase tracking-[0.3em] text-[10px]">
                        {user?.is_in_kenya ? "Kenyan Mission Control" : "Voyage Preparation"}
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                    <AnimatePresence>
                        {services.map((s, i) => (
                            <motion.div
                                key={s.title}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ y: -8 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleServiceClick(s)}
                                className="group relative h-40 md:h-52 rounded-[2rem] overflow-hidden cursor-pointer shadow-2xl transition-all duration-500"
                            >
                                {/* Background Image with Zoom */}
                                <motion.img
                                    src={s.image}
                                    alt={s.title}
                                    onError={handleImageError}
                                    className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700 ease-out"
                                />

                                {/* Depth Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />

                                {/* Highlight Border */}
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:via-white/50 transition-all duration-300" />

                                {/* Content */}
                                <div className="relative z-10 p-5 md:p-6 h-full flex flex-col justify-between">
                                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-xl group-hover:rotate-[10deg] transition-transform duration-500`}>
                                        <s.icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                                    </div>

                                    <div>
                                        <h3 className="text-sm md:text-lg font-black text-white leading-tight tracking-tight">
                                            {s.title}
                                        </h3>
                                        <p className="text-[10px] md:text-xs text-neutral-400 font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                            Access Service
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;

