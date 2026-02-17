import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    ClipboardCheck,
    Wallet,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, path, active, hidden, badge, onClick }) => {
    if (hidden) return null;

    return (
        <Link to={path} onClick={onClick}>
            <motion.div
                whileHover={{ x: 5 }}
                className={`flex items-center justify-between px-6 py-4 transition-all ${active
                    ? 'bg-orange-500/10 border-r-2 border-orange-500 text-orange-400'
                    : 'text-neutral-500 hover:text-white'
                    }`}
            >
                <div className="flex items-center gap-3">
                    <Icon size={20} />
                    <span className="font-semibold text-sm tracking-wide">{label}</span>
                </div>
                {badge && (
                    <div className="flex items-center gap-1 bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border border-green-500/20">
                        <CheckCircle2 size={10} />
                        Done
                    </div>
                )}
            </motion.div>
        </Link>
    );
};

const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const sidebarRef = useRef(null);

    // Close sidebar when route changes
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    // Handle outside clicks
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsSidebarOpen(false);
            }
        };

        if (isSidebarOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSidebarOpen]);

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const menuItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        {
            label: 'Travel Checklist',
            icon: ClipboardCheck,
            path: '/travel-guide',
            badge: user?.checklist_progress === 100 || user?.is_in_kenya
        },
        { label: 'Wallet', icon: Wallet, path: '/wallet' },
        { label: 'Settings', icon: Settings, path: '/settings' },
    ];

    return (
        <div className="flex h-screen bg-neutral-950 text-white overflow-hidden">

            {/* Desktop Sidebar (Fixed) */}
            <aside className="hidden md:flex flex-col w-64 bg-neutral-900/50 border-r border-white/5 backdrop-blur-xl">
                <div className="p-8">
                    <h1 className="text-2xl font-black text-white tracking-tighter">
                        Zuru<span className="text-orange-500">.</span>
                    </h1>
                </div>

                <nav className="flex-1 mt-4">
                    {menuItems.map((item) => (
                        <SidebarItem
                            key={item.path}
                            {...item}
                            active={location.pathname === item.path}
                        />
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                        <LogOut size={20} />
                        <span className="font-bold text-sm">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-neutral-950/20 backdrop-blur-md sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden p-2 text-neutral-400 hover:text-white transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsSidebarOpen(true);
                            }}
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="font-bold text-neutral-200 hidden md:block">
                            Jambo, {user?.full_name?.split(' ')[0] || "Traveler"} 👋
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 bg-neutral-900 border border-white/5 rounded-xl text-neutral-400 relative"
                        >
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border border-neutral-950" />
                        </motion.button>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center font-bold text-white uppercase">
                            {user?.full_name?.charAt(0) || 'U'}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            {children || <Outlet />}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-[40] md:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                        {/* Sidebar */}
                        <motion.aside
                            ref={sidebarRef}
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 bottom-0 left-0 w-72 bg-neutral-900 z-[50] md:hidden flex flex-col border-r border-white/5 shadow-2xl"
                        >
                            <div className="p-6 flex items-center justify-between">
                                <h1 className="text-xl font-black text-white tracking-tighter">
                                    Zuru<span className="text-orange-500">.</span>
                                </h1>
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="p-2 text-neutral-500 hover:text-white"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <nav className="flex-1 overflow-y-auto">
                                {menuItems.map((item) => (
                                    <SidebarItem
                                        key={item.path}
                                        {...item}
                                        active={location.pathname === item.path}
                                        onClick={() => setIsSidebarOpen(false)}
                                    />
                                ))}
                            </nav>

                            <div className="p-6 border-t border-white/5 bg-neutral-950/20">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 p-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-sm transition-all active:scale-95"
                                >
                                    <LogOut size={20} /> Logout
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DashboardLayout;
