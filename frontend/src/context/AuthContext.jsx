import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('access_token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    // Assuming there's a profile endpoint to validate token and get user data
                    const response = await api.get('/api/auth/profile/');
                    setUser(response.data);
                } catch (err) {
                    console.error("Session restoration failed:", err);
                    logout();
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, [token]);

    const login = (newToken, userData) => {
        localStorage.setItem('access_token', newToken);
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.clear(); // Total reset as requested
        setToken(null);
        setUser(null);
        // Dispatch custom event for hooks like useIdleTimer to listen if needed
        window.dispatchEvent(new Event('auth-logout'));
    };

    const updateUser = (newData) => {
        setUser(prev => ({ ...prev, ...newData }));
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, isLoading, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined || context === null) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
