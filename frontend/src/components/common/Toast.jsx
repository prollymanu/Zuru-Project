import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%', transition: { duration: 0.2 } }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[92vw] md:max-w-md flex items-start gap-4 p-4 rounded-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.2)] backdrop-blur-md bg-white/70 dark:bg-black/70"
        >
            <div className="shrink-0 mt-0.5">
                {type === 'success' ? (
                    <CheckCircle className="text-emerald-500" size={24} />
                ) : type === 'error' ? (
                    <AlertCircle className="text-red-500" size={24} />
                ) : (
                    <Info className="text-orange-500" size={24} />
                )}
            </div>
            <span className={`font-bold text-sm uppercase tracking-wider flex-1 ${type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}>
                {message}
            </span>
            <button onClick={onClose} className="shrink-0 opacity-50 hover:opacity-100 mt-0.5 dark:text-white text-black">
                <X size={20} />
            </button>
        </motion.div>
    );
};

export default Toast;
