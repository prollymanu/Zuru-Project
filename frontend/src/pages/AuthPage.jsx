import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Lock, Eye, EyeOff,
    MapPin, Plane, Globe, Calendar, Check, X,
    Loader2, ArrowLeft, Timer
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import loginSignupImg from '../assets/login_signup.jfif';

const APPROVED_COUNTRIES = [
    "United States", "United Kingdom", "Canada", "Australia",
    "Germany", "France", "Italy", "Spain", "Switzerland",
    "Netherlands", "Sweden", "Norway", "Japan", "South Korea",
    "United Arab Emirates", "South Africa", "Rwanda", "Kenya"
];

// --- Sub-Components ---

const OTPInput = ({ length = 6, onComplete, error }) => {
    const [otp, setOtp] = useState(new Array(length).fill(""));
    const inputs = useRef([]);

    const handleChange = (val, index) => {
        if (isNaN(val)) return;
        const newOtp = [...otp];
        newOtp[index] = val;
        setOtp(newOtp);

        if (val && index < length - 1) {
            inputs.current[index + 1].focus();
        }

        if (newOtp.every(d => d !== "") && index === length - 1) {
            onComplete(newOtp.join(""));
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    return (
        <motion.div
            className="flex gap-2 justify-center"
            animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
        >
            {otp.map((d, i) => (
                <input
                    key={i}
                    ref={ref => inputs.current[i] = ref}
                    type="text"
                    maxLength={1}
                    className={`w-12 h-16 rounded-xl bg-neutral-900 border text-center text-xl font-bold text-white focus:outline-none focus:border-orange-500 transition-all ${error ? 'border-red-500 text-red-500' : 'border-neutral-800'
                        }`}
                    value={d}
                    onChange={e => handleChange(e.target.value, i)}
                    onKeyDown={e => handleKeyDown(e, i)}
                />
            ))}
        </motion.div>
    );
};

const PasswordChecklist = ({ password }) => {
    const criteria = [
        { label: "8+ Characters", pass: password.length >= 8 },
        { label: "Number & Special Char", pass: /\d/.test(password) && /[!@#$%^&*]/.test(password) },
        { label: "Uppercase & Lowercase", pass: /[A-Z]/.test(password) && /[a-z]/.test(password) },
    ];

    return (
        <div className="grid grid-cols-1 gap-2 mt-2 pl-1">
            {criteria.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                    <motion.div
                        initial={false}
                        animate={{
                            backgroundColor: c.pass ? "#10B981" : "#262626",
                            scale: c.pass ? 1.1 : 1
                        }}
                        className="w-4 h-4 rounded-full flex items-center justify-center"
                    >
                        {c.pass && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
                    </motion.div>
                    <span className={c.pass ? "text-green-400 font-medium" : "text-neutral-500"}>
                        {c.label}
                    </span>
                </div>
            ))}
        </div>
    );
};

// --- Main Component ---

const AuthPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login, isLoading: authLoading } = useAuth();
    const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
    const [mode, setMode] = useState(initialMode);
    const isLogin = mode === 'login';

    // Global UI States
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [globalError, setGlobalError] = useState("");
    const [errors, setErrors] = useState({}); // Field-level errors

    // Form Fields
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [nationality, setNationality] = useState("");
    const [travelStatus, setTravelStatus] = useState("planning"); // planning | in-kenya
    const [arrivalDate, setArrivalDate] = useState("");

    // Visual UI States
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // OTP States
    const [showOTP, setShowOTP] = useState(false);
    const [otpError, setOtpError] = useState(false);
    const [otpMessage, setOtpMessage] = useState("");
    const [resendTimer, setResendTimer] = useState(0);
    const [isVerifying, setIsVerifying] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        setMode(searchParams.get('mode') === 'signup' ? 'signup' : 'login');
        setGlobalError("");
        setErrors({});
        setShowOTP(false);
        setIsVerifying(false);
    }, [searchParams]);

    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    if (authLoading) return null;

    const toggleMode = () => {
        navigate(`/auth?mode=${isLogin ? 'signup' : 'login'}`);
    };

    // --- Validation Logic ---
    const isPasswordValid =
        password.length >= 8 &&
        /\d/.test(password) &&
        /[!@#$%^&*]/.test(password) &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password);

    const isMatch = password === confirmPassword;

    const isFormValid = () => {
        if (isLogin) {
            return email && password;
        } else {
            const basic = fullName && email && password && confirmPassword && nationality && isPasswordValid && isMatch;
            if (travelStatus === 'planning') {
                return basic && arrivalDate;
            }
            return basic;
        }
    };

    // --- Unified Auth Handler ---
    const handleAuth = async (e) => {
        e.preventDefault();
        if (!isFormValid()) return;
        setIsActionLoading(true);
        setGlobalError("");
        setErrors({});

        const endpoint = isLogin ? '/api/auth/login/' : '/api/auth/register/';
        const payload = isLogin
            ? { email, password }
            : {
                email,
                password,
                full_name: fullName,
                nationality,
                is_in_kenya: travelStatus === 'in-kenya',
                expected_arrival_date: travelStatus === 'planning' ? (arrivalDate || null) : null
            };

        try {
            const response = await api.post(endpoint, payload);

            if (isLogin) {
                const { token, user: userData } = response.data;
                // Add verification flow even for login if needed, but user asked for handleVerifyOTP
                login(token, userData);
                navigate(userData.is_in_kenya ? '/dashboard' : '/travel-guide');
            } else {
                // For signup, we transition to OTP
                setShowOTP(true);
                setResendTimer(60);
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 400) {
                // Field-specific errors from backend
                setErrors(err.response.data);
            } else if (err.response?.status === 401) {
                setGlobalError("Incorrect Password or Email.");
            } else if (err.response && err.response.status === 403 && isLogin) {
                setGlobalError("Please verify your email first.");
                setShowOTP(true);
            } else {
                setErrors({ global: "Connection error. Please try again." });
            }
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleVerifyOTP = async (code) => {
        setIsActionLoading(true);
        setOtpError(false);
        setOtpMessage("");

        try {
            const response = await api.post('/api/auth/verify-otp/', { email, otp: code });
            const { token, user: userData } = response.data;

            // Trigger Full Screen Loading Overlay
            setIsVerifying(true);

            // Synthetic Delay for "Pro" feel
            await new Promise(resolve => setTimeout(resolve, 1500));

            login(token, userData);
            navigate(userData.is_in_kenya ? '/dashboard' : '/travel-guide');
        } catch (err) {
            setOtpError(true);
            const msg = err.response?.data?.error || "Invalid code.";
            setOtpMessage(msg);
            setIsVerifying(false);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (resendTimer > 0) return;
        setResendTimer(60);
        try {
            await api.post('/api/auth/resend-otp/', { email });
        } catch {
            setOtpMessage("Failed to resend code.");
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-neutral-950 font-sans text-white overflow-hidden relative">

            {/* Verification Overlay */}
            <AnimatePresence>
                {isVerifying && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-neutral-950/80 backdrop-blur-xl"
                    >
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="w-24 h-24 rounded-full border-t-2 border-r-2 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="w-4 h-4 bg-orange-500 rounded-full"
                                />
                            </div>
                        </div>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mt-8 text-center"
                        >
                            <h3 className="text-2xl font-black text-white mb-2 tracking-tighter">Preparing Your Journey</h3>
                            <p className="text-neutral-500 font-medium">Verifying your credentials...</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Left Side: Hero Image (Desktop Only) --- */}
            <div className="hidden md:block w-[45%] relative">
                <div className="absolute inset-0">
                    <img src={loginSignupImg} className="w-full h-full object-cover" alt="Kenya Travel & Culture" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                </div>
                {/* Hero Overlay Text */}
                <div className="absolute bottom-12 left-12 z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-6xl font-black text-white leading-none drop-shadow-2xl">
                            Travel with<br />
                            <span className="text-orange-500">Confidence</span>
                        </h1>
                        <p className="mt-4 text-neutral-300 text-lg font-medium max-w-xs drop-shadow-md font-serif italic">
                            The Zuru way. Simplified.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* --- Right Side: Auth Form --- */}
            <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-neutral-950">

                {/* Mobile Header (Hidden on Desktop) */}
                <div className="md:hidden pt-12 px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-black text-white">
                        Zuru<span className="text-orange-500">.</span>
                    </h1>
                </div>

                <div className="flex-1 flex items-center justify-center p-6 md:p-12">
                    <div className="w-full max-w-sm">

                        {/* OTP Flow Header */}
                        {showOTP && (
                            <button
                                onClick={() => setShowOTP(false)}
                                className="mb-6 flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm font-medium"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to {isLogin ? 'Login' : 'Signup'}
                            </button>
                        )}

                        {/* Title Header */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold mb-2 tracking-tight">
                                {showOTP ? "Verify Email" : (isLogin ? "Welcome Back" : "Join Zuru")}
                            </h2>
                            <p className="text-neutral-400 text-sm">
                                {showOTP ? `We sent a code to ${email}` : (isLogin ? "Sign in to continue." : "Your digital bridge to Kenya.")}
                            </p>
                        </div>

                        {/* Global Error Alert */}
                        <AnimatePresence>
                            {(globalError || errors.global) && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="bg-red-500/10 border border-red-500/50 rounded-2xl p-4 flex gap-3 text-red-200 text-sm font-medium mb-6"
                                >
                                    <X className="w-5 h-5 flex-shrink-0" />
                                    {globalError || errors.global}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {showOTP ? (
                            <div className="space-y-8">
                                <div className="p-8 border border-white/5 rounded-3xl bg-neutral-900/50 text-center">
                                    <OTPInput
                                        length={6}
                                        onComplete={handleVerifyOTP}
                                        error={otpError}
                                    />
                                    {otpMessage && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-red-500 text-xs mt-4 font-semibold"
                                        >
                                            {otpMessage}
                                        </motion.p>
                                    )}
                                </div>

                                <div className="text-center space-y-4">
                                    <button
                                        disabled={resendTimer > 0 || isActionLoading}
                                        onClick={handleResendCode}
                                        className={`font-semibold flex items-center justify-center gap-2 mx-auto transition-colors ${resendTimer > 0 ? 'text-neutral-600' : 'text-orange-500 hover:text-orange-400'}`}
                                    >
                                        {resendTimer > 0 && <Timer className="w-4 h-4" />}
                                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleAuth} className="space-y-4">
                                {!isLogin && (
                                    <>
                                        {/* Full Name */}
                                        <div className="relative">
                                            <User className="absolute left-4 top-4 w-5 h-5 text-neutral-500" />
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                className="w-full h-14 bg-neutral-900 border border-neutral-800 rounded-2xl pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 transition-all font-medium text-sm"
                                                value={fullName}
                                                onChange={e => setFullName(e.target.value)}
                                            />
                                        </div>

                                        {/* Nationality */}
                                        <div className="relative">
                                            <Globe className="absolute left-4 top-4 w-5 h-5 text-neutral-500" />
                                            <select
                                                className="w-full h-14 bg-neutral-900 border border-neutral-800 rounded-2xl pl-12 pr-10 text-white focus:outline-none focus:border-orange-500 appearance-none font-medium text-sm"
                                                value={nationality}
                                                onChange={e => setNationality(e.target.value)}
                                            >
                                                <option value="" disabled>Select Nationality</option>
                                                {APPROVED_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>

                                        {/* Travel Status Toggle */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setTravelStatus('in-kenya')}
                                                className={`h-14 rounded-2xl border flex items-center justify-center gap-2 transition-all ${travelStatus === 'in-kenya' ? 'bg-orange-500/10 border-orange-500 text-orange-400' : 'bg-neutral-900 border-neutral-800 text-neutral-500'}`}
                                            >
                                                <MapPin className="w-4 h-4" />
                                                <span className="font-bold text-xs uppercase tracking-wider">I'm Home 🇰🇪</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTravelStatus('planning')}
                                                className={`h-14 rounded-2xl border flex items-center justify-center gap-2 transition-all ${travelStatus === 'planning' ? 'bg-teal-500/10 border-teal-500 text-teal-400' : 'bg-neutral-900 border-neutral-800 text-neutral-500'}`}
                                            >
                                                <Plane className="w-4 h-4" />
                                                <span className="font-bold text-xs uppercase tracking-wider">Planning ✈️</span>
                                            </button>
                                        </div>

                                        {/* Arrival Date */}
                                        <AnimatePresence>
                                            {travelStatus === 'planning' && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="relative py-1">
                                                        <Calendar className="absolute left-4 top-5 w-5 h-5 text-neutral-500" />
                                                        <input
                                                            type="date"
                                                            min={today}
                                                            className="w-full h-14 bg-neutral-900 border border-neutral-800 rounded-2xl pl-12 pr-4 text-white focus:outline-none focus:border-teal-500 transition-all font-medium text-sm"
                                                            value={arrivalDate}
                                                            onChange={e => setArrivalDate(e.target.value)}
                                                            style={{ colorScheme: 'dark' }}
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </>
                                )}

                                {/* Email */}
                                <div className="relative">
                                    <Mail className={`absolute left-4 top-4 w-5 h-5 ${errors.email ? 'text-red-500' : 'text-neutral-500'}`} />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        className={`w-full h-14 bg-neutral-900 border rounded-2xl pl-12 pr-4 text-white focus:outline-none transition-all font-medium text-sm ${errors.email ? 'border-red-500' : 'border-neutral-800 focus:border-orange-500'}`}
                                        value={email}
                                        onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: null })); }}
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-[10px] mt-1.5 ml-1 font-semibold uppercase tracking-wider">
                                            {Array.isArray(errors.email) ? errors.email[0] : errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Password */}
                                <div className="relative">
                                    <Lock className="absolute left-4 top-4 w-5 h-5 text-neutral-500" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        className="w-full h-14 bg-neutral-900 border border-neutral-800 rounded-2xl pl-12 pr-12 text-white focus:outline-none focus:border-orange-500 font-medium text-sm"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-4 text-neutral-500"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {!isLogin && (
                                    <>
                                        <PasswordChecklist password={password} />

                                        {/* Confirm Password */}
                                        <div className="relative mt-2">
                                            <Lock className="absolute left-4 top-4 w-5 h-5 text-neutral-500" />
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Confirm Password"
                                                className={`w-full h-14 bg-neutral-900 border rounded-2xl pl-12 pr-12 text-white focus:outline-none font-medium text-sm ${confirmPassword && !isMatch ? 'border-red-500' : 'border-neutral-800 focus:border-orange-500'}`}
                                                value={confirmPassword}
                                                onChange={e => setConfirmPassword(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-4 top-4 text-neutral-500"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isActionLoading || !isFormValid()}
                                    className={`w-full h-14 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 mt-6 transition-all ${isActionLoading || !isFormValid() ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed' : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:brightness-110 active:scale-[0.98] shadow-lg shadow-orange-900/40'}`}
                                >
                                    {isActionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? "Sign In" : "Get Started")}
                                </button>
                            </form>
                        )}

                        {/* Toggle Link */}
                        <div className="mt-8 text-center">
                            <p className="text-neutral-500 text-xs font-medium uppercase tracking-wider">
                                {isLogin ? "Don't have an account?" : "Already joined Zuru?"}
                                <button onClick={toggleMode} className="ml-2 text-white font-black hover:text-orange-500 transition-colors underline decoration-orange-500 underline-offset-4">
                                    {isLogin ? "Register Now" : "Sign In"}
                                </button>
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
