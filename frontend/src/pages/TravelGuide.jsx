import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check, ChevronDown, MapPin, ArrowLeft,
    Plane, FileText, Syringe, Calendar, Wallet, Loader2,
    Sparkles, AlertCircle, X, CheckCircle2
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isChecked
                ? 'bg-teal-500/5 border-teal-500/30'
                : 'bg-neutral-900 border-white/10 hover:border-white/20 shadow-lg shadow-black/20'
                }`}
        >
            <div className="p-4 flex items-center gap-4">
                <button
                    onClick={() => onToggle(item.id)}
                    className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-300 ${isChecked
                        ? 'bg-teal-500 border-teal-500 scale-110 shadow-[0_0_15px_rgba(20,184,166,0.4)]'
                        : 'border-neutral-600 hover:border-white hover:scale-105'
                        }`}
                >
                    {isChecked && <Check className="w-4 h-4 text-black" strokeWidth={4} />}
                </button>

                <div
                    className="flex-1 cursor-pointer py-1"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl transition-colors ${isChecked ? 'bg-teal-500/10' : 'bg-neutral-800'}`}>
                            <Icon className={`w-4 h-4 ${isChecked ? 'text-teal-500' : 'text-orange-500'}`} />
                        </div>
                        <span className={`font-bold transition-all ${isChecked ? 'text-neutral-500 line-through' : 'text-white'}`}>
                            {item.title}
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 text-neutral-500 hover:text-white transition-colors"
                >
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-orange-500' : ''}`} />
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
                        <div className="p-5 pl-16 text-sm text-neutral-400 leading-relaxed font-medium">
                            <p className="mb-3">{item.details}</p>
                            {item.link && (
                                <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-orange-400 hover:text-orange-300 font-bold decoration-orange-500/30 underline underline-offset-4"
                                >
                                    Visit Official Site
                                    <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
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
    const { user, updateUser } = useAuth();
    const [checkedItems, setCheckedItems] = useState([]); // Now an Array as requested
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorToast, setErrorToast] = useState("");

    // Initialize state from backend
    useEffect(() => {
        const fetchChecklist = async () => {
            try {
                const response = await api.get('/api/auth/checklist/');
                // Backend delivers a list of IDs in response.data.checked_items
                if (response.data && Array.isArray(response.data.checked_items)) {
                    setCheckedItems(response.data.checked_items);
                }
            } catch (e) {
                console.error("Failed to fetch checklist state", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchChecklist();
    }, []);

    const toggleItem = async (id) => {
        // Optimistic Update: Immediately change local state
        const isCurrentlyChecked = checkedItems.includes(id);
        const newItems = isCurrentlyChecked
            ? checkedItems.filter(item => item !== id)
            : [...checkedItems, id];

        const previousItems = [...checkedItems];
        setCheckedItems(newItems);

        const isComplete = newItems.length === CHECKLIST_ITEMS.length;

        try {
            // Updated Payload structure as requested
            await api.patch('/api/auth/checklist/', {
                checked_items: newItems,
                is_complete: isComplete
            });
        } catch (e) {
            console.error("Optimistic Update Failed, reverting...", e);
            // Revert on failure
            setCheckedItems(previousItems);
            setErrorToast("Connection lost. Progress not saved.");
            setTimeout(() => setErrorToast(""), 5000);
        }
    };

    const handleArrival = async () => {
        if (!confirm("Are you sure you have arrived in Kenya?")) return;

        setIsSaving(true);
        setErrorToast("");
        try {
            const response = await api.patch('/api/auth/update-arrival-status/');
            updateUser(response.data.user);
            navigate('/dashboard');
        } catch (err) {
            console.error("Arrival Update Failed:", err);
            setErrorToast("Failed to update status. Please try again.");
            setTimeout(() => setErrorToast(""), 5000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSkip = () => {
        navigate('/dashboard');
    };

    const progress = Math.round((checkedItems.length / CHECKLIST_ITEMS.length) * 100);
    const isComplete = progress === 100;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white">
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
                <p className="text-neutral-500 font-black uppercase text-xs tracking-[0.3em]">Syncing Journey...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white font-sans overflow-x-hidden">

            {/* Error Toast */}
            <AnimatePresence>
                {errorToast && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4"
                    >
                        <div className="bg-red-500/10 border border-red-500/50 backdrop-blur-xl rounded-2xl p-4 flex items-center justify-between shadow-2xl shadow-red-500/20">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                <p className="text-sm font-bold text-red-100">{errorToast}</p>
                            </div>
                            <button onClick={() => setErrorToast("")}>
                                <X className="w-4 h-4 text-neutral-500" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Bar */}
            <header className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 text-neutral-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3">
                        <AnimatePresence mode="wait">
                            {!isComplete ? (
                                <motion.div
                                    key="pre-complete-actions"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="flex items-center gap-3"
                                >
                                    {!user?.is_in_kenya && (
                                        <button
                                            onClick={handleSkip}
                                            className="text-neutral-500 px-4 py-2 rounded-xl font-bold text-sm hover:text-white transition-colors"
                                        >
                                            Skip for Now
                                        </button>
                                    )}
                                    <button
                                        onClick={handleArrival}
                                        disabled={isSaving}
                                        className="bg-neutral-900 text-neutral-400 border border-white/5 px-4 py-2 rounded-xl font-black text-sm transition-all flex items-center gap-2"
                                    >
                                        <MapPin className="w-4 h-4 text-neutral-600" />
                                        {isSaving ? "Updating..." : "I Have Arrived"}
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="complete-actions"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="flex items-center gap-3"
                                >
                                    <button
                                        onClick={handleArrival}
                                        disabled={isSaving}
                                        className="text-neutral-500 px-4 py-2 rounded-xl font-bold text-sm hover:text-white transition-colors"
                                    >
                                        I Have Arrived
                                    </button>
                                    <motion.button
                                        animate={{
                                            scale: [1, 1.05, 1],
                                            boxShadow: [
                                                "0 0 0px rgba(255,255,255,0)",
                                                "0 0 20px rgba(255,255,255,0.2)",
                                                "0 0 0px rgba(255,255,255,0)"
                                            ]
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        onClick={() => navigate('/dashboard')}
                                        className="bg-white text-neutral-950 px-6 py-2 rounded-xl font-black text-sm flex items-center gap-2 shadow-xl shadow-white/10"
                                    >
                                        <Sparkles className="w-4 h-4 text-orange-600" />
                                        Go to Dashboard
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-8 pb-32">

                {/* Completion Banner */}
                <AnimatePresence>
                    {isComplete && (
                        <motion.div
                            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                            animate={{ height: "auto", opacity: 1, marginBottom: 40 }}
                            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-teal-500/20 via-teal-500/10 to-transparent border border-teal-500/30 p-6 rounded-[2.5rem] relative">
                                <div className="absolute top-4 right-6">
                                    <Sparkles className="w-8 h-8 text-teal-400 animate-pulse" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-teal-500 rounded-2xl shadow-lg shadow-teal-900/40">
                                        <CheckCircle2 className="w-6 h-6 text-black" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white tracking-tight">All Set!</h2>
                                        <p className="text-teal-400/70 font-bold text-sm">Your journey is perfectly prepared.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 text-center"
                >
                    <div className="inline-block p-4 rounded-3xl bg-neutral-900 border border-white/5 mb-6 shadow-xl">
                        <Plane className="w-10 h-10 text-teal-400" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tighter">Travel Checklist</h1>
                    <p className="text-neutral-500 max-w-md mx-auto text-sm font-bold uppercase tracking-widest leading-loose opacity-60">
                        Essential prep for your kenyan mission
                    </p>
                </motion.div>

                {/* Progress Bar */}
                <div className="mb-14 relative group">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.25em] mb-4">
                        <span className="text-neutral-600">Preparation Progress</span>
                        <span className="text-teal-400">{progress}% Secured</span>
                    </div>
                    <div className="h-4 bg-neutral-900/50 rounded-full overflow-hidden border border-white/5 p-1 backdrop-blur-sm">
                        <motion.div
                            className="h-full bg-gradient-to-r from-teal-600 via-teal-400 to-emerald-400 rounded-full shadow-[0_0_20px_rgba(20,184,166,0.3)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "circOut" }}
                        />
                    </div>
                </div>

                {/* Checklist Content */}
                <div className="space-y-4">
                    {CHECKLIST_ITEMS.map((item) => (
                        <ChecklistItem
                            key={item.id}
                            item={item}
                            isChecked={checkedItems.includes(item.id)}
                            onToggle={toggleItem}
                        />
                    ))}
                </div>

                {/* Visual Feedback for non-complete */}
                {!isComplete && !user?.is_in_kenya && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="mt-20 p-10 rounded-[3rem] bg-neutral-900/40 border border-white/5 text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <MapPin className="w-32 h-32" />
                        </div>
                        <h3 className="text-xl font-black text-neutral-300 mb-3 tracking-tight">Already Touched Down?</h3>
                        <p className="text-neutral-500 text-sm mb-8 max-w-xs mx-auto font-medium">
                            If you're already in Kenya, skip the prep and jump straight to your dashboard.
                        </p>
                        <button
                            onClick={handleArrival}
                            className="bg-neutral-800 hover:bg-neutral-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg border border-white/5"
                        >
                            Mark As Arrived
                        </button>
                    </motion.div>
                )}

            </main>
        </div>
    );
};

export default TravelGuide;
