import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../../services/authService';

interface AdminPanelProps {
    onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const result = await authService.listUsers();
            if (result.success) {
                setUsers(result.data);
            }
        } catch (err) {
            console.error('failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        setActionLoading(userId);
        try {
            const result = await authService.updateUserRole(userId, newRole);
            if (result.success) {
                setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
            } else {
                alert(result.message || 'update failed');
            }
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!window.confirm('are you sure? this will yeet the user permanently 💀')) return;

        setActionLoading(userId);
        try {
            const result = await authService.deleteUser(userId);
            if (result.success) {
                setUsers(users.filter(u => u._id !== userId));
            } else {
                alert(result.message || 'delete failed');
            }
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="fixed inset-0 bg-black z-[110] flex flex-col">
            {/* Header */}
            <header className="p-6 border-b border-white/10 flex justify-between items-center bg-black/50 backdrop-blur-xl">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-black tracking-tighter uppercase text-accent-blue">admin panel 🛡️</h1>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">command center</p>
                </div>
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                    ✕
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <div className="w-12 h-12 border-4 border-accent-blue border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm font-mono text-white/40">fetching the real ones...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                            <h2 className="text-xs font-bold uppercase text-white/30 tracking-widest">users ({users.length})</h2>
                        </div>

                        <div className="space-y-3">
                            {users.map((user) => (
                                <motion.div
                                    layout
                                    key={user._id}
                                    className="p-4 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-white/5">
                                            {user.avatar ? (
                                                <img src={user.avatar} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xl font-bold">
                                                    {user.username[0].toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">@{user.username}</span>
                                                {user.role === 'admin' && (
                                                    <span className="px-2 py-0.5 bg-accent-blue/20 text-accent-blue text-[8px] font-black uppercase rounded-full">admin</span>
                                                )}
                                            </div>
                                            <span className="text-xs text-white/30">{user.email}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            disabled={!!actionLoading}
                                            onClick={() => handleRoleUpdate(user._id, user.role)}
                                            className={`p-2 rounded-xl text-[10px] font-black uppercase transition-all ${user.role === 'admin'
                                                    ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                                                    : 'bg-accent-blue/20 text-accent-blue hover:bg-accent-blue/30'
                                                }`}
                                        >
                                            {actionLoading === user._id ? '...' : user.role === 'admin' ? 'demote' : 'promote'}
                                        </button>
                                        <button
                                            disabled={!!actionLoading}
                                            onClick={() => handleDelete(user._id)}
                                            className="p-2 rounded-xl bg-red-500/20 text-red-400 text-[10px] font-black uppercase hover:bg-red-500/30 transition-all"
                                        >
                                            {actionLoading === user._id ? '...' : 'yeet'}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Background Accents */}
            <div className="fixed top-[-20%] left-[-20%] w-[60%] h-[60%] bg-accent-blue/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />
        </div>
    );
};
