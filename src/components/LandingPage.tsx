import React from 'react';
import { Heart, Shield, Calendar } from 'lucide-react';

interface LandingPageProps {
    onLogin: () => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                {/* Logo and Title */}
                <div className="text-center mb-12">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-green)] flex items-center justify-center">
                        <Heart className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="mb-4">Entaneer Mind</h1>
                    <p className="text-xl">
                        Your safe space for mental wellness and support
                    </p>
                </div>

                {/* Welcome Card */}
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg mb-8">
                    <div className="text-center mb-8">
                        <h2 className="mb-4">Welcome to a calmer mind</h2>
                        <p className="text-lg">
                            Connect with professional counselors who understand your journey.
                            Your mental health matters, and we're here to help.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="text-center p-6 bg-[var(--color-primary-blue)] rounded-2xl">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--color-mint-green)] flex items-center justify-center">
                                <Shield className="w-6 h-6 text-[var(--color-accent-green)]" />
                            </div>
                            <h4 className="mb-2">Confidential</h4>
                            <p className="text-sm">
                                Your privacy is protected under professional ethics and PDPA
                            </p>
                        </div>

                        <div className="text-center p-6 bg-[var(--color-primary-blue)] rounded-2xl">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--color-mint-green)] flex items-center justify-center">
                                <Heart className="w-6 h-6 text-[var(--color-accent-green)]" />
                            </div>
                            <h4 className="mb-2">Professional</h4>
                            <p className="text-sm">
                                Licensed counselors trained in mental health support
                            </p>
                        </div>

                        <div className="text-center p-6 bg-[var(--color-primary-blue)] rounded-2xl">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--color-mint-green)] flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-[var(--color-accent-green)]" />
                            </div>
                            <h4 className="mb-2">Flexible</h4>
                            <p className="text-sm">
                                Book sessions at times that work for your schedule
                            </p>
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        onClick={onLogin}
                        className="w-full bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-green)] text-white py-4 rounded-2xl hover:opacity-90 transition-opacity shadow-md"
                    >
                        Login with CMU Account
                    </button>

                    <p className="text-sm text-[var(--color-text-secondary)] text-center mt-4">
                        Secure authentication through CMU credentials
                    </p>
                </div>

                {/* Support Message */}
                <div className="text-center bg-[var(--color-mint-green)] rounded-3xl p-6">
                    <p className="text-sm">
                        <span className="text-[var(--color-accent-green)]">💚</span> You're not alone in this journey.
                        Seeking help is a sign of strength, not weakness.
                    </p>
                </div>
            </div>
        </div>
    );
}
