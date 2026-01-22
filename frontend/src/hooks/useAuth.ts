import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    const checkAuth = async () => {
        const token = authService.getToken();
        if (!token) {
            setUser(null);
            setIsAdmin(false);
            setLoading(false);
            return;
        }

        try {
            const result = await authService.getUserProfile();
            if (result.success) {
                setUser(result.data);
                setIsAdmin(result.data.role === 'admin');
            } else {
                authService.logout();
                setUser(null);
                setIsAdmin(false);
            }
        } catch (err) {
            setUser(null);
            setIsAdmin(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return { user, loading, isAdmin, refreshAuth: checkAuth };
};
