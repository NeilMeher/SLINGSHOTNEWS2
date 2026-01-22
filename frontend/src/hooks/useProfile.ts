import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const useProfile = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const result = await authService.getUserProfile();
            if (result.success) {
                setProfile(result.data);
            } else {
                setError(result.message || 'failed to fetch profile');
            }
        } catch (err) {
            setError('network error, try again later');
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (data: any) => {
        setUpdating(true);
        // Optimistic UI Update
        const oldProfile = { ...profile };
        setProfile({ ...profile, ...data });

        try {
            const result = await authService.updateProfile(data);
            if (!result.success) {
                setProfile(oldProfile); // Rollback
                return { success: false, message: result.message };
            }
            return { success: true };
        } catch (err) {
            setProfile(oldProfile); // Rollback
            return { success: false, message: 'failed to update' };
        } finally {
            setUpdating(false);
        }
    };

    const updateAvatar = async (avatar: string) => {
        setUpdating(true);
        try {
            const result = await authService.updateAvatar(avatar);
            if (result.success) {
                setProfile((prev: any) => ({ ...prev, avatar }));
                return { success: true };
            }
            return { success: false, message: result.message };
        } catch (err) {
            return { success: false, message: 'failed to update avatar' };
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    return { profile, loading, error, updating, updateProfile, updateAvatar, refresh: fetchProfile };
};
