import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Calendar } from 'lucide-react';

interface AuthFormProps {
    onSuccess: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
    const [isSignup, setIsSignup] = useState(true);
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        dateOfBirth: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const endpoint = isSignup ? '/v1/auth/signup' : '/v1/auth/login';
            const body = isSignup ? formData : {
                email: formData.email,
                password: formData.password,
                rememberMe
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const result = await response.json();

            if (result.success) {
                localStorage.setItem('token', result.data.tokens.accessToken);
                // Also store refresh token if provided
                if (result.data.tokens.refreshToken) {
                    localStorage.setItem('refreshToken', result.data.tokens.refreshToken);
                }
                onSuccess();
            } else {
                alert(result.message || 'Authentication failed');
            }
        } catch (err: any) {
            console.error('Auth error:', err);
            // Check if it's a fetch error or server error
            const errorMessage = err.message || 'Unknown error';
            alert(`Authentication Error: ${errorMessage}. Please check your connection and try again.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#0791ed]/20 rounded-full blur-[100px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] -ml-48 -mb-48" />

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <h1 className="text-white text-4xl md:text-6xl font-extrabold leading-none tracking-tight drop-shadow-2xl">SLINGSHOT</h1>
                    <span className="text-[12px] font-bold tracking-[0.4em] text-[#0791ed] mt-2 drop-shadow-md">NEWS</span>
                </div>

                <p className="text-white/40 mb-8 text-xl font-medium max-w-sm lowercase">
                    news that actually hits different fr fr. no cap. 🚀
                </p>

                {/* Form */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    {/* Email */}
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                        <input
                            type="email"
                            required
                            placeholder="email address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0791ed]/50 transition lowercase"
                        />
                    </div>

                    {/* Username (Signup only) */}
                    {isSignup && (
                        <>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                                <input
                                    type="text"
                                    required
                                    placeholder="username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0791ed]/50 transition lowercase"
                                />
                            </div>

                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                                <input
                                    type="date"
                                    required
                                    placeholder="date of birth"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0791ed]/50 transition"
                                />
                            </div>
                        </>
                    )}

                    {/* Password */}
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                        <input
                            type="password"
                            required
                            placeholder="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0791ed]/50 transition lowercase"
                        />
                    </div>

                    {/* Remember Me (Login Only) */}
                    {!isSignup && (
                        <div className="flex items-center gap-3 px-2">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-white/20 bg-white/5 checked:bg-[#0791ed] checked:border-[#0791ed] transition-all"
                                />
                                <svg
                                    className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </div>
                            <label htmlFor="rememberMe" className="text-white/50 text-sm font-medium lowercase cursor-pointer hover:text-white/80 transition-colors select-none">
                                keep me signed in
                            </label>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full px-12 py-5 bg-white text-black font-black text-xl rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="relative z-10 lowercase">
                            {loading ? 'loading...' : isSignup ? 'sign up' : 'log in'}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0791ed] to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                    </button>

                    {/* Toggle */}
                    <button
                        type="button"
                        onClick={() => setIsSignup(!isSignup)}
                        className="text-white/40 hover:text-white/70 text-sm transition lowercase"
                    >
                        {isSignup ? 'already have an account? log in' : "don't have an account? sign up"}
                    </button>
                </motion.form>
            </div>
        </div>
    );
};
