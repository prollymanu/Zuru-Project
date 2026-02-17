import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet, Hotel, Car, Utensils, Mountain, PartyPopper, Scale, Ambulance,
    ArrowRight, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroBg from '../assets/hero_bg.jpg';

// --- Variants ---
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const cardHover = {
    rest: { scale: 1, y: 0, rotateX: 0, rotateY: 0 },
    hover: {
        scale: 1.05,
        y: -5,
        rotateX: 2,
        rotateY: 2,
        boxShadow: "0 25px 50px -12px rgba(255, 100, 0, 0.25)",
        transition: { type: "spring", stiffness: 300, damping: 20 }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
};

// --- Components ---

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center transition-all duration-300 ${scrolled ? 'bg-black/40 backdrop-blur-xl border-b border-white/5 py-3' : 'bg-transparent py-5'}`}>
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-teal-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">Z</span>
                </div>
                <span className="text-xl font-semibold tracking-tight text-white">Zuru</span>
            </div>
            <div className="flex gap-4">
                <button
                    onClick={() => navigate('/auth?mode=login')}
                    className="px-5 py-2 rounded-full border border-white/20 text-sm font-medium hover:bg-white/10 transition-colors hidden md:block text-white"
                >
                    Login
                </button>
                <button
                    onClick={() => navigate('/auth?mode=signup')}
                    className="px-5 py-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold hover:shadow-[0_0_20px_rgba(234,88,12,0.4)] transition-all"
                >
                    Get Started
                </button>
            </div>
        </nav>
    );
};

const Hero = () => {
    const navigate = useNavigate();

    return (
        <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src={heroBg}
                    alt="Hero"
                    className="w-full h-full object-cover transition-transform duration-[20s] hover:scale-110"
                    style={{ transform: "scale(1.05)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-neutral-950" />
                <div className="absolute inset-0 bg-gradient-to-r from-orange-900/20 to-teal-900/20 mix-blend-overlay" />
            </div>

            <div className="relative z-10 text-center px-4 max-w-6xl mx-auto flex flex-col items-center gap-4 mt-16">
                <div className="overflow-hidden">
                    <motion.h1
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight text-white leading-[1.05]"
                    >
                        Experience Kenya...
                    </motion.h1>
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 1.5 }}
                    className="text-lg md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-orange-200 to-teal-200 font-light tracking-wide font-serif italic"
                >
                    Like a local with Zuru
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6, duration: 0.8 }}
                    className="flex flex-col md:flex-row gap-5 mt-10"
                >
                    <button
                        onClick={() => navigate('/auth?mode=signup')}
                        className="group px-10 py-4 rounded-full bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold text-lg hover:shadow-[0_0_40px_rgba(234,88,12,0.5)] transition-all duration-300 flex items-center gap-2"
                    >
                        Get Started
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => navigate('/auth?mode=login')}
                        className="px-10 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300"
                    >
                        Login
                    </button>
                </motion.div>
            </div>
        </section>
    );
};

const AboutSection = () => {
    const [expanded, setExpanded] = useState(false);

    return (
        <section className="relative py-24 px-4 bg-neutral-950 overflow-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

                {/* Text Content */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="relative z-10"
                >
                    <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Bridging the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-teal-400">
                            Gap.
                        </span>
                    </motion.h2>

                    <motion.p variants={fadeInUp} className="text-lg text-neutral-400 leading-relaxed max-w-xl mb-8">
                        We are your digital broker for a life well-lived in Kenya. From visas to villas, we handle the chaos so you can enjoy the journey.
                    </motion.p>

                    <motion.div variants={fadeInUp}>
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="group flex items-center gap-2 text-white font-medium border-b border-orange-500 pb-1 hover:text-orange-400 transition-colors"
                        >
                            Read Our Full Story
                            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {expanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    className="overflow-hidden"
                                >
                                    <p className="pt-6 text-neutral-500 text-sm leading-relaxed max-w-lg border-l-2 border-white/10 pl-4 mt-4">
                                        Zuru was born from a simple idea: Travel shouldn't be stressful. Whether you are a tourist exploring the Maasai Mara or an expat settling in Nairobi, our mission is to provide a unified platform that connects you with verified local services instantly. Trust, Security, and Ease are at our core.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>

                {/* Visual Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="relative h-full min-h-[400px] flex items-center justify-center"
                >
                    {/* Abstract Glass Elements */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-teal-500/20 blur-[100px] rounded-full animate-pulse" />
                    <div className="relative w-full max-w-sm aspect-square bg-white/5 border border-white/10 backdrop-blur-3xl rounded-[3rem] p-8 flex flex-col justify-between transform rotate-3 hover:rotate-0 transition-all duration-700 shadow-2xl">
                        <div className="flex justify-between">
                            <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                                <Wallet className="w-7 h-7" />
                            </div>
                            <div className="px-4 py-2 rounded-full bg-white/5 border border-white/5 text-xs text-white/60">
                                Verified
                            </div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white mb-2">99.9%</div>
                            <div className="text-white/40">Success Rate</div>
                        </div>
                    </div>

                    <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-black/40 border border-white/10 backdrop-blur-xl rounded-[2rem] p-6 flex items-center justify-center animate-bounce-slow">
                        <div className="text-center">
                            <div className="flex -space-x-3 justify-center mb-3">
                                {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-neutral-700 border border-black" />)}
                            </div>
                            <div className="text-xs text-white/50">Trusted by Locals</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

const ServiceCard = ({ icon: Icon, title, colorClass, span = "col-span-1" }) => (
    <motion.div
        variants={cardHover}
        initial="rest"
        whileHover="hover"
        className={`${span} group relative p-8 rounded-3xl bg-neutral-900/40 border border-white/5 backdrop-blur-md overflow-hidden cursor-pointer`}
    >
        <div className={`absolute -right-20 -top-20 w-60 h-60 bg-gradient-to-br ${colorClass} opacity-5 blur-3xl group-hover:opacity-15 transition-opacity duration-500`} />

        <div className="relative z-10 flex flex-col h-full justify-between gap-12">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-7 h-7 text-white" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-neutral-400 transition-all">
                    {title}
                </h3>
                <p className="text-sm text-neutral-500 group-hover:text-neutral-300 transition-colors">
                    Explore Services
                </p>
            </div>
        </div>
    </motion.div>
);

const ServicesSection = () => {
    const services = [
        { title: "Digital Wallets", icon: Wallet, color: "from-orange-500 to-red-500" },
        { title: "Accommodations", icon: Hotel, color: "from-teal-500 to-emerald-500", span: "md:col-span-2" },
        { title: "Fine Dining", icon: Utensils, color: "from-pink-500 to-rose-500" },
        { title: "Cab Services", icon: Car, color: "from-blue-500 to-indigo-500" },
        { title: "Safari & Travel", icon: Mountain, color: "from-green-500 to-lime-500" },
        { title: "Events & Nightlife", icon: PartyPopper, color: "from-purple-500 to-violet-500", span: "md:col-span-2" },
        { title: "Legal Assistance", icon: Scale, color: "from-yellow-500 to-amber-500" },
        { title: "Emergency", icon: Ambulance, color: "from-red-500 to-red-700" },
    ];

    return (
        <section className="relative z-20 py-32 px-4 bg-neutral-950">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-20 text-center"
                >
                    <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-white/60 text-sm font-medium mb-6">
                        Trusted Ecosystem
                    </div>
                    <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                        Partnered with the Best.
                    </h2>
                </motion.div>

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-6"
                >
                    <AnimatePresence>
                        {services.map((s, i) => (
                            <ServiceCard
                                key={i}
                                title={s.title}
                                icon={s.icon}
                                colorClass={s.color}
                                span={s.span || "col-span-1"}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>
        </section>
    );
};

export default function LandingPage() {
    return (
        <div className="bg-neutral-950 min-h-screen font-sans selection:bg-orange-500/30">
            <Navbar />
            <Hero />
            <AboutSection />
            <ServicesSection />

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 text-center">
                <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-500 to-teal-500" />
                    <span className="font-bold text-white tracking-tight">Zuru</span>
                </div>
                <p className="text-neutral-600 text-sm">© 2026 Zuru Super App. Built for Kenya.</p>
            </footer>
        </div>
    );
}
