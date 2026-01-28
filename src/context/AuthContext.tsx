import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    login: (email: string, pass: string) => Promise<boolean>;
    register: (name: string, email: string, pass: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    loading: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import client from '../api/client';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = async (email: string, pass: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await client.post('/auth/login', { email, password: pass });
            saveUser(data);
            setLoading(false);
            return true;
        } catch (err: any) {
            setLoading(false);
            setError(err.response?.data?.message || 'Login failed');
            return false;
        }
    };

    const register = async (name: string, email: string, pass: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await client.post('/auth/register', { name, email, password: pass });
            saveUser(data);
            setLoading(false);
            return true;
        } catch (err: any) {
            setLoading(false);
            setError(err.response?.data?.message || 'Registration failed');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    const saveUser = (userData: User) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    }

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            logout,
            isAuthenticated: !!user,
            isAdmin: user?.role === 'admin',
            loading,
            error
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
