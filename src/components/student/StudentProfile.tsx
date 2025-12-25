import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Save, Edit } from 'lucide-react';

interface StudentProfileProps {
    profile: {
        name: string;
        email: string;
        phone: string;
        studentId: string;
        department: string;
        enrollmentDate: string;
    };
    onSave: (profile: any) => void;
}

export function StudentProfile({ profile: initialProfile, onSave }: StudentProfileProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState(initialProfile);

    const handleSave = () => {
        onSave(profile);
        setIsEditing(false);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="mb-2">My Profile</h1>
                    <p>Manage your personal information</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-[var(--color-accent-green)] text-white rounded-2xl hover:opacity-90 transition-opacity"
                    >
                        <Edit className="w-4 h-4" />
                        Edit Profile
                    </button>
                )}
            </div>

            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                {/* Profile Header */}
                <div className="bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-green)] p-8 text-white">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <User className="w-12 h-12" />
                        </div>
                        <div>
                            <h2 className="text-white mb-1">{profile.name}</h2>
                            <p className="text-white/80">Student ID: {profile.studentId}</p>
                            <p className="text-white/80">{profile.department}</p>
                        </div>
                    </div>
                </div>

                {/* Profile Form */}
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm mb-2 text-[var(--color-text-secondary)]">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    disabled={!isEditing}
                                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-green)] disabled:bg-[var(--color-primary-blue)] disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm mb-2 text-[var(--color-text-secondary)]">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                                <input
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    disabled={!isEditing}
                                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-green)] disabled:bg-[var(--color-primary-blue)] disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm mb-2 text-[var(--color-text-secondary)]">
                                Phone Number
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                                <input
                                    type="tel"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    disabled={!isEditing}
                                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-green)] disabled:bg-[var(--color-primary-blue)] disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm mb-2 text-[var(--color-text-secondary)]">
                                Student ID
                            </label>
                            <input
                                type="text"
                                value={profile.studentId}
                                disabled
                                className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-primary-blue)] cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm mb-2 text-[var(--color-text-secondary)]">
                                Department
                            </label>
                            <input
                                type="text"
                                value={profile.department}
                                onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                                disabled={!isEditing}
                                className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-green)] disabled:bg-[var(--color-primary-blue)] disabled:cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm mb-2 text-[var(--color-text-secondary)]">
                                Enrollment Date
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                                <input
                                    type="text"
                                    value={profile.enrollmentDate}
                                    disabled
                                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-primary-blue)] cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex gap-4 pt-6 border-t border-[var(--color-border)]">
                            <button
                                onClick={() => {
                                    setProfile(initialProfile);
                                    setIsEditing(false);
                                }}
                                className="flex-1 px-6 py-3 border border-[var(--color-border)] rounded-2xl hover:bg-[var(--color-primary-blue)] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-accent-green)] text-white rounded-2xl hover:opacity-90 transition-opacity"
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Privacy Notice */}
            <div className="mt-6 bg-[var(--color-mint-green)] rounded-3xl p-6">
                <h4 className="mb-2">Privacy & Confidentiality</h4>
                <p className="text-sm">
                    Your personal information is protected and will only be shared with your assigned counselors. All session notes and communications are kept strictly confidential in accordance with professional counseling ethics and PDPA regulations.
                </p>
            </div>
        </div>
    );
}
