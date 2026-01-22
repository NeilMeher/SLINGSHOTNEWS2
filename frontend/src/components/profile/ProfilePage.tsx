import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '../../hooks/useProfile';

interface ProfilePageProps {
    onClose: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onClose }) => {
    const { profile, loading, error, updating, updateProfile, updateAvatar } = useProfile();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync form data when entering edit mode
    const enterEditMode = () => {
        setFormData({
            displayName: profile.displayName || '',
            bio: profile.bio || '',
            phone: profile.phone || '',
            location: {
                city: profile.location?.city || '',
                country: profile.location?.country || ''
            },
            socialLinks: {
                twitter: profile.socialLinks?.twitter || '',
                instagram: profile.socialLinks?.instagram || '',
                website: profile.socialLinks?.website || ''
            }
        });
        setIsEditing(true);
    };

    const handleSave = async () => {
        const result = await updateProfile(formData);
        if (result.success) {
            setNotification({ type: 'success', message: 'profile saved! 🔥' });
            setIsEditing(false);
        } else {
            setNotification({ type: 'error', message: result.message || 'save failed 💀' });
        }
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // In a real app, you'd upload to S3. Here we use FileReader for preview/mock
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                const result = await updateAvatar(base64);
                if (result.success) {
                    setNotification({ type: 'success', message: 'avatar updated! 💅' });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) return (
        <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-accent-pink border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (error) return (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">😭 profile is cooked</h2>
            <p className="text-white/50 mb-8">{error}</p>
            <button onClick={onClose} className="btn-primary px-8 py-3">go back</button>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black z-[100] overflow-y-auto pb-20">
            {/* Header */}
            <header className="sticky top-0 bg-black/80 backdrop-blur-xl border-b border-white/5 p-6 flex justify-between items-center z-10">
                <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                    <span className="text-2xl">✕</span>
                </button>
                <h1 className="text-lg font-black tracking-tighter uppercase">profile</h1>
                {!isEditing ? (
                    <button onClick={enterEditMode} className="text-accent-blue font-bold text-sm">edit</button>
                ) : (
                    <button onClick={handleSave} disabled={updating} className="text-accent-pink font-bold text-sm disabled:opacity-50">
                        {updating ? 'saving...' : 'save'}
                    </button>
                )}
            </header>

            <main className="max-w-md mx-auto p-6">
                {/* Notification Toast */}
                <AnimatePresence>
                    {notification && (
                        <motion.div
                            initial={{ y: -100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -100, opacity: 0 }}
                            className={`fixed top-24 left-6 right-6 p-4 rounded-2xl text-center font-bold shadow-2xl z-50 ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                }`}
                        >
                            {notification.message}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-10 relative">
                    <div
                        className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 relative group cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {profile.avatar ? (
                            <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-4xl">
                                {profile.username[0].toUpperCase()}
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-xs font-bold">change</span>
                        </div>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                    <h2 className="mt-4 text-2xl font-black italic">@{profile.username}</h2>
                    <p className="text-white/40 text-sm">{profile.email}</p>
                </div>

                {!isEditing ? (
                    /* Display Mode */
                    <div className="space-y-8">
                        {profile.bio && (
                            <section>
                                <h3 className="text-xs uppercase font-bold text-white/30 tracking-widest mb-2">bio</h3>
                                <p className="text-lg text-white/80 leading-relaxed">{profile.bio}</p>
                            </section>
                        )}

                        <section className="grid grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-xs uppercase font-bold text-white/30 tracking-widest mb-1">location</h3>
                                <p className="text-white/80">
                                    {profile.location?.city || 'earth'}, {profile.location?.country || 'galaxy'}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xs uppercase font-bold text-white/30 tracking-widest mb-1">region</h3>
                                <p className="text-white/80 uppercase">{profile.region}</p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xs uppercase font-bold text-white/30 tracking-widest mb-3">interests</h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.interests.map((i: string) => (
                                    <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-tighter">
                                        #{i}
                                    </span>
                                ))}
                            </div>
                        </section>

                        {/* Social Icons Placeholder */}
                        <section className="flex gap-4 pt-4">
                            {profile.socialLinks?.twitter && (
                                <a href={profile.socialLinks.twitter} target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">𝕏</a>
                            )}
                            {profile.socialLinks?.instagram && (
                                <a href={profile.socialLinks.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">📸</a>
                            )}
                            {profile.socialLinks?.website && (
                                <a href={profile.socialLinks.website} target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">🌐</a>
                            )}
                        </section>
                    </div>
                ) : (
                    /* Edit Mode Form */
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div>
                            <label className="block text-xs font-bold text-white/30 uppercase mb-2">display name</label>
                            <input
                                type="text"
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent-blue transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-white/30 uppercase mb-2">bio ({formData.bio.length}/500)</label>
                            <textarea
                                rows={4}
                                value={formData.bio}
                                onChange={(e) => e.target.value.length <= 500 && setFormData({ ...formData, bio: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent-blue transition-colors resize-none"
                                placeholder="tell the vibes..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-white/30 uppercase mb-2">city</label>
                                <input
                                    type="text"
                                    value={formData.location.city}
                                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent-blue transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/30 uppercase mb-2">country</label>
                                <input
                                    type="text"
                                    value={formData.location.country}
                                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, country: e.target.value } })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent-blue transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-white/30 uppercase mb-2">phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+1234567890"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent-blue transition-colors"
                            />
                        </div>

                        <div className="pt-4 border-t border-white/5 space-y-4">
                            <h3 className="text-xs uppercase font-bold text-white/30 tracking-widest">social links</h3>
                            <input
                                type="text"
                                placeholder="website url"
                                value={formData.socialLinks.website}
                                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, website: e.target.value } })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent-blue transition-colors text-sm"
                            />
                            <input
                                type="text"
                                placeholder="twitter url"
                                value={formData.socialLinks.twitter}
                                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitter: e.target.value } })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent-blue transition-colors text-sm"
                            />
                        </div>

                        <button
                            onClick={() => setIsEditing(false)}
                            className="w-full py-4 text-white/40 font-bold hover:text-white transition-colors"
                        >
                            cancel
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};
