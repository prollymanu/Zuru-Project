import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
    User, Mail, Lock, Eye, EyeOff,
    MapPin, Plane, Globe, Calendar, Check, X,
    Loader2, ArrowLeft, Timer
} from 'lucide-react';
import api from '../api/axios';
import heroBg from '../assets/hero_bg.jpg';

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
    const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
    const [mode, setMode] = useState(initialMode);
    const isLogin = mode === 'login';

    // Global
    const [isLoading, setIsLoading] = useState(false);
    const [globalError, setGlobalError] = useState("");

    // Form Fields
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [nationality, setNationality] = useState("");
    const [travelStatus, setTravelStatus] = useState("planning"); // planning | in-kenya
    const [arrivalDate, setArrivalDate] = useState("");

    // UI States
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // OTP Component State
    const [showOTP, setShowOTP] = useState(false);
    const [otpError, setOtpError] = useState(false);
    const [otpMessage, setOtpMessage] = useState("");
    const [resendTimer, setResendTimer] = useState(0);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        setMode(searchParams.get('mode') === 'signup' ? 'signup' : 'login');
        setGlobalError("");
        setShowOTP(false);
    }, [searchParams]);

    // Resend Timer Logic
    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

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

    const canSubmit = isLogin
        ? (email && password)
        : (fullName && email && password && confirmPassword && nationality && isPasswordValid && isMatch);


    // --- Handlers ---

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setGlobalError("");

        try {
            const response = await api.post('/api/auth/login/', { email, password });

            // Save token
            if (response.data.access_token) {
                localStorage.setItem('access_token', response.data.access_token);
            }

            const { user } = response.data;
            navigate(user.is_in_kenya ? '/dashboard' : '/travel-guide');
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) {
                setGlobalError("Incorrect Password or Email. Please try again.");
            } else {
                setGlobalError("Unable to sign in. Check your connection.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;

        setIsLoading(true);
        setGlobalError("");
        setEmailError("");

        const payload = {
            email,
            password,
            full_name: fullName,
            nationality,
            travel_status: travelStatus,
            arrival_date: arrivalDate || null
        };

        try {
            await api.post('/api/auth/register/', payload);
            // On Success: Switch to OTP
            setShowOTP(true);
            setResendTimer(60); // Start timer
        } catch (err) {
            console.error(err);
            if (err.response) {
                if (err.response.status === 400 && err.response.data.email) {
                    setEmailError("This email is already registered.");
                } else if (err.response.status === 500) {
                    setGlobalError("Something went wrong on our end. Please try again later.");
                } else {
                    setGlobalError(err.response.data.detail || "Registration failed. Please check your inputs.");
                }
            } else {
                setGlobalError("Network error. Please check your connection.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (code) => {
        setIsLoading(true);
        setOtpError(false);
        setOtpMessage("");

        try {
            const response = await api.post('/api/auth/verify-otp/', { email, otp: code }); // Send 'otp' key

            // Save Tokens if returned
            if (response.data.access_token) {
                localStorage.setItem('access_token', response.data.access_token);
            }

            // Smart Redirect
            navigate(travelStatus === 'in-kenya' ? '/dashboard' : '/travel-guide');
        } catch (err) {
            console.error(err);
            setOtpError(true); // Shake animation
            const msg = err.response?.data?.otp?.[0] || err.response?.data?.detail || "Invalid verification code.";
            setOtpMessage(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (resendTimer > 0) return;
        setResendTimer(60);
        // Call resend API here (mock or real)
        // await api.post('/aut/resend-code', { email });
        console.log("Resending code to", email);
    };


    return (
        <div className="min-h-screen w-full flex bg-neutral-950 font-sans text-white overflow-hidden">

            {/* --- Left Side (Desktop Only) --- */}
            <div className="hidden md:block w-[40%] relative">
                <div className="absolute inset-0">
                    <img src={heroBg} className="w-full h-full object-cover" alt="Kenya Wildlife" />
                    <div className="absolute inset-0 bg-black/40" />
                </div>
                <div className="absolute bottom-16 left-12 z-20">
                    <h1 className="text-6xl font-black text-white drop-shadow-2xl leading-none">
                        Experience<br />Kenya
                    </h1>
                </div>
            </div>

            {/* --- Right Side / Mobile Full --- */}
            <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-neutral-950">

                {/* Mobile Header (Hidden on Desktop) */}
                <div className="md:hidden pt-8 px-6 pb-4">
                    <h1 className="text-2xl font-bold text-white">
                        Begin Your<br />
                        <span className="text-orange-500">Zuru Journey</span>
                    </h1>
                </div>

                <div className="flex-1 flex items-center justify-center p-4 md:p-12">
                    <div className="w-full max-w-lg">

                        {/* Back Button for OTP */}
                        {showOTP && (
                            <button
                                onClick={() => setShowOTP(false)}
                                className="mb-6 flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm font-medium"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                        )}

                        {/* Dynamic Header */}
                        <div className="mb-8 hidden md:block">
                            <h2 className="text-3xl font-bold mb-2">
                                {showOTP ? "Verify Email" : (isLogin ? "Welcome Back" : "Create Account")}
                            </h2>
                            <p className="text-neutral-400">
                                {showOTP ? `Code sent to ${email}` : (isLogin ? "Enter your details to sign in." : "Join us and explore everything Kenya.")}
                            </p>
                        </div>

                        {/* Global Error Alert */}
                        <AnimatePresence>
                            {globalError && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex gap-3 text-red-200 text-sm font-medium mb-6"
                                >
                                    <X className="w-5 h-5 flex-shrink-0" />
                                    {globalError}
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
                                    {/* OTP Error Message */}
                                    {otpMessage && <p className="text-red-500 text-sm mt-4 font-medium">{otpMessage}</p>}
                                </div>

                                <div className="text-center space-y-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            disabled={resendTimer > 0 || isLoading}
                                            onClick={handleResendCode}
                                            className={`font-semibold flex items-center gap-2 transition-colors ${resendTimer > 0 ? 'text-neutral-600 cursor-not-allowed' : 'text-white hover:text-orange-500'
                                                }`}
                                        >
                                            {resendTimer > 0 && <Timer className="w-4 h-4" />}
                                            {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : "Resend Verification Code"}
                                        </button>
                                    </div>
                                    <button
                                        disabled={isLoading}
                                        onClick={() => setShowOTP(false)}
                                        className="text-neutral-500 hover:text-white transition-colors text-sm"
                                    >
                                        Change Email
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
                                {/* --- Signup Only Fields --- */}
                                {!isLogin && (
                                    <>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-4 w-6 h-6 text-neutral-500" />
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                className="w-full h-14 bg-neutral-900 border border-neutral-800 rounded-2xl pl-14 pr-4 text-lg text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 transition-all"
                                                value={fullName}
                                                onChange={e => setFullName(e.target.value)}
                                            />
                                        </div>

                                        <div className="relative group">
                                            <Globe className="absolute left-4 top-4 w-6 h-6 text-neutral-500" />
                                            <select
                                                className="w-full h-14 bg-neutral-900 border border-neutral-800 rounded-2xl pl-14 pr-4 text-lg text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 transition-all appearance-none cursor-pointer"
                                                value={nationality}
                                                onChange={e => setNationality(e.target.value)}
                                            >
                                                <option value="" disabled>Nationality</option>
                                                {APPROVED_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>

                                        {/* Travel Toggle */}
                                        <div className="grid grid-cols-2 gap-4 my-2">
                                            <button
                                                type="button"
                                                onClick={() => setTravelStatus('in-kenya')}
                                                className={`h-14 rounded-2xl border flex items-center justify-center gap-2 transition-all ${travelStatus === 'in-kenya'
                                                    ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                                                    : 'bg-neutral-900 border-neutral-800 text-neutral-500'
                                                    }`}
                                            >
                                                <MapPin className="w-5 h-5" />
                                                <span className="font-bold">I'm in Kenya 🇰🇪</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTravelStatus('planning')}
                                                className={`h-14 rounded-2xl border flex items-center justify-center gap-2 transition-all ${travelStatus === 'planning'
                                                    ? 'bg-teal-500/10 border-teal-500 text-teal-400'
                                                    : 'bg-neutral-900 border-neutral-800 text-neutral-500'
                                                    }`}
                                            >
                                                <Plane className="w-5 h-5" />
                                                <span className="font-bold">Planning Trip ✈️</span>
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {travelStatus === 'planning' && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="relative group mb-1">
                                                        <Calendar className="absolute left-4 top-4 w-6 h-6 text-neutral-500" />
                                                        <input
                                                            type="date"
                                                            min={today}
                                                            className="w-full h-14 bg-neutral-900 border border-neutral-800 rounded-2xl pl-14 pr-4 text-lg text-white placeholder-neutral-600 focus:outline-none focus:border-teal-500 transition-all"
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

                                {/* --- Common Fields --- */}
                                <div className="relative group">
                                    <Mail className={`absolute left-4 top-4 w-6 h-6 ${emailError ? 'text-red-500' : 'text-neutral-500'}`} />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        className={`w-full h-14 bg-neutral-900 border rounded-2xl pl-14 pr-4 text-lg text-white placeholder-neutral-600 focus:outline-none transition-all
                                            ${emailError
                                                ? 'border-red-500 focus:border-red-500'
                                                : 'border-neutral-800 focus:border-orange-500'}`}
                                        value={email}
                                        onChange={e => {
                                            setEmail(e.target.value);
                                            setEmailError("");
                                            setGlobalError("");
                                        }}
                                    />
                                    {emailError && <p className="text-red-500 text-sm mt-2 ml-1">{emailError}</p>}
                                </div>

                                <div className="relative group">
                                    <Lock className="absolute left-4 top-4 w-6 h-6 text-neutral-500" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        className="w-full h-14 bg-neutral-900 border border-neutral-800 rounded-2xl pl-14 pr-12 text-lg text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 transition-all"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-4 text-neutral-500 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                                    </button>
                                </div>

                                {!isLogin && (
                                    <>
                                        {/* Password Checklist */}
                                        <PasswordChecklist password={password} />

                                        <div className="relative group mt-2">
                                            <Lock className="absolute left-4 top-4 w-6 h-6 text-neutral-500" />
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Confirm Password"
                                                className={`w-full h-14 bg-neutral-900 border rounded-2xl pl-14 pr-12 text-lg text-white placeholder-neutral-600 focus:outline-none transition-all
                                                    ${confirmPassword && !isMatch ? 'border-red-500 focus:border-red-500' : 'border-neutral-800 focus:border-orange-500'}`}
                                                value={confirmPassword}
                                                onChange={e => setConfirmPassword(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-4 top-4 text-neutral-500 hover:text-white"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                                            </button>
                                        </div>
                                    </>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading || (!isLogin && !canSubmit)}
                                    className={`w-full h-14 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 mt-6 transition-all
                                        ${isLoading || (!isLogin && !canSubmit)
                                            ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-50'
                                            : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:shadow-orange-900/40 active:scale-[0.98]'
                                        }`}
                                >
                                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isLogin ? "Sign In" : "Create Account")}
                                </button>
                            </form>
                        )}

                        <div className="mt-8 text-center pb-8 md:pb-0">
                            <p className="text-neutral-500">
                                {isLogin ? "New to Zuru?" : "Already member?"}
                                <button onClick={toggleMode} className="ml-2 text-white font-bold hover:underline">
                                    {isLogin ? "Create Account" : "Sign In"}
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
