import React, { useState } from 'react';
import { Heart, User, Lock, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
    onLogin: (email: string, password: string, role: 'student' | 'counselor' | 'admin') => void;
    onBack: () => void;
}

export function LoginPage({ onLogin, onBack }: LoginPageProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'student' | 'counselor' | 'admin'>('student');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(email, password, role);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to home
                </button>

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-green)] flex items-center justify-center">
                        <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="mb-2">Welcome Back</h2>
                    <p>Sign in to continue to Entaneer Mind</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm mb-2 text-[var(--color-text-secondary)]">
                                I am a...
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['student', 'counselor', 'admin'] as const).map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRole(r)}
                                        className={`px-4 py-3 rounded-2xl capitalize transition-all ${role === r
                                                ? 'bg-[var(--color-accent-green)] text-white'
                                                : 'bg-[var(--color-primary-blue)] text-[var(--color-text-secondary)] hover:bg-[var(--color-mint-green)]'
                                            }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm mb-2 text-[var(--color-text-secondary)]">
                                CMU Email
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your.email@cmu.ac.th"
                                    required
                                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-green)]"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm mb-2 text-[var(--color-text-secondary)]">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-green)]"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-green)] text-white py-4 rounded-2xl hover:opacity-90 transition-opacity"
                        >
                            Sign In with CMU OAuth
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            Using CMU single sign-on (OAuth)
                        </p>
                    </div>
                </div>

                {/* Help Text */}
                <div className="mt-6 text-center bg-[var(--color-mint-green)] rounded-3xl p-4">
                    <p className="text-sm">
                        <span className="text-[var(--color-accent-green)]">Note:</span> For demo purposes, use any email/password combination
                    </p>
                </div>
            </div>
        </div>
    );
}
