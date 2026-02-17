import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowLeft, Plus, Send, History, CreditCard, LayoutDashboard } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';

const WalletPage = () => {
    const navigate = useNavigate();

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">
                            My Wallet
                        </h1>
                        <p className="text-neutral-500 font-black uppercase tracking-[0.3em] text-[10px]">
                            Manage your travel funds securely
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="hidden md:flex items-center gap-2 text-neutral-500 hover:text-white transition-colors font-bold text-sm"
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </button>
                </div>

                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-purple-600 to-indigo-900 p-8 md:p-12 text-white shadow-2xl shadow-purple-900/40"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Wallet size={200} />
                    </div>
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="mb-12">
                            <p className="text-purple-200 font-bold uppercase tracking-widest text-xs mb-2">Available Balance</p>
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter">$0.00</h2>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <button className="bg-white text-purple-950 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center gap-2">
                                <Plus size={18} /> Add Funds
                            </button>
                            <button className="bg-purple-500/20 border border-white/20 backdrop-blur-xl text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center gap-2">
                                <Send size={18} /> Transfer
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Sub-Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-between group cursor-not-allowed opacity-50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-500">
                                <History size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-white">Transaction History</h3>
                                <p className="text-xs text-neutral-500">View all past payments</p>
                            </div>
                        </div>
                        <ConstructionPlaceholder />
                    </div>
                    <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-between group cursor-not-allowed opacity-50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-500">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-white">Linked Cards</h3>
                                <p className="text-xs text-neutral-500">Manage payment methods</p>
                            </div>
                        </div>
                        <ConstructionPlaceholder />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

const ConstructionPlaceholder = () => (
    <div className="px-3 py-1.5 rounded-full bg-neutral-800 text-neutral-500 text-[10px] font-black uppercase tracking-tighter border border-white/5">
        Soon
    </div>
);

export default WalletPage;
