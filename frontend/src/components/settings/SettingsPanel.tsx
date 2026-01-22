import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../../services/authService';
import { Bell, Shield, User, Smartphone, Download, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

interface SettingsPanelProps {
    onClose: () => void;
}

type Tab = 'profile' | 'security' | 'notifications' | 'account';

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<Tab>('profile');
    const [profile, setProfile] = useState<any>(null);
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Form States
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [notifPrefs, setNotifPrefs] = useState({ email: true, push: true, frequency: 'daily' });

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const profileResult = await authService.getUserProfile();
                if (profileResult.success) {
                    setProfile(profileResult.data);
                    setNotifPrefs(profileResult.data.notificationPreferences || { email: true, push: true, frequency: 'daily' });
                }
                const sessionResult = await authService.getSessions();
                if (sessionResult.success) setSessions(sessionResult.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const showToast = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) return showToast('error', 'passwords do not match 💀');
        setUpdating(true);
        try {
            const result = await authService.changePassword({
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            if (result.success) {
                showToast('success', 'password updated! 🔐');
                setPasswords({ current: '', new: '', confirm: '' });
            } else {
                showToast('error', result.message || 'update failed');
            }
        } finally {
            setUpdating(false);
        }
    };

    const handleNotifUpdate = async (updates: any) => {
        const newData = { ...notifPrefs, ...updates };
        setNotifPrefs(newData); // Optimistic
        try {
            await authService.updateNotifications(newData);
        } catch (err) {
            showToast('error', 'failed to sync preferences');
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm("caution: this will permanently yeet your account and all data. this cannot be undone. proceed? 🛑");
        if (!confirmed) return;

        try {
            const result = await authService.deleteAccount();
            if (result.success) {
                authService.logout();
                window.location.reload();
            } else {
                showToast('error', result.message || 'deletion failed');
            }
        } catch (err) {
            showToast('error', 'something went wrong');
        }
    };

    const handleExport = async () => {
        showToast('success', 'export initiated! check your email 📦');
        await authService.exportData();
    };

    if (loading) return (
        <div className="fixed inset-0 bg-black z-[120] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-accent-pink border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black z-[120] flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar (Desktop) / Tab Bar (Mobile) */}
            <aside className="w-full md:w-64 bg-white/5 border-b md:border-b-0 md:border-r border-white/10 p-6 flex flex-row md:flex-col gap-2 overflow-x-auto no-scrollbar pt-16 md:pt-10">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all whitespace-nowrap ${activeTab === 'profile' ? 'bg-accent-blue/20 text-accent-blue font-black' : 'text-white/40 hover:text-white'}`}
                >
                    <User size={18} /> <span className="text-sm">profile</span>
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all whitespace-nowrap ${activeTab === 'security' ? 'bg-accent-blue/20 text-accent-blue font-black' : 'text-white/40 hover:text-white'}`}
                >
                    <Shield size={18} /> <span className="text-sm">security</span>
                </button>
                <button
                    onClick={() => setActiveTab('notifications')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all whitespace-nowrap ${activeTab === 'notifications' ? 'bg-accent-blue/20 text-accent-blue font-black' : 'text-white/40 hover:text-white'}`}
                >
                    <Bell size={18} /> <span className="text-sm">notifications</span>
                </button>
                <button
                    onClick={() => setActiveTab('account')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all whitespace-nowrap ${activeTab === 'account' ? 'bg-accent-blue/20 text-accent-blue font-black' : 'text-white/40 hover:text-white'}`}
                >
                    <AlertCircle size={18} /> <span className="text-sm">account</span>
                </button>

                <div className="md:mt-auto pt-6 border-t border-white/5 md:flex hidden flex-col">
                    <button onClick={onClose} className="text-xs font-bold text-white/20 hover:text-white uppercase tracking-widest text-left px-4">go back</button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-6 md:p-12 relative pb-24">
                <button onClick={onClose} className="md:hidden absolute top-6 right-6 text-white/40 hover:text-white z-20">✕</button>

                <AnimatePresence mode="wait">
                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-xl mx-auto space-y-10"
                        >
                            <header>
                                <h2 className="text-4xl font-black italic tracking-tighter lowercase">profile settings 💅</h2>
                                <p className="text-white/40 text-sm mt-2">manage how others see you on the vibe chain.</p>
                            </header>

                            <section className="space-y-6">
                                <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/5">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-800 to-black border-4 border-white/10 flex items-center justify-center text-3xl">
                                        {profile.avatar ? <img src={profile.avatar} className="w-full h-full rounded-full object-cover" /> : profile.username[0].toUpperCase()}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <h3 className="font-bold text-lg lowercase">@{profile.username}</h3>
                                        <button className="text-[10px] font-black uppercase text-accent-blue tracking-widest hover:underline">change avatar</button>
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    <label className="text-xs font-black uppercase text-white/20 tracking-widest pl-2">email</label>
                                    <input disabled value={profile.email} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 opacity-50 cursor-not-allowed" />
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === 'security' && (
                        <motion.div
                            key="security"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-xl mx-auto space-y-12"
                        >
                            <header>
                                <h2 className="text-4xl font-black italic tracking-tighter lowercase text-accent-yellow">shield mode 🔒</h2>
                                <p className="text-white/40 text-sm mt-2">keep your account secure from the ops.</p>
                            </header>

                            <section className="space-y-8">
                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    <h3 className="text-xs font-black uppercase text-white/20 tracking-widest">change password</h3>
                                    <div className="grid gap-4">
                                        <input
                                            type="password"
                                            placeholder="current password"
                                            value={passwords.current}
                                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-accent-yellow transition-colors outline-none"
                                        />
                                        <input
                                            type="password"
                                            placeholder="new password"
                                            value={passwords.new}
                                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-accent-yellow outline-none"
                                        />
                                        <input
                                            type="password"
                                            placeholder="confirm new password"
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-accent-yellow outline-none"
                                        />
                                    </div>
                                    <button
                                        disabled={updating || !passwords.new}
                                        className="w-full py-4 bg-accent-yellow text-black font-black uppercase text-xs rounded-2xl shadow-xl shadow-accent-yellow/10 transition-transform active:scale-95 disabled:opacity-50"
                                    >
                                        {updating ? 'saving...' : 'update password'}
                                    </button>
                                </form>

                                <div className="space-y-4 pt-10 border-t border-white/5">
                                    <h3 className="text-xs font-black uppercase text-white/20 tracking-widest flex items-center gap-2">
                                        <Smartphone size={14} /> active sessions
                                    </h3>
                                    <div className="space-y-3">
                                        {sessions.length > 0 ? sessions.map((s, i) => (
                                            <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center text-sm lowercase">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white/80">{s.device}</span>
                                                    <span className="text-[10px] text-white/30">{s.ip} • last active {new Date(s.lastActive).toLocaleDateString()}</span>
                                                </div>
                                                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[8px] font-black uppercase rounded-full">active</span>
                                            </div>
                                        )) : <p className="text-white/20 text-xs italic">no other session data found.</p>}
                                    </div>
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {/* NOTIFICATIONS TAB */}
                    {activeTab === 'notifications' && (
                        <motion.div
                            key="notifs"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-xl mx-auto space-y-12"
                        >
                            <header>
                                <h2 className="text-4xl font-black italic tracking-tighter lowercase text-accent-pink">vibe check 🔔</h2>
                                <p className="text-white/40 text-sm mt-2">stay tuned with what's happening live.</p>
                            </header>

                            <section className="space-y-6">
                                <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-bold lowercase">email notifications</span>
                                        <span className="text-[10px] text-white/30 lowercase italic">top news in your inbox.</span>
                                    </div>
                                    <button
                                        onClick={() => handleNotifUpdate({ email: !notifPrefs.email })}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${notifPrefs.email ? 'bg-accent-pink' : 'bg-white/10'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifPrefs.email ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-bold lowercase">push notifications</span>
                                        <span className="text-[10px] text-white/30 lowercase italic">get 'em instantly on mobile.</span>
                                    </div>
                                    <button
                                        onClick={() => handleNotifUpdate({ push: !notifPrefs.push })}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${notifPrefs.push ? 'bg-accent-pink' : 'bg-white/10'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifPrefs.push ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-xs font-black uppercase text-white/20 tracking-widest pl-2">frequency</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['daily', 'weekly', 'none'].map((f) => (
                                            <button
                                                key={f}
                                                onClick={() => handleNotifUpdate({ frequency: f })}
                                                className={`py-3 rounded-2xl text-[10px] font-black uppercase transition-all border ${notifPrefs.frequency === f ? 'bg-accent-pink/20 border-accent-pink text-accent-pink shadow-lg shadow-accent-pink/10' : 'bg-white/5 border-white/5 text-white/40'}`}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {/* ACCOUNT TAB */}
                    {activeTab === 'account' && (
                        <motion.div
                            key="account"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-xl mx-auto space-y-12"
                        >
                            <header>
                                <h2 className="text-4xl font-black italic tracking-tighter lowercase text-red-500">end of chain 💀</h2>
                                <p className="text-white/40 text-sm mt-2">manage your data and account status.</p>
                            </header>

                            <section className="space-y-4">
                                <button
                                    onClick={handleExport}
                                    className="w-full p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-accent-blue/10 flex items-center justify-center text-accent-blue"><Download size={20} /></div>
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="font-bold lowercase">export account data</span>
                                            <span className="text-[10px] text-white/30 lowercase">pwn your data. get it all in JSON.</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black uppercase text-white/20 group-hover:text-white transition-colors">→</span>
                                </button>

                                <button
                                    onClick={handleDeleteAccount}
                                    className="w-full p-6 rounded-3xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500"><Trash2 size={20} /></div>
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="font-bold lowercase text-red-500">delete account</span>
                                            <span className="text-[10px] text-red-500/40 lowercase italic tracking-tight">this yeets everything permanently.</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black uppercase text-red-500/20 group-hover:text-red-500 transition-colors">→</span>
                                </button>
                            </section>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Notifications Toast */}
                <AnimatePresence>
                    {notification && (
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className={`fixed bottom-10 left-10 right-10 md:left-auto md:right-10 md:w-80 p-4 rounded-3xl border shadow-2xl z-[150] flex items-center gap-3 ${notification.type === 'success' ? 'bg-green-500/90 border-green-400 text-white' : 'bg-red-500/90 border-red-400 text-white'
                                }`}
                        >
                            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span className="text-sm font-bold lowercase">{notification.message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Aesthetic Background Overlays */}
            <div className={`fixed inset-0 pointer-events-none z-[-1] transition-colors duration-700 ${activeTab === 'profile' ? 'bg-accent-blue/5' :
                    activeTab === 'security' ? 'bg-accent-yellow/5' :
                        activeTab === 'notifications' ? 'bg-accent-pink/5' : 'bg-red-500/5'
                }`} />
        </div>
    );
};
