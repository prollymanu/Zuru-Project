import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Check, ChevronDown, MapPin, ArrowLeft,
    Plane, FileText, Syringe, Calendar, Wallet
} from 'lucide-react';
import api from '../api/axios';

const CHECKLIST_ITEMS = [
    {
        id: 'visa',
        title: 'Kenya eTA / Visa',
        icon: FileText,
        details: 'All visitors must apply for the Electronic Travel Authorisation (eTA) at least 3 days before travel. Cost is approx $30.',
        link: 'https://www.etakenya.go.ke'
    },
    {
        id: 'vaccine',
        title: 'Yellow Fever Certificate',
        icon: Syringe,
        details: 'Mandatory for travelers arriving from countries with risk of yellow fever transmission. Verification checks are done at arrival.',
    },
    {
        id: 'flights',
        title: 'Book Flights',
        icon: Plane,
        details: 'Ensure you have a return ticket. Major airports: Jomo Kenyatta (NBO) and Moi International (MBA).',
    },
    {
        id: 'accommodation',
        title: 'Book Accommodation',
        icon: Calendar,
        details: 'You will need to provide the address of your first night\'s stay for the eTA application.',
    },
    {
        id: 'currency',
        title: 'Currency & Cash',
        icon: Wallet,
        details: 'Kenyan Shilling (KES). M-PESA is widely used. Bring some USD (printed after 2013) for exchange.',
    }
];

const ChecklistItem = ({ item, isChecked, onToggle }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const Icon = item.icon;

    return (
        <motion.div
            layout
            className={`border rounded-xl overflow-hidden transition-colors ${isChecked
                ? 'bg-neutral-900/50 border-teal-500/30'
                : 'bg-neutral-900 border-white/10 hover:border-white/20'
                }`}
        >
            <div className="p-4 flex items-center gap-4">
                <button
                    onClick={() => onToggle(item.id)}
                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${isChecked
                        ? 'bg-teal-500 border-teal-500'
                        : 'border-neutral-600 hover:border-white'
                        }`}
                >
                    {isChecked && <Check className="w-4 h-4 text-black" strokeWidth={3} />}
                </button>

                <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isChecked ? 'text-teal-500' : 'text-orange-500'}`} />
                        <span className={`font-medium ${isChecked ? 'text-neutral-400 line-through' : 'text-white'}`}>
                            {item.title}
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1 text-neutral-500 hover:text-white transition-colors"
                >
                    <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-black/20 border-t border-white/5"
                    >
                        <div className="p-4 pl-14 text-sm text-neutral-400 leading-relaxed">
                            <p className="mb-2">{item.details}</p>
                            {item.link && (
                                <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-orange-400 hover:text-orange-300 underline"
                                >
                                    Official Link &rarr;
                                </a>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const TravelGuide = () => {
    const navigate = useNavigate();
    const [checkedItems, setCheckedItems] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Initialize state from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('travel_checklist');
        if (saved) {
            try {
                setCheckedItems(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse checklist state", e);
            }
        }
    }, []);

    const toggleItem = (id) => {
        setCheckedItems(prev => {
            const newState = { ...prev, [id]: !prev[id] };
            localStorage.setItem('travel_checklist', JSON.stringify(newState));
            return newState;
        });
    };

    const handleArrival = async () => {
        if (!confirm("Are you sure you have arrived in Kenya?")) return;

        setIsLoading(true);
        try {
            // Requires API endpoint to update user status
            await api.patch('/api/user/me/', { is_in_kenya: true });
            navigate('/dashboard');
        } catch (err) {
            console.error("Arrival Update Failed:", err);

            // Fallback for demo if API fails/doesn't exist yet
            // In production, you might want to show an error toast here
            // navigate('/dashboard'); 
            alert("Failed to update status. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const progress = Math.round(
        (Object.values(checkedItems).filter(Boolean).length / CHECKLIST_ITEMS.length) * 100
    );

    return (
        <div className="min-h-screen bg-neutral-950 text-white font-sans">

            {/* Top Bar */}
            <header className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/auth')}
                        className="p-2 -ml-2 text-neutral-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <button
                        onClick={handleArrival}
                        disabled={isLoading}
                        className="bg-white text-neutral-950 px-4 py-2 rounded-full font-bold text-sm hover:bg-neutral-200 transition-colors flex items-center gap-2"
                    >
                        <MapPin className="w-4 h-4 text-orange-600" />
                        {isLoading ? "Updating..." : "I Have Arrived"}
                    </button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8">

                {/* Hero Section */}
                <div className="mb-10 text-center">
                    <div className="inline-block p-3 rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-900/20 border border-teal-500/30 mb-4">
                        <Plane className="w-8 h-8 text-teal-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">Planning Your Trip</h1>
                    <p className="text-neutral-400 max-w-md mx-auto">
                        Track your preparation for the ultimate Kenyan adventure.
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-neutral-500">Preparation Progress</span>
                        <span className="text-teal-400 font-bold">{progress}%</span>
                    </div>
                    <div className="h-2 bg-neutral-900 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-teal-600 to-teal-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>

                {/* Checklist */}
                <div className="space-y-3">
                    {CHECKLIST_ITEMS.map((item) => (
                        <ChecklistItem
                            key={item.id}
                            item={item}
                            isChecked={!!checkedItems[item.id]}
                            onToggle={toggleItem}
                        />
                    ))}
                </div>

                {/* Tip Card */}
                <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 text-center">
                    <h3 className="font-bold text-orange-200 mb-2">Need a Local Guide?</h3>
                    <p className="text-sm text-neutral-400 mb-4">
                        Once you arrive, Zuru connects you with rated local experts.
                    </p>
                    <button
                        onClick={handleArrival}
                        className="text-orange-400 text-sm font-bold hover:underline"
                    >
                        Skip to Dashboard &rarr;
                    </button>
                </div>

            </main>
        </div>
    );
};

export default TravelGuide;
