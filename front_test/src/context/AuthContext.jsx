// Manages global authentication state and validates JWT token expiration
import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');

        if (token) {
            try {
                const decoded = jwtDecode(token);
                const isExpired = decoded.exp * 1000 < Date.now();

                if (isExpired) {
                    localStorage.removeItem('access_token');
                    setUser(null);
                } else {
                    setUser({
                        id: decoded.user_id,
                        role: decoded.role || 'user'
                    });
                }
            } catch (err) {
                localStorage.removeItem('access_token');
                setUser(null);
            }
        }

        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const response = await api.post('/token/', { username, password });
        
        const token = response.data.access;
        localStorage.setItem('access_token', token);

        const decoded = jwtDecode(token);

        setUser({
            id: decoded.user_id,
            username: username,
            role: decoded.role || 'NO_ROLE'
        });
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};