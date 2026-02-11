import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Car, Utensils, Mountain, PartyPopper, Scale, Ambulance, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const user = { name: "Traveler" }; // Placeholder

    const services = [
        { title: "My Wallet", icon: Wallet, color: "from-orange-500 to-red-500" },
        { title: "Book a Cab", icon: Car, color: "from-blue-500 to-indigo-500" },
        { title: "Order Food", icon: Utensils, color: "from-pink-500 to-rose-500" },
        { title: "Safari Packages", icon: Mountain, color: "from-green-500 to-lime-500" },
        { title: "Nightlife", icon: PartyPopper, color: "from-purple-500 to-violet-500" },
        { title: "Legal Aid", icon: Scale, color: "from-yellow-500 to-amber-500" },
        { title: "Emergency", icon: Ambulance, color: "from-red-500 to-red-700" },
    ];

    return (
        <div className="min-h-screen bg-neutral-950 text-white font-sans p-6 md:p-12">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-teal-400 mb-2">
                        Welcome Home, {user.name}.
                    </h1>
                    <p className="text-neutral-400 text-sm">Your Zuru Mission Control.</p>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                    <LogOut className="w-5 h-5 text-neutral-400" />
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {services.map((s, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="group relative p-6 rounded-3xl bg-neutral-900/50 border border-white/5 backdrop-blur-xl overflow-hidden cursor-pointer"
                    >
                        <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${s.color} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500`} />
                        <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-300`}>
                                <s.icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-neutral-400 transition-all">
                                    {s.title}
                                </h3>
                                <p className="text-xs text-neutral-500">Access Now</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
