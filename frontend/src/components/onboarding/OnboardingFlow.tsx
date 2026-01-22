import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { UsernameStep } from './UsernameStep';
import { InterestStep } from './InterestStep';
import { RegionStep } from './RegionStep';
import { authService } from '../../services/authService';

interface OnboardingFlowProps {
    onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState({
        username: '',
        interests: [] as string[],
        region: ''
    });

    const handleNext = async (data: any) => {
        setLoading(true);
        try {
            if (step === 1) { // Username
                await authService.fetchWithAuth('/v1/onboarding/username', {
                    method: 'POST',
                    body: JSON.stringify({ username: data })
                });
                setUserData(prev => ({ ...prev, username: data }));
                setStep(2);
            } else if (step === 2) { // Interests
                await authService.fetchWithAuth('/v1/onboarding/interests', {
                    method: 'POST',
                    body: JSON.stringify({ interests: data })
                });
                setUserData(prev => ({ ...prev, interests: data }));
                setStep(3);
            } else if (step === 3) { // Region
                await authService.fetchWithAuth('/v1/onboarding/region', {
                    method: 'POST',
                    body: JSON.stringify({ region: data })
                });
                setUserData(prev => ({ ...prev, region: data }));
                onComplete();
            }
        } catch (err) {
            console.error('onboarding step failed', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center overflow-hidden">
            {/* Background Blur Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

            {/* Progress Bar */}
            <div className="absolute top-12 left-0 right-0 px-8 flex gap-2">
                {[1, 2, 3].map(s => (
                    <div
                        key={s}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-white' : 'bg-white/10'
                            }`}
                    />
                ))}
            </div>

            <main className="relative z-10 w-full">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <UsernameStep key="username" onNext={handleNext} />
                    )}
                    {step === 2 && (
                        <InterestStep key="interests" onNext={handleNext} />
                    )}
                    {step === 3 && (
                        <RegionStep key="region" onNext={handleNext} />
                    )}
                </AnimatePresence>
            </main>

            {loading && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
};
