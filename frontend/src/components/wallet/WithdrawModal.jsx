import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, CheckCircle, CreditCard, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { extractApiError } from '../../utils/handleApiError';

/**
 * WithdrawModal — USD Wallet Withdrawal Flow
 *
 * Key contract with backend (WalletWithdrawalView):
 *   POST /api/wallet/withdraw/
 *   Body: { amount: number, withdrawal_method: 'CARD' | 'APPLE_PAY' | 'PAYPAL' }
 *
 * The method IDs below are the EXACT values the backend ChoiceField accepts.
 * Do not change them without updating the backend serializer simultaneously.
 */

/** Maps modal method IDs → backend enum values (snake_case, UPPERCASE). */
const METHOD_MAP = {
    card: 'CARD',
    apple_pay: 'APPLE_PAY',
    paypal: 'PAYPAL',
};

const WithdrawModal = ({ isOpen, onClose, foreignBalance = 0, refreshData, onBalanceUpdate }) => {
    const { showToast } = useToast();
    const [step, setStep] = useState(1);
    const [method, setMethod] = useState(null); // one of: 'card' | 'apple_pay' | 'paypal'
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [successRef, setSuccessRef] = useState(null);

    if (!isOpen) return null;

    const numAmount = parseFloat(amount || 0);
    const isInsufficient = numAmount > foreignBalance;
    const isBelowMin = numAmount > 0 && numAmount < 10;
    const canProceed = numAmount >= 10 && numAmount <= foreignBalance && !isProcessing;

    const methods = [
        {
            id: 'card',
            label: 'Credit/Debit Card',
            icon: <CreditCard className="w-8 h-8 text-neutral-400" />,
            brand: 'Visa / Mastercard ending in 4242'
        },
        {
            id: 'apple_pay',
            label: 'Apple Pay',
            icon: (
                <svg viewBox="0 0 40 16" className="h-6 w-auto" fill="currentColor">
                    <path d="M14.446 8.35c.017-1.92 1.574-2.834 1.644-2.88-1.037-1.522-2.656-1.748-3.23-1.79-1.385-.145-2.68.808-3.385.808-.707 0-1.768-.787-2.924-.766-1.52.022-2.923.882-3.705 2.228-1.579 2.73-.404 6.772 1.135 8.986.75 1.082 1.636 2.296 2.81 2.25 1.135-.045 1.579-.73 2.94-.73 1.36 0 1.765.73 2.96.708 1.218-.022 1.966-1.11 2.705-2.186.853-1.246 1.205-2.454 1.226-2.518-.027-.01-2.355-.904-2.336-3.606h-.002zm-1.89-6.386c.642-.77 1.074-1.84 1.066-2.915-.992.046-2.152.668-2.825 1.436-.59.68-1.085 1.763-.948 2.81 1.096.084 2.18-.553 2.812-1.33h-.105z" />
                    <text x="21" y="13" fill="currentColor" fontWeight="bold" fontFamily="sans-serif" fontSize="13">Pay</text>
                </svg>
            ),
            brand: 'Fastest method'
        },
        {
            id: 'paypal',
            label: 'PayPal',
            icon: (
                <svg viewBox="0 0 100 26" className="h-6 w-auto" fill="#0079C1">
                    <text x="0" y="20" fill="#003087" fontWeight="bold" fontFamily="sans-serif" fontSize="22" fontStyle="italic">Pay</text>
                    <text x="38" y="20" fill="#0079C1" fontWeight="bold" fontFamily="sans-serif" fontSize="22" fontStyle="italic">Pal</text>
                </svg>
            ),
            brand: 'Connected via Email'
        }
    ];

    const handleWithdraw = async () => {
        setIsProcessing(true);
        try {
            /**
             * Payload contract — keys must EXACTLY match the backend serializer:
             *   amount          → WithdrawalSerializer.amount (DecimalField)
             *   withdrawal_method → WithdrawalSerializer.withdrawal_method (ChoiceField)
             *
             * METHOD_MAP converts the UI id (e.g. 'apple_pay') to the backend
             * enum value ('APPLE_PAY') so both sides stay in sync.
             */
            const res = await api.post('/api/wallet/withdraw/', {
                amount: numAmount,
                withdrawal_method: METHOD_MAP[method],
            });

            if (res.data?.foreign_balance !== undefined) {
                onBalanceUpdate(res.data.foreign_balance, res.data.kes_balance);
            }
            refreshData();

            // Dramatic processing delay (UX polish)
            await new Promise(r => setTimeout(r, 1500));

            setSuccessRef(res.data?.reference_code || null);
            setIsProcessing(false);
            setIsSuccess(true);
        } catch (err) {
            setIsProcessing(false);

            /**
             * extractApiError reads the backend's structured response:
             *   { error: 'Insufficient USD balance...', code: 'INSUFFICIENT_FUNDS' }
             * and falls back to network-error copy if no response came back.
             *
             * The global Axios interceptor has already fired a toast for HTTP
             * 4xx/5xx, so here we only need to handle NETWORK errors that the
             * interceptor cannot categorise as a status code.
             */
            const { message, status } = extractApiError(err);

            // For network errors (no response), the interceptor won't have fired
            // a toast (it only handles response errors), so we do it here.
            if (!err.response) {
                showToast(message, 'error');
            }
            // For all other errors the global interceptor already showed the toast.
            // We intentionally do NOT call alert() or show localhost URLs.
        }
    };

    const resetAndClose = () => {
        setStep(1);
        setMethod(null);
        setAmount('');
        setIsProcessing(false);
        setIsSuccess(false);
        setSuccessRef(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <AnimatePresence>
                <motion.div
                    key="overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    onClick={!isProcessing ? resetAndClose : undefined}
                />
                <motion.div
                    key="modal"
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 30 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-md bg-neutral-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
                >
                    {/* ── Header ─────────────────────────────────────── */}
                    {!isSuccess && !isProcessing && (
                        <div className="flex items-center justify-between p-6 pb-2 border-b border-white/5">
                            {step === 2 ? (
                                <button
                                    id="withdraw-back-btn"
                                    onClick={() => setStep(1)}
                                    className="p-2 -ml-2 text-neutral-400 hover:text-white transition-colors"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                            ) : (
                                <div className="p-2 -ml-2" />
                            )}
                            <div className="text-center">
                                <h2 className="font-black text-white text-lg tracking-tight">Withdraw Funds</h2>
                                {/* Financial Safety Label — explicitly states source account */}
                                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                                    <ShieldCheck size={11} className="text-orange-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">
                                        Withdrawing from USD Wallet
                                    </span>
                                </div>
                            </div>
                            <button
                                id="withdraw-close-btn"
                                onClick={resetAndClose}
                                className="p-2 -mr-2 text-neutral-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}

                    {/* ── Step 1: Method Selection ────────────────────── */}
                    {step === 1 && !isSuccess && !isProcessing && (
                        <div className="p-6">
                            <p className="text-neutral-400 text-sm font-bold uppercase tracking-wider mb-6">Select Destination</p>
                            <div className="space-y-4">
                                {methods.map((m) => (
                                    <button
                                        key={m.id}
                                        id={`withdraw-method-${m.id}`}
                                        onClick={() => { setMethod(m.id); setStep(2); }}
                                        className="w-full text-left bg-neutral-950 hover:bg-neutral-800 border border-white/5 hover:border-white/20 p-4 rounded-2xl flex items-center gap-4 transition-all group active:scale-[0.98]"
                                    >
                                        <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0 text-white group-hover:bg-white/10 transition-colors">
                                            {m.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white text-base">{m.label}</h3>
                                            <p className="text-xs font-semibold text-neutral-500 mt-0.5">{m.brand}</p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-neutral-600 group-hover:text-white transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: Amount Entry ────────────────────────── */}
                    {step === 2 && !isSuccess && !isProcessing && (
                        <div className="p-6">
                            <div className="text-center mb-8">
                                <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs mb-4">Enter Amount to Withdraw</p>
                                <div className="flex items-center justify-center text-white">
                                    <span className="text-3xl font-black text-neutral-500 mr-2">$</span>
                                    <input
                                        id="withdraw-amount-input"
                                        type="number"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full max-w-[200px] bg-transparent text-5xl md:text-6xl font-black focus:outline-none placeholder:text-neutral-800"
                                        autoFocus
                                    />
                                </div>
                                <p className="mt-4 text-sm font-semibold text-neutral-400">
                                    Available USD Balance:{' '}
                                    <span className="text-white">
                                        ${Number(foreignBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </p>

                                {/* Inline Validation Warnings */}
                                <div className="mt-4 h-6">
                                    <AnimatePresence>
                                        {isInsufficient && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="flex items-center justify-center gap-2 text-red-500 text-sm font-bold"
                                            >
                                                <AlertCircle size={14} /> Insufficient USD Funds
                                            </motion.div>
                                        )}
                                        {isBelowMin && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="flex items-center justify-center gap-2 text-orange-500 text-sm font-bold"
                                            >
                                                <AlertCircle size={14} /> Minimum withdrawal is $10.00
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Quick Amount Chips */}
                            <div className="flex justify-center gap-3 mb-8">
                                {[50, 100, 500].map(val => (
                                    <button
                                        key={val}
                                        id={`withdraw-chip-${val}`}
                                        onClick={() => setAmount(val.toString())}
                                        className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 px-6 py-2.5 rounded-xl font-bold text-sm text-neutral-300 transition-all active:scale-95"
                                    >
                                        ${val}
                                    </button>
                                ))}
                            </div>

                            {/* Confirm CTA */}
                            <button
                                id="withdraw-confirm-btn"
                                disabled={!canProceed}
                                onClick={handleWithdraw}
                                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl
                                    ${canProceed
                                        ? 'bg-white text-black hover:bg-neutral-200 active:scale-[0.98]'
                                        : 'bg-neutral-800 text-neutral-600 cursor-not-allowed shadow-none'}`}
                            >
                                Confirm Withdrawal
                            </button>
                        </div>
                    )}

                    {/* ── Processing State ────────────────────────────── */}
                    {isProcessing && (
                        <div className="p-12 flex flex-col items-center justify-center text-center">
                            <div className="relative mb-6">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    className="w-20 h-20 border-t-2 border-r-2 border-orange-500 rounded-full"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-neutral-500 animate-spin" />
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-white mb-2">Processing Transaction...</h3>
                            <p className="text-neutral-500 font-medium text-sm">
                                Securely contacting {method === 'apple_pay' ? 'Apple Pay' : method === 'paypal' ? 'PayPal' : 'your bank'}
                            </p>
                        </div>
                    )}

                    {/* ── Success State ───────────────────────────────── */}
                    {isSuccess && (
                        <div className="py-14 px-10 flex flex-col items-center justify-center text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 15 }}
                                className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 text-green-500 relative"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"
                                />
                                <CheckCircle size={40} className="relative z-10" />
                            </motion.div>

                            <h3 className="text-2xl font-black text-white tracking-tighter mb-2">Withdrawal Complete</h3>
                            <p className="text-neutral-400 font-medium">
                                ${numAmount.toFixed(2)} USD is on its way to your{' '}
                                {methods.find(m => m.id === method)?.label}.
                            </p>

                            {successRef && (
                                <p className="text-neutral-600 text-xs font-mono mt-3">Ref: {successRef}</p>
                            )}

                            <p className="mt-5 text-sm font-bold text-neutral-500">
                                New balance:{' '}
                                <span className="text-white">
                                    ${Number(foreignBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </p>

                            <button
                                id="withdraw-back-to-dashboard-btn"
                                onClick={resetAndClose}
                                className="mt-8 w-full bg-white text-black hover:bg-neutral-200 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98]"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default WithdrawModal;
