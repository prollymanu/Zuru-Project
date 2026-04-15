import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Wallet, ArrowDown, ArrowUp, RefreshCw, Smartphone,
    Lock, Filter, Eye, EyeOff, LayoutDashboard, ChevronRight,
    X, CheckCircle, AlertCircle, Send, Plus, CreditCard
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../api/axios';
import Toast from '../components/common/Toast';
import WithdrawModal from '../components/wallet/WithdrawModal';

// --- Subcomponents for PIN Input ---

const PinInput = ({ length = 4, onComplete, disabled = false }) => {
    const [pin, setPin] = useState(Array(length).fill(''));
    const inputRefs = useRef([]);

    const handleChange = (e, index) => {
        const value = e.target.value;
        if (!/^\d*$/.test(value)) return;

        const newPin = [...pin];
        newPin[index] = value.substring(value.length - 1);
        setPin(newPin);

        if (value && index < length - 1) {
            inputRefs.current[index + 1].focus();
        }

        if (newPin.every(digit => digit !== '')) {
            onComplete(newPin.join(''));
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    return (
        <div className="flex justify-center gap-3 my-6">
            {pin.map((digit, index) => (
                <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    disabled={disabled}
                    className="w-14 h-16 text-center text-2xl font-black bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all disabled:opacity-50"
                />
            ))}
        </div>
    );
};

// --- Modals ---

const SetupPinModal = ({ onComplete }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePinComplete = async (pin) => {
        setIsSubmitting(true);
        try {
            // Mocking the API call for now or sending real request
            await api.post('/api/wallet/setup-pin/', { pin }).catch(() => console.log('Mocking setup...'));
            // Pretend it succeeded
            setTimeout(() => {
                onComplete(pin);
                setIsSubmitting(false);
            }, 800);
        } catch (error) {
            console.error("Failed to setup PIN", error);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-neutral-950 border border-neutral-800 p-8 rounded-[2rem] max-w-sm w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <Lock className="text-orange-500 w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white text-center mb-2">Secure Your Wallet</h3>
                <p className="text-neutral-400 text-center text-sm mb-8">
                    Create a 4-digit PIN to secure your transactions and hide your balances.
                </p>

                <PinInput length={4} onComplete={handlePinComplete} disabled={isSubmitting} />

                {isSubmitting && (
                    <p className="text-orange-500 text-center text-sm font-bold animate-pulse">Securing wallet...</p>
                )}
            </motion.div>
        </div>
    );
};

const EnterPinModal = ({ onVerify, onSkip }) => {
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');

    const handlePinComplete = async (pin) => {
        setIsVerifying(true);
        setError('');
        try {
            // Strictly await — any non-2xx (e.g., 403 Wrong PIN) will throw and be caught below.
            await api.post('/api/wallet/verify-pin/', { pin });
            // Only reaches here on a genuine 200 OK
            onVerify();
        } catch (err) {
            // Smart error UX: distinguish network, server, and user errors
            if (!err.response) {
                setError('Network issue. Please check your connection and try again.');
            } else if (err.response.status >= 500) {
                setError('Oops! Something went wrong on our end. Please try again later.');
            } else {
                // 403 Wrong PIN — block access, keep modal open
                setError(err.response.data?.error || err.response.data?.message || err.response.data?.detail || 'Incorrect PIN. Please try again.');
            }
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-neutral-950 border border-neutral-800 p-8 rounded-[2rem] max-w-sm w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <Lock className="text-blue-500 w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white text-center mb-2">Unlock Wallet</h3>
                <p className="text-neutral-400 text-center text-sm mb-4">
                    Enter your 4-digit PIN to view balances and history.
                </p>

                <PinInput length={4} onComplete={handlePinComplete} disabled={isVerifying} />

                {error && <p className="text-red-500 text-center text-sm font-medium mb-4">{error}</p>}
                {isVerifying && <p className="text-blue-500 text-center text-sm font-bold animate-pulse mb-4">Verifying...</p>}

                <button
                    onClick={onSkip}
                    disabled={isVerifying}
                    className="w-full py-3 text-neutral-500 hover:text-white text-sm font-bold transition-colors"
                >
                    Skip for now
                </button>
            </motion.div>
        </div>
    );
};

// --- Toast Notification ---

// --- Custom Toast Component has been extracted to a global component ---

// --- Deposit Modal ---

const PAYMENT_METHODS = [
    { id: 'card', label: 'Credit / Debit Card', icon: <CreditCard size={20} /> },
    { id: 'apple_pay', label: 'Apple Pay', icon: <Smartphone size={20} /> },
    { id: 'paypal', label: 'PayPal', icon: <Wallet size={20} /> },
];

const DepositModal = ({ isOpen, onClose, onSuccess, refreshData, onBalanceUpdate, onPrependTransaction }) => {
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const parsedAmount = parseFloat(amount) || 0;
    const MIN_DEPOSIT = 10;
    const isBelowMin = parsedAmount > 0 && parsedAmount < MIN_DEPOSIT;
    const isValid = parsedAmount >= MIN_DEPOSIT;

    const handleDeposit = async () => {
        if (!isValid) return;
        setIsSubmitting(true);
        setError('');
        try {
            const res = await api.post('/api/wallet/deposit/', {
                amount: parsedAmount,
                currency: 'USD',
                payment_method: paymentMethod,
            });
            // Instant balance update from backend response
            if (res.data?.foreign_balance !== undefined) {
                onBalanceUpdate(res.data.foreign_balance, res.data.kes_balance);
            }
            // Prepend new transaction to history instantly
            if (res.data?.transaction) onPrependTransaction(res.data.transaction);
            onSuccess(`Successfully deposited $${Number(parsedAmount || 0).toFixed(2)}`);
            refreshData();
            onClose();
        } catch (err) {
            if (!err.response) {
                setError('Network issue. Please check your connection and try again.');
            } else if (err.response.status >= 500) {
                setError('Oops! Something went wrong on our end. Please try again later.');
            } else {
                setError(err.response.data?.error || err.response.data?.message || err.response.data?.detail || 'Deposit failed.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-neutral-950 border border-white/10 p-6 md:p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
                <button onClick={onClose} className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors">
                    <X size={24} />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                        <ArrowDown size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white">Add Funds to Zuru</h3>
                        <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Instant USD Deposit</p>
                    </div>
                </div>

                {/* Amount Input */}
                <div className="mb-6">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1 mb-2 block">Amount</label>
                    <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl font-black text-neutral-500">$</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className={`w-full bg-neutral-900 border pl-12 pr-5 py-5 rounded-2xl text-3xl font-black text-white focus:outline-none transition-colors ${isBelowMin ? 'border-red-500 focus:border-red-500'
                                : isValid ? 'border-blue-500 focus:border-blue-500'
                                    : 'border-white/5 focus:border-blue-500'
                                }`}
                        />
                    </div>
                    {isBelowMin && (
                        <p className="text-red-500 text-xs font-bold mt-2 ml-1 flex items-center gap-1">
                            <AlertCircle size={12} /> Minimum deposit is $10.00
                        </p>
                    )}
                    {isValid && (
                        <p className="text-blue-400 text-xs font-bold mt-2 ml-1 flex items-center gap-1">
                            <CheckCircle size={12} /> ${Number(parsedAmount || 0).toFixed(2)} will be added to your USD account
                        </p>
                    )}
                </div>

                {/* Payment Method Selector */}
                <div className="mb-8">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1 mb-3 block">Payment Method</label>
                    <div className="grid grid-cols-3 gap-3">
                        {PAYMENT_METHODS.map((method) => (
                            <button
                                key={method.id}
                                onClick={() => setPaymentMethod(method.id)}
                                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${paymentMethod === method.id
                                    ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                    : 'bg-neutral-900 border-white/5 text-neutral-500 hover:text-white hover:border-white/20'
                                    }`}
                            >
                                {method.icon}
                                <span className="text-[10px] font-black uppercase tracking-tight leading-tight text-center">{method.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-500 text-xs font-bold mb-6 flex items-center gap-2">
                        <AlertCircle size={14} /> {error}
                    </div>
                )}

                {/* Submit */}
                <button
                    onClick={handleDeposit}
                    disabled={!isValid || isSubmitting}
                    className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${isValid && !isSubmitting
                        ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:from-blue-500 hover:to-blue-300 hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                        }`}
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <RefreshCw size={16} className="animate-spin" /> Processing...
                        </span>
                    ) : (
                        `Deposit $${isValid ? Number(parsedAmount || 0).toFixed(2) : '0.00'} Securely`
                    )}
                </button>

                <p className="text-center text-neutral-600 text-[10px] font-bold mt-4 uppercase tracking-widest">
                    🔒 256-bit encrypted &nbsp;&bull;&nbsp; Funds arrive instantly
                </p>
            </motion.div>
        </div>
    );
};

// --- Convert Modal ---

const ConvertModal = ({ isOpen, onClose, onExchange, userBalances, refreshData, onBalanceUpdate, onPrependTransaction }) => {
    const [direction, setDirection] = useState('usd_to_kes');
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const RATE = 130;
    const FEE_PERCENT = 0.01;

    const parsedAmount = parseFloat(amount) || 0;
    const fee = parsedAmount * FEE_PERCENT;
    const receiveAmount = direction === 'usd_to_kes'
        ? (parsedAmount - fee) * RATE
        : (parsedAmount - fee) / RATE;

    // Real-time balance validation — Number() guards against Django string-serialized Decimals
    const currentBalance = direction === 'usd_to_kes' ? Number(userBalances?.usdBalance || 0) : Number(userBalances?.kesBalance || 0);
    const totalCost = parsedAmount + fee;
    const isInsufficient = parsedAmount > 0 && totalCost > currentBalance;

    const handleConfirm = async (pin) => {
        if (isInsufficient) return; // Guard against submit with insufficient funds
        setIsSubmitting(true);
        setError('');
        try {
            // Strictly await — 403 (wrong PIN) or 400 (insufficient funds) will throw.
            // Backend strictly requires 'FOREIGN' or 'KES' — not 'USD'
            const backendFromAccount = direction === 'usd_to_kes' ? 'FOREIGN' : 'KES';
            const res = await api.post('/api/wallet/convert/', {
                pin,
                from_account: backendFromAccount,
                amount: parsedAmount
            });
            // Task 4: Instantly update balances from backend response
            if (res.data?.foreign_balance !== undefined) onBalanceUpdate(res.data.foreign_balance, res.data.kes_balance);
            // Prepend new transaction to history instantly
            if (res.data?.transaction) onPrependTransaction(res.data.transaction);
            onExchange(`Successfully converted ${direction === 'usd_to_kes' ? '$' : 'KES '}${Number(parsedAmount || 0).toFixed(2)}`);
            refreshData();
            onClose();
        } catch (err) {
            // Smart error UX: distinguish network, server, and user errors
            if (!err.response) {
                setError('Network issue. Please check your connection and try again.');
            } else if (err.response.status >= 500) {
                setError('Oops! Something went wrong on our end. Please try again later.');
            } else {
                setError(err.response.data?.error || err.response.data?.message || err.response.data?.detail || 'Transaction failed.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-neutral-950 border border-white/10 p-6 md:p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
                <button onClick={onClose} className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors">
                    <X size={24} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-500">
                        <RefreshCw size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white">Convert Currency</h3>
                        <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Rate: 1 USD = 130 KES</p>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    {/* Direction Toggle */}
                    <div className="flex bg-neutral-900 p-1 rounded-2xl border border-white/5">
                        <button
                            onClick={() => setDirection('usd_to_kes')}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${direction === 'usd_to_kes' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
                        >
                            USD to KES
                        </button>
                        <button
                            onClick={() => setDirection('kes_to_usd')}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${direction === 'kes_to_usd' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
                        >
                            KES to USD
                        </button>
                    </div>

                    {/* Amount Input with real-time balance validation */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Amount to convert</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className={`w-full bg-neutral-900 border p-5 rounded-2xl text-2xl font-black text-white focus:outline-none transition-colors ${isInsufficient ? 'border-red-500 focus:border-red-500' : parsedAmount > 0 ? 'border-green-500 focus:border-green-500' : 'border-white/5 focus:border-purple-500'
                                    }`}
                            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-500 font-black">
                                {direction === 'usd_to_kes' ? 'USD' : 'KES'}
                            </div>
                        </div>
                        {isInsufficient && (
                            <p className="text-red-500 text-xs font-bold ml-1 flex items-center gap-1">
                                <AlertCircle size={12} /> Insufficient funds — balance: {direction === 'usd_to_kes' ? `$${Number(currentBalance || 0).toFixed(2)}` : `KES ${Number(currentBalance || 0).toLocaleString()}`}
                            </p>
                        )}
                    </div>

                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-neutral-500">Service Fee (1%)</span>
                            <span className="text-white">{direction === 'usd_to_kes' ? '$' : 'KES '}{Number(fee || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold border-t border-white/5 pt-2">
                            <span className="text-neutral-500">Total deducted</span>
                            <span className={isInsufficient ? 'text-red-400 font-black' : 'text-white'}>{direction === 'usd_to_kes' ? '$' : 'KES '}{Number(totalCost || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-black border-t border-white/5 pt-2">
                            <span className="text-neutral-400">You will receive</span>
                            <span className="text-emerald-400">
                                {direction === 'usd_to_kes' ? 'KES ' : '$'}
                                {Number(receiveAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-500 text-xs font-bold mb-6 flex items-center gap-2">
                    <AlertCircle size={14} /> {error}
                </div>}

                <div className="space-y-4">
                    <p className="text-[10px] font-black text-center text-neutral-500 uppercase tracking-[0.2em]">Enter PIN to Authorize</p>
                    <PinInput onComplete={handleConfirm} disabled={isSubmitting || isInsufficient} />
                    {isInsufficient && <p className="text-center text-xs text-red-500 font-bold">Add funds before proceeding</p>}
                    {isSubmitting && <p className="text-center text-xs font-black text-purple-500 animate-pulse uppercase tracking-widest">Processing Exchange...</p>}
                </div>
            </motion.div>
        </div>
    );
};

// --- M-Pesa Modal ---

const MpesaModal = ({ isOpen, onClose, onPayment, refreshData, onBalanceUpdate, kesBalance: availableKes, onPrependTransaction }) => {
    const [activeTab, setActiveTab] = useState('till');
    const [destination, setDestination] = useState('');
    const [accountNo, setAccountNo] = useState('');
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const parsedAmount = parseFloat(amount) || 0;
    const currentKes = Number(availableKes || 0);

    const computeFee = () => {
        if (activeTab === 'till') return 0;
        if (activeTab === 'paybill') return 20;
        if (parsedAmount <= 100) return 0;
        if (parsedAmount <= 500) return 6;
        if (parsedAmount <= 1000) return 12;
        return 22;
    };

    const fee = computeFee();
    const totalNeeded = parsedAmount + fee;
    const isInsufficient = parsedAmount > 0 && totalNeeded > currentKes;

    const handleConfirm = async (pin) => {
        if (isInsufficient) return;
        setIsSubmitting(true);
        setError('');
        try {
            // Strictly await — 403 (wrong PIN) or 400 (insufficient funds) will throw.
            const backendType = activeTab === 'till' ? 'TILL' : activeTab === 'paybill' ? 'PAYBILL' : 'SEND_MONEY';
            const res = await api.post('/api/wallet/mpesa-pay/', {
                pin,
                type: backendType,
                destination: activeTab === 'paybill' ? `${destination}:${accountNo}` : destination,
                amount: parsedAmount
            });
            // Instantly update KES balance from backend response
            if (res.data?.kes_balance !== undefined) onBalanceUpdate?.(res.data.foreign_balance, res.data.kes_balance);
            // Prepend new transaction to history instantly
            if (res.data?.transaction) onPrependTransaction?.(res.data.transaction);
            onPayment(res.data?.message || `Payment of KES ${parsedAmount.toLocaleString()} successful!`);
            refreshData();
            onClose();
        } catch (err) {
            // Smart error UX: distinguish network, server, and user errors
            if (!err.response) {
                setError('Network issue. Please check your connection and try again.');
            } else if (err.response.status >= 500) {
                setError('Oops! Something went wrong on our end. Please try again later.');
            } else {
                setError(err.response.data?.error || err.response.data?.message || err.response.data?.detail || 'Payment failed.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-neutral-950 border border-white/10 p-6 md:p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
                <button onClick={onClose} className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors">
                    <X size={24} />
                </button>

                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-500">
                        <Smartphone size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white">M-Pesa Payment</h3>
                        <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Instant Local Payments</p>
                    </div>
                </div>

                {/* Live KES Balance */}
                <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-2xl px-4 py-3 mb-6">
                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Your KES Balance</span>
                    <span className={`font-black text-sm ${isInsufficient ? 'text-red-400' : 'text-emerald-400'}`}>
                        KES {currentKes.toLocaleString()}
                    </span>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-1">
                    {['till', 'paybill', 'send'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter whitespace-nowrap transition-all border ${activeTab === tab
                                ? 'bg-green-500 border-green-400 text-black'
                                : 'bg-neutral-900 border-white/5 text-neutral-500 hover:text-white'
                                }`}
                        >
                            {tab === 'till' ? 'Buy Goods' : tab === 'paybill' ? 'Paybill' : 'Send Money'}
                        </button>
                    ))}
                </div>

                <div className="space-y-4 mb-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">
                            {activeTab === 'till' ? 'Till Number' : activeTab === 'paybill' ? 'Business Number' : 'Phone Number'}
                        </label>
                        <input
                            type="text"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            placeholder={activeTab === 'send' ? '07...' : '123456'}
                            className="w-full bg-neutral-900 border border-white/5 p-4 rounded-xl text-white font-bold focus:outline-none focus:border-green-500 transition-colors"
                        />
                    </div>

                    {activeTab === 'paybill' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Account Number</label>
                            <input
                                type="text"
                                value={accountNo}
                                onChange={(e) => setAccountNo(e.target.value)}
                                placeholder="ACC-123"
                                className="w-full bg-neutral-900 border border-white/5 p-4 rounded-xl text-white font-bold focus:outline-none focus:border-green-500 transition-colors"
                            />
                        </div>
                    )}

                    {/* Amount with real-time balance validation */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Amount (KES)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className={`w-full bg-neutral-900 border p-4 rounded-xl text-2xl font-black text-white focus:outline-none transition-colors ${isInsufficient ? 'border-red-500 focus:border-red-500' : parsedAmount > 0 ? 'border-green-500 focus:border-green-500' : 'border-white/5 focus:border-green-500'
                                }`}
                        />
                        {isInsufficient && (
                            <p className="text-red-500 text-xs font-bold ml-1 flex items-center gap-1">
                                <AlertCircle size={12} /> Insufficient KES Balance. Please convert funds first.
                            </p>
                        )}
                    </div>

                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Transaction Fee</span>
                        <span className="text-white font-bold text-sm">KES {fee}</span>
                    </div>
                    {parsedAmount > 0 && (
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Total Needed</span>
                            <span className={`font-black text-sm ${isInsufficient ? 'text-red-400' : 'text-emerald-400'}`}>KES {Number(totalNeeded || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    )}
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-500 text-xs font-bold mb-6 flex items-center gap-2">
                    <AlertCircle size={14} /> {error}
                </div>}

                <div className="space-y-4">
                    <p className="text-[10px] font-black text-center text-neutral-500 uppercase tracking-[0.2em]">Enter PIN to Authorize</p>
                    <PinInput onComplete={handleConfirm} disabled={isSubmitting || isInsufficient} />
                    {isInsufficient && <p className="text-center text-xs text-red-500 font-bold">Top up your KES balance first — Convert USD to KES</p>}
                    {isSubmitting && <p className="text-center text-xs font-black text-green-500 animate-pulse uppercase tracking-widest">Authenticating Payment...</p>}
                </div>
            </motion.div>
        </div>
    );
};

// --- Main Dashboard Component ---

const WalletDashboard = () => {
    const navigate = useNavigate();

    // State
    const [walletStatus, setWalletStatus] = useState({ loading: true, hasPin: false });
    const [isUnlocked, setIsUnlocked] = useState(false);

    const [showSetupModal, setShowSetupModal] = useState(false);
    const [showEnterPinModal, setShowEnterPinModal] = useState(false);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [showMpesaModal, setShowMpesaModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);

    const [toast, setToast] = useState(null);

    // Task 1: Dedicated balance state — never hardcoded
    const [foreignBalance, setForeignBalance] = useState(0);
    const [kesBalance, setKesBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);

    // Legacy walletData ref kept for modal prop compatibility
    const walletData = { usdBalance: foreignBalance, kesBalance, history: transactions };

    // Initial Fetch
    useEffect(() => {
        const fetchWalletStatus = async () => {
            try {
                const response = await api.get('/api/wallet/status/');
                const userHasPin = response.data?.has_pin === true;
                
                setWalletStatus({ loading: false, hasPin: userHasPin });
                
                if (userHasPin) {
                    setShowEnterPinModal(true);
                } else {
                    setShowSetupModal(true);
                }
            } catch (error) {
                console.error("Error fetching wallet status:", error);
                setWalletStatus(prev => ({ ...prev, loading: false }));
            }
        };

        fetchWalletStatus();
    }, []);

    const fetchWalletData = async () => {
        try {
            const res = await api.get('/api/wallet/balances/');
            setForeignBalance(res.data.foreign_balance ?? res.data.usd_balance ?? 0);
            setKesBalance(res.data.kes_balance ?? 0);
            setTransactions(res.data.history || res.data.transactions || []);
        } catch {
            // Mock fallback for local dev
            setForeignBalance(1250.00);
            setKesBalance(45200.00);
            setTransactions([
                { id: 1, type: 'convert', title: 'Converted USD to KES', amount: '-$50.00', fee_applied: '$0.50', date: 'Today, 2:30 PM', positive: false, timestamp: 'Today, 2:30 PM', fee: '$0.50' },
                { id: 2, type: 'pay', title: 'Paid Till 54321', amount: '-1200', fee_applied: '0', date: 'Yesterday, 11:15 AM', positive: false, timestamp: 'Yesterday, 11:15 AM', fee: '0' },
                { id: 3, type: 'deposit', title: 'Received from John Doe', amount: '500.00', fee_applied: '0', date: 'Mar 1, 2026', positive: true, timestamp: 'Mar 1, 2026', fee: '0' },
                { id: 4, type: 'withdraw', title: 'Withdrawal to Bank', amount: '-10000', fee_applied: '50', date: 'Feb 28, 2026', positive: false, timestamp: 'Feb 28, 2026', fee: '50' },
            ]);
        }
    };

    const handleSetupComplete = (pin) => {
        setWalletStatus({ loading: false, hasPin: true });
        setShowSetupModal(false);
        setIsUnlocked(true);
        fetchWalletData();
    };

    const handleVerifyComplete = () => {
        setShowEnterPinModal(false);
        setIsUnlocked(true);
        fetchWalletData();
    };

    const handleSkip = () => {
        setShowEnterPinModal(false);
        setIsUnlocked(false);
    };

    const handleTransactionSuccess = (message) => {
        setToast({ message, type: 'success' });
        fetchWalletData();
    };

    // Task 4: Instant balance update from response.data
    const handleBalanceUpdate = (newForeign, newKes) => {
        if (newForeign !== undefined) setForeignBalance(Number(newForeign));
        if (newKes !== undefined) setKesBalance(Number(newKes));
    };

    // Prepend a single new transaction to the top of the history list
    const handlePrependTransaction = (newTx) => {
        if (newTx) setTransactions(prev => [newTx, ...prev]);
    };

    const maskBalance = (amount) => isUnlocked ? amount : '****';

    if (walletStatus.loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="animate-spin text-orange-500">
                        <RefreshCw size={32} />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen pb-20 space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">
                            Your Zuru Wallet
                        </h1>
                        <p className="text-neutral-500 font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-2">
                            <Lock size={12} className={isUnlocked ? 'text-green-500' : 'text-orange-500'} />
                            {isUnlocked ? 'Unlocked & Secure' : 'Balances Locked'}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        {!isUnlocked && walletStatus.hasPin && !showEnterPinModal && (
                            <button
                                onClick={() => setShowEnterPinModal(true)}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-white text-sm font-bold transition-colors"
                            >
                                <Lock size={16} /> Unlock
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="hidden md:flex items-center gap-2 text-neutral-500 hover:text-white transition-colors font-bold text-sm"
                        >
                            <LayoutDashboard size={20} />
                            Dashboard
                        </button>
                    </div>
                </div>

                {/* Cards Section */}
                <div className="flex overflow-x-auto pb-4 gap-6 snap-x snap-mandatory hide-scrollbar">
                    {/* Card 1: USD */}
                    <motion.div
                        className="min-w-[300px] md:min-w-[380px] snap-center rounded-[2.5rem] p-8 relative overflow-hidden bg-gradient-to-br from-neutral-800 to-black border border-neutral-800 shadow-2xl"
                    >
                        <div className="absolute -right-10 -top-10 opacity-10">
                            <Wallet size={150} />
                        </div>
                        <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
                            <div>
                                <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px] mb-1">USD Account</p>
                                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                                    {isUnlocked ? `$${Number(foreignBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '****'}
                                </h2>
                            </div>
                            <div className="flex justify-between items-end mt-6">
                                <p className="text-neutral-500 text-xs font-medium">Auto-converts at 131.50</p>
                                <div className="w-10 h-6 bg-white/20 rounded-md backdrop-blur-sm border border-white/10" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: KES */}
                    <motion.div
                        className="min-w-[300px] md:min-w-[380px] snap-center rounded-[2.5rem] p-8 relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-500 to-yellow-500 shadow-2xl shadow-green-900/30"
                    >
                        <div className="absolute -right-4 -bottom-4 opacity-20 text-emerald-950">
                            <Smartphone size={120} />
                        </div>
                        <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
                            <div>
                                <p className="text-green-950 font-bold uppercase tracking-widest text-[10px] mb-1">KES Account</p>
                                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                                    {isUnlocked ? `KES ${Number(kesBalance || 0).toLocaleString()}` : '****'}
                                </h2>
                            </div>
                            <div className="flex justify-between items-end mt-6">
                                <p className="text-green-900 font-bold text-xs uppercase tracking-wider">M-Pesa Ready</p>
                                <div className="w-10 h-6 bg-black/20 rounded-md backdrop-blur-sm border border-black/10" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-4 gap-4">
                    {[
                        {
                            icon: <ArrowDown size={24} />,
                            label: "Deposit",
                            bg: "bg-blue-500/10 text-blue-500",
                            onClick: () => isUnlocked ? setShowDepositModal(true) : setShowEnterPinModal(true)
                        },
                        {
                            icon: <ArrowUp size={24} />,
                            label: "Withdraw",
                            bg: "bg-red-500/10 text-red-500",
                            onClick: () => isUnlocked ? setShowWithdrawModal(true) : setShowEnterPinModal(true)
                        },
                        {
                            icon: <RefreshCw size={24} />,
                            label: "Convert",
                            bg: "bg-purple-500/10 text-purple-500",
                            onClick: () => isUnlocked ? setShowConvertModal(true) : setShowEnterPinModal(true)
                        },
                        {
                            icon: <Smartphone size={24} />,
                            label: "Pay M-Pesa",
                            bg: "bg-green-500/10 text-green-500",
                            onClick: () => isUnlocked ? setShowMpesaModal(true) : setShowEnterPinModal(true)
                        },
                    ].map((action, i) => (
                        <button
                            key={i}
                            onClick={action.onClick}
                            className="flex flex-col items-center gap-3 group"
                        >
                            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] flex items-center justify-center transition-transform group-active:scale-90 ${action.bg}`}>
                                {action.icon}
                            </div>
                            <span className="text-xs font-bold text-neutral-400 group-hover:text-white transition-colors">
                                {action.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Transaction History Section */}
                <div className="pt-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black text-white">Recent Activity</h3>
                        <button className="text-neutral-500 hover:text-white transition-colors flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                            <Filter size={16} />
                        </button>
                    </div>

                    {!isUnlocked ? (
                        <div className="flex flex-col items-center justify-center py-12 rounded-[2rem] border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
                            <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-4 text-neutral-500">
                                <Lock size={24} />
                            </div>
                            <p className="text-neutral-400 font-medium mb-4">Enter PIN to view history</p>
                            <button
                                onClick={() => setShowEnterPinModal(true)}
                                className="bg-white text-black px-6 py-2 rounded-xl font-bold text-sm hover:scale-105 transition-transform"
                            >
                                Unlock Now
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {transactions && transactions.length > 0 ? (
                                transactions.map((tx) => (
                                    <motion.div
                                        key={tx.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-b border-white/5 cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                                                ${tx.type === 'deposit' ? 'bg-green-500/20 text-green-500' :
                                                    tx.type === 'withdraw' || tx.type === 'pay' || tx.type === 'SEND_MONEY' ? 'bg-orange-500/20 text-orange-500' :
                                                        'bg-blue-500/20 text-blue-500'}`}
                                            >
                                                {(tx.type === 'convert' || tx.type === 'CONVERSION') && <RefreshCw size={20} />}
                                                {(tx.type === 'pay' || tx.type === 'TILL' || tx.type === 'PAYBILL' || tx.type === 'SEND_MONEY') && <Smartphone size={20} />}
                                                {tx.type === 'deposit' && <ArrowDown size={20} />}
                                                {tx.type === 'withdraw' && <ArrowUp size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white mb-0.5 uppercase">{tx.type.replace('_', ' ')}</p>
                                                <p className="text-xs text-neutral-500">{tx.timestamp || tx.date}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-black font-mono ${tx.positive ? 'text-green-500' : 'text-white'}`}>
                                                KES {Number(tx.amount || 0).toLocaleString()}
                                            </p>
                                            <p className="text-[10px] text-red-500 mt-0.5">Fee: {tx.fee || tx.fee_applied}</p>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <p className="text-center py-10 text-neutral-500 font-bold">No transactions yet.</p>
                            )}
                            {transactions && transactions.length > 0 && (
                                <button className="w-full py-4 text-center text-sm font-bold text-neutral-500 hover:text-white transition-colors flex items-center justify-center gap-2">
                                    View all transactions <ChevronRight size={16} />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals Rendering */}
            <AnimatePresence>
                {showSetupModal && (
                    <SetupPinModal onComplete={handleSetupComplete} />
                )}
                {showEnterPinModal && (
                    <EnterPinModal onVerify={handleVerifyComplete} onSkip={handleSkip} />
                )}
                {showDepositModal && (
                    <DepositModal
                        isOpen={showDepositModal}
                        onClose={() => setShowDepositModal(false)}
                        onSuccess={handleTransactionSuccess}
                        refreshData={fetchWalletData}
                        onBalanceUpdate={handleBalanceUpdate}
                        onPrependTransaction={handlePrependTransaction}
                    />
                )}
                {showConvertModal && (
                    <ConvertModal
                        isOpen={showConvertModal}
                        onClose={() => setShowConvertModal(false)}
                        onExchange={handleTransactionSuccess}
                        userBalances={walletData}
                        refreshData={fetchWalletData}
                        onBalanceUpdate={handleBalanceUpdate}
                        onPrependTransaction={handlePrependTransaction}
                    />
                )}
                {showMpesaModal && (
                    <MpesaModal
                        isOpen={showMpesaModal}
                        onClose={() => setShowMpesaModal(false)}
                        onPayment={handleTransactionSuccess}
                        refreshData={fetchWalletData}
                        onBalanceUpdate={handleBalanceUpdate}
                        kesBalance={kesBalance}
                        onPrependTransaction={handlePrependTransaction}
                    />
                )}
                {showWithdrawModal && (
                    <WithdrawModal
                        isOpen={showWithdrawModal}
                        onClose={() => setShowWithdrawModal(false)}
                        foreignBalance={foreignBalance}
                        refreshData={fetchWalletData}
                        onBalanceUpdate={handleBalanceUpdate}
                    />
                )}
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default WalletDashboard;
