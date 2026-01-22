const API_URL = import.meta.env.VITE_API_URL;

export const authService = {
    getToken: () => localStorage.getItem('token'),
    setToken: (token: string) => localStorage.setItem('token', token),
    logout: () => localStorage.removeItem('token'),

    fetchWithAuth: async (url: string, options: RequestInit = {}) => {
        const token = localStorage.getItem('token');
        const headers = {
            ...options.headers,
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const response = await fetch(`${API_URL}${url}`, { ...options, headers });
        const result = await response.json();
        return result;
    },

    getUserProfile: async () => {
        return authService.fetchWithAuth('/v1/users/me');
    },

    updateProfile: async (data: any) => {
        return authService.fetchWithAuth('/v1/users/me', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    updateAvatar: async (avatar: string) => {
        return authService.fetchWithAuth('/v1/users/me/avatar', {
            method: 'PATCH',
            body: JSON.stringify({ avatar })
        });
    },

    checkOnboarding: async () => {
        const result = await authService.fetchWithAuth('/v1/onboarding/status');
        return result.data;
    },

    isAdmin: async () => {
        const result = await authService.getUserProfile();
        return result.success && result.data.role === 'admin';
    },

    // Admin Methods
    listUsers: async () => {
        return authService.fetchWithAuth('/v1/users/all');
    },

    updateUserRole: async (userId: string, role: string) => {
        return authService.fetchWithAuth(`/v1/users/${userId}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role })
        });
    },

    deleteUser: async (userId: string) => {
        return authService.fetchWithAuth(`/v1/users/${userId}`, {
            method: 'DELETE'
        });
    },

    // Settings Methods
    updateNotifications: async (data: any) => {
        return authService.fetchWithAuth('/v1/settings/notifications', {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    },

    changePassword: async (data: any) => {
        return authService.fetchWithAuth('/v1/settings/password', {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    },

    getSessions: async () => {
        return authService.fetchWithAuth('/v1/settings/sessions');
    },

    exportData: async () => {
        return authService.fetchWithAuth('/v1/settings/export-data', {
            method: 'POST'
        });
    },

    deleteAccount: async () => {
        return authService.fetchWithAuth('/v1/settings/account', {
            method: 'DELETE'
        });
    },

    // Email Verification
    verifyEmail: async (token: string) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/v1/auth/verify-email/${token}`, {
            method: 'POST'
        });
        return response.json();
    },

    resendVerification: async () => {
        return authService.fetchWithAuth('/v1/auth/resend-verification', {
            method: 'POST'
        });
    }
};
