import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Sparkles, Bell, Construction, Hammer, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';

const ServiceComingSoon = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isNotified, setIsNotified] = useState(false);

    // Get service name from state or derive it from path
    const serviceName = location.state?.serviceName ||
        location.pathname.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    // Dynamic Image Mapping based on service
    const serviceImageMap = {
        'Restaurants & Dining': "C:/Users/ADMIN/.gemini/antigravity/brain/e8c80808-cadb-438a-a924-8ef0c19ea956/upscale_nairobi_dining_1771289105674.png",
        'Hotels & Resorts': "C:/Users/ADMIN/.gemini/antigravity/brain/e8c80808-cadb-438a-a924-8ef0c19ea956/diani_luxury_resort_1771289120076.png",
        'BnBs & Short Stays': "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800",
        'Long-Term Housing': "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800",
        'Emergency Services': "C:/Users/ADMIN/.gemini/antigravity/brain/e8c80808-cadb-438a-a924-8ef0c19ea956/emergency_ambulance_kenya_1771289075611.png",
        'Car Hire & Rental': "C:/Users/ADMIN/.gemini/antigravity/brain/e8c80808-cadb-438a-a924-8ef0c19ea956/kenyan_highway_mobility_1771289143905.png",
        'Book a Cab': "C:/Users/ADMIN/.gemini/antigravity/brain/e8c80808-cadb-438a-a924-8ef0c19ea956/nairobi_city_taxi_1771289090074.png",
        'default': "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800"
    };

    const backgroundImage = serviceImageMap[serviceName] || serviceImageMap.default;

    const handleNotify = () => {
        setIsNotified(true);
        // Simulated toast could be added here if a toast context existed
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen w-full relative overflow-y-auto py-20 px-4 md:px-12 flex flex-col items-center justify-center text-center">
                {/* Fixed Background Layer */}
                <div className="fixed inset-0 z-0">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
                        style={{ backgroundImage: `url(${backgroundImage})` }}
                    />
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-[2px]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 mb-8 md:mb-12"
                >
                    {/* Hero Animation Element */}
                    <div className="relative">
                        <motion.div
                            animate={{
                                rotate: [0, 360],
                                borderRadius: ["30%", "50%", "30%"]
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="w-40 h-40 md:w-64 md:h-64 bg-gradient-to-tr from-orange-500/20 via-orange-500/10 to-transparent blur-3xl"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <div className="w-20 h-20 md:w-32 md:h-32 bg-neutral-950 border border-white/10 rounded-[2.5rem] flex items-center justify-center shadow-2xl">
                                    <Hammer className="w-8 h-8 md:w-16 md:h-16 text-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.4)]" />
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Floating icons */}
                    <motion.div
                        animate={{ y: [0, 15, 0], x: [0, 10, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-0 -right-4 p-2 md:p-3 bg-neutral-900 rounded-2xl border border-white/5 shadow-xl text-teal-400"
                    >
                        <Sparkles size={18} className="md:w-5 md:h-5" />
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative z-10 max-w-lg px-4"
                >
                    <h1 className="text-3xl md:text-5xl lg:text-5xl font-black text-white mb-6 tracking-tighter leading-none">
                        {serviceName} <br /> <span className="text-orange-500">Coming Soon.</span>
                    </h1>
                    <p className="text-neutral-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-8">
                        Vetting the best providers for a premium experience
                    </p>
                    <p className="text-neutral-300 font-medium leading-relaxed mb-10 md:mb-12 drop-shadow-lg text-sm md:text-base px-2">
                        We're currently building a world-class experience for our travelers. This feature will be live in the next major update.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <motion.button
                            layout
                            onClick={handleNotify}
                            disabled={isNotified}
                            className={`${isNotified ? 'bg-emerald-500' : 'bg-orange-500 hover:bg-orange-600'
                                } text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto min-w-[200px]`}
                        >
                            {isNotified ? (
                                <>
                                    <CheckCircle2 size={16} />
                                    You're on the list!
                                </>
                            ) : (
                                <>
                                    <Bell size={16} />
                                    Notify Me
                                </>
                            )}
                        </motion.button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
                        >
                            <ArrowLeft size={16} />
                            Go Back
                        </button>
                    </div>
                </motion.div>

                {/* Optional Bottom Toast Simulation */}
                <AnimatePresence>
                    {isNotified && (
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="fixed bottom-10 z-20 bg-neutral-900 border border-white/10 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 mx-4"
                        >
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-white text-[10px] uppercase font-black tracking-widest">
                                We'll email you at launch
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};


export default ServiceComingSoon;

