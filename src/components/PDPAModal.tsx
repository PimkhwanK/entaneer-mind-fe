import React from 'react';
import { Shield } from 'lucide-react';

interface PDPAModalProps {
    onAccept: () => void;
}

export function PDPAModal({ onAccept }: PDPAModalProps) {
    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 animate-in fade-in zoom-in duration-300">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-mint-green)] flex items-center justify-center">
                        <Shield className="w-6 h-6 text-[var(--color-accent-green)]" />
                    </div>
                    <h2>Data Protection & Privacy</h2>
                </div>

                <div className="space-y-4 mb-8 max-h-96 overflow-y-auto pr-2">
                    <p>
                        Welcome to Entaneer Mind. Your privacy and confidentiality are our top priorities.
                    </p>

                    <div className="bg-[var(--color-primary-blue)] rounded-2xl p-4 space-y-3">
                        <h4>We collect and protect:</h4>
                        <ul className="space-y-2 text-[var(--color-text-secondary)]">
                            <li className="flex items-start gap-2">
                                <span className="text-[var(--color-accent-green)] mt-1">•</span>
                                <span>Personal information for authentication and appointment scheduling</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[var(--color-accent-green)] mt-1">•</span>
                                <span>Session notes and mental health assessments (confidential)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[var(--color-accent-green)] mt-1">•</span>
                                <span>Communication records between you and counselors</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-[var(--color-mint-green)] rounded-2xl p-4 space-y-3">
                        <h4>Your rights:</h4>
                        <ul className="space-y-2 text-[var(--color-text-secondary)]">
                            <li className="flex items-start gap-2">
                                <span className="text-[var(--color-accent-blue)] mt-1">•</span>
                                <span>Access and review your personal data at any time</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[var(--color-accent-blue)] mt-1">•</span>
                                <span>Request deletion of your account and associated data</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[var(--color-accent-blue)] mt-1">•</span>
                                <span>Confidentiality protected by professional counseling ethics</span>
                            </li>
                        </ul>
                    </div>

                    <p className="text-sm">
                        By clicking "Accept and Continue", you acknowledge that you have read and agree to our data protection practices in accordance with PDPA regulations.
                    </p>
                </div>

                <button
                    onClick={onAccept}
                    className="w-full bg-[var(--color-accent-green)] text-white py-4 rounded-2xl hover:opacity-90 transition-opacity"
                >
                    Accept and Continue
                </button>
            </div>
        </div>
    );
}
