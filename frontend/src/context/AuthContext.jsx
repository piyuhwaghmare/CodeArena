import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if already logged in on page load
    useEffect(() => {
        api.get('/me')
            .then(res => setUser(res.data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/api/auth/login', { email, password });   //post login credentials to backend
        setUser(res.data.user);
        return res.data;
    };

    const register = async (username, email, password) => {
        const res = await api.post('/api/auth/register', {      //post registration details to backend
            username, email, password
        });
        setUser(res.data.user);
        return res.data;
    };

    const logout = async () => {
        await api.post('/api/auth/logout');    //post logout request to backend
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>   
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {          //creted custom hook to access auth context
    return useContext(AuthContext);
}