import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast from '../components/common/Toast';

const ToastContext = createContext(null);

/**
 * Provides a global `showToast(message, type)` function accessible anywhere
 * in the component tree via `useToast()`.
 *
 * It also listens for the custom DOM event `zuru:toast` so the Axios
 * interceptor (which lives outside React) can trigger toasts without
 * requiring prop-drilling or context imports inside the api layer.
 */
export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, type = 'error') => {
        setToast({ message, type, key: Date.now() });
    }, []);

    const dismissToast = useCallback(() => {
        setToast(null);
    }, []);

    // Allow the Axios interceptor to trigger toasts via a CustomEvent
    useEffect(() => {
        const handler = (e) => {
            const { message, type } = e.detail || {};
            if (message) showToast(message, type || 'error');
        };
        window.addEventListener('zuru:toast', handler);
        return () => window.removeEventListener('zuru:toast', handler);
    }, [showToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <AnimatePresence>
                {toast && (
                    <Toast
                        key={toast.key}
                        message={toast.message}
                        type={toast.type}
                        onClose={dismissToast}
                    />
                )}
            </AnimatePresence>
        </ToastContext.Provider>
    );
};

/** Hook — use this inside any component to trigger a Zuru Toast. */
export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error('useToast must be used inside <ToastProvider>');
    }
    return ctx;
};
