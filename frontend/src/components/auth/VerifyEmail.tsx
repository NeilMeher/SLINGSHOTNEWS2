import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { authService } from '../../services/authService';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface VerifyEmailProps {
    token: string;
    onComplete: () => void;
}

export const VerifyEmail: React.FC<VerifyEmailProps> = ({ token, onComplete }) => {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('verifying your vibe...');

    useEffect(() => {
        const verify = async () => {
            try {
                const result = await authService.verifyEmail(token);
                if (result.success) {
                    setStatus('success');
                    setMessage('yo, you are officially verified! 🚀');
                    setTimeout(onComplete, 3000);
                } else {
                    setStatus('error');
                    setMessage(result.message || 'verification failed 💀');
                }
            } catch (err) {
                setStatus('error');
                setMessage('something went wrong with the vibe check 🛑');
            }
        };

        if (token) {
            verify();
        }
    }, [token]);

    return (
        <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center p-6">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-sm w-full bg-white/5 border border-white/10 rounded-[40px] p-10 text-center space-y-6 backdrop-blur-3xl shadow-2xl"
            >
                <div className="flex justify-center">
                    {status === 'loading' && (
                        <Loader2 className="w-16 h-16 text-accent-blue animate-spin" />
                    )}
                    {status === 'success' && (
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                        >
                            <CheckCircle className="w-16 h-16 text-green-500" />
                        </motion.div>
                    )}
                    {status === 'error' && (
                        <motion.div
                            initial={{ scale: 0, rotate: 45 }}
                            animate={{ scale: 1, rotate: 0 }}
                        >
                            <XCircle className="w-16 h-16 text-accent-pink" />
                        </motion.div>
                    )}
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-black italic tracking-tighter lowercase">
                        {status === 'loading' ? 'vibe check in progress' :
                            status === 'success' ? 'vibe check passed' : 'vibe check failed'}
                    </h2>
                    <p className="text-white/40 text-sm font-medium">
                        {message}
                    </p>
                </div>

                {status === 'error' && (
                    <button
                        onClick={onComplete}
                        className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                    >
                        back to feed
                    </button>
                )}

                {status === 'success' && (
                    <p className="text-[10px] text-accent-blue font-black uppercase tracking-[0.2em] animate-pulse">
                        redirecting to feed...
                    </p>
                )}
            </motion.div>
        </div>
    );
};
