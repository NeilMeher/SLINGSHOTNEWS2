import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../../services/authService';
import { AlertTriangle, Send, Check } from 'lucide-react';

interface VerificationBannerProps {
    user: any;
    onRefresh: () => void;
}

export const VerificationBanner: React.FC<VerificationBannerProps> = ({ user, onRefresh }) => {
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        let timer: any;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const handleResend = async () => {
        if (countdown > 0 || sending) return;

        setSending(true);
        setError('');
        try {
            const result = await authService.resendVerification();
            if (result.success) {
                setSent(true);
                setCountdown(60);
                setTimeout(() => setSent(false), 5000);
            } else {
                setError(result.message || 'failed to send 💀');
            }
        } catch (err) {
            setError('vibe disrupted, try again 🛑');
        } finally {
            setSending(false);
        }
    };

    if (user?.emailVerified) return null;

    return (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[40] w-full max-w-lg px-6">
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-accent-yellow/10 border border-accent-yellow/20 backdrop-blur-xl p-4 rounded-3xl flex items-center justify-between gap-4 shadow-2xl shadow-accent-yellow/5"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-accent-yellow/20 flex items-center justify-center text-accent-yellow shrink-0">
                        <AlertTriangle size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase text-accent-yellow tracking-widest">verify your email</span>
                        <p className="text-[10px] text-white/40 font-medium">unverified accounts are mid. check your inbox 📧</p>
                    </div>
                </div>

                <div className="flex gap-2 shrink-0">
                    <button
                        onClick={handleResend}
                        disabled={sending || countdown > 0}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${countdown > 0 ? 'bg-white/5 text-white/20' :
                                sent ? 'bg-green-500/20 text-green-500' : 'bg-accent-yellow text-black hover:scale-105 active:scale-95'
                            }`}
                    >
                        {sending ? <LoaderIcon /> : sent ? <Check size={14} /> : <Send size={14} />}
                        {countdown > 0 ? `${countdown}s` : sent ? 'sent' : 'resend'}
                    </button>
                    {error && (
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-accent-pink whitespace-nowrap">
                            {error}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const LoaderIcon = () => (
    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
);
