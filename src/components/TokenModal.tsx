import React, { useState } from 'react';
import { Key, AlertCircle } from 'lucide-react';

interface TokenModalProps {
    onSubmit: (token: string) => void;
}

export function TokenModal({ onSubmit }: TokenModalProps) {
    const [token, setToken] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!token.trim()) {
            setError('Please enter a verification token');
            return;
        }
        onSubmit(token);
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-mint-green)] flex items-center justify-center">
                        <Key className="w-6 h-6 text-[var(--color-accent-green)]" />
                    </div>
                    <h3>Verification Required</h3>
                </div>

                <p className="mb-6">
                    Please enter the verification token provided by your counselor to access the platform.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm mb-2 text-[var(--color-text-secondary)]">
                            Verification Token
                        </label>
                        <input
                            type="text"
                            value={token}
                            onChange={(e) => {
                                setToken(e.target.value);
                                setError('');
                            }}
                            placeholder="Enter your token"
                            className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-green)] bg-white"
                        />
                        {error && (
                            <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[var(--color-accent-green)] text-white py-3 rounded-2xl hover:opacity-90 transition-opacity"
                    >
                        Verify and Continue
                    </button>
                </form>

                <div className="mt-6 p-4 bg-[var(--color-primary-blue)] rounded-2xl">
                    <p className="text-sm">
                        <span className="text-[var(--color-accent-blue)]">Note:</span> If you don't have a token, please contact your counselor or the student support office.
                    </p>
                </div>
            </div>
        </div>
    );
}
