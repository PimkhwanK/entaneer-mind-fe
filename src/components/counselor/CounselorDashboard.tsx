import React, { useState } from 'react';
import { Calendar, Clock, User, Users, Key, Copy, CheckCircle } from 'lucide-react';

interface WaitingStudent {
    id: string;
    name: string;
    waitingSince: string;
    urgency: 'low' | 'medium' | 'high';
}

interface TodayAppointment {
    id: string;
    time: string;
    studentName: string;
    status: 'pending' | 'in-progress' | 'completed';
}

interface CounselorDashboardProps {
    waitingStudents: WaitingStudent[];
    todayAppointments: TodayAppointment[];
    onGenerateToken: () => string;
}

export function CounselorDashboard({
    waitingStudents,
    todayAppointments,
    onGenerateToken
}: CounselorDashboardProps) {
    const [generatedToken, setGeneratedToken] = useState<string | null>(null);
    const [copiedToken, setCopiedToken] = useState(false);

    const handleGenerateToken = () => {
        const token = onGenerateToken();
        setGeneratedToken(token);
        setCopiedToken(false);
    };

    const handleCopyToken = () => {
        if (generatedToken) {
            navigator.clipboard.writeText(generatedToken);
            setCopiedToken(true);
            setTimeout(() => setCopiedToken(false), 2000);
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'high':
                return 'bg-red-100 text-red-700';
            case 'medium':
                return 'bg-yellow-100 text-yellow-700';
            case 'low':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-700';
            case 'in-progress':
                return 'bg-blue-100 text-blue-700';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="mb-2">Counselor Dashboard</h1>
            <p className="mb-8">Manage your schedule and student sessions</p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <h4>Today's Sessions</h4>
                    </div>
                    <p className="text-3xl text-[var(--color-text-primary)] ml-13">{todayAppointments.length}</p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                        <h4>Waiting Students</h4>
                    </div>
                    <p className="text-3xl text-[var(--color-text-primary)] ml-13">{waitingStudents.length}</p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <h4>Completed</h4>
                    </div>
                    <p className="text-3xl text-[var(--color-text-primary)] ml-13">
                        {todayAppointments.filter(apt => apt.status === 'completed').length}
                    </p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <h4>Total Students</h4>
                    </div>
                    <p className="text-3xl text-[var(--color-text-primary)] ml-13">42</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Token Generator */}
                <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Key className="w-5 h-5 text-[var(--color-accent-green)]" />
                        <h3>Token Generator</h3>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                        Generate verification tokens for new students
                    </p>

                    <button
                        onClick={handleGenerateToken}
                        className="w-full bg-[var(--color-accent-green)] text-white py-3 rounded-2xl hover:opacity-90 transition-opacity mb-4"
                    >
                        Generate New Token
                    </button>

                    {generatedToken && (
                        <div className="bg-[var(--color-primary-blue)] rounded-2xl p-4">
                            <p className="text-sm text-[var(--color-text-secondary)] mb-2">Generated Token:</p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-white px-3 py-2 rounded-xl text-sm break-all">
                                    {generatedToken}
                                </code>
                                <button
                                    onClick={handleCopyToken}
                                    className="p-2 hover:bg-white rounded-xl transition-colors"
                                    title="Copy token"
                                >
                                    {copiedToken ? (
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <Copy className="w-5 h-5 text-[var(--color-accent-blue)]" />
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Today's Schedule */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5 text-[var(--color-accent-blue)]" />
                        <h3>Today's Schedule</h3>
                    </div>

                    {todayAppointments.length === 0 ? (
                        <div className="text-center py-8">
                            <Clock className="w-12 h-12 mx-auto mb-3 text-[var(--color-border)]" />
                            <p>No appointments scheduled for today</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {todayAppointments.map((apt) => (
                                <div
                                    key={apt.id}
                                    className="flex items-center gap-4 p-4 bg-[var(--color-primary-blue)] rounded-2xl"
                                >
                                    <div className="w-12 h-12 rounded-full bg-[var(--color-mint-green)] flex items-center justify-center">
                                        <User className="w-6 h-6 text-[var(--color-accent-green)]" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-[var(--color-text-primary)]">{apt.studentName}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock className="w-4 h-4 text-[var(--color-text-secondary)]" />
                                            <span className="text-sm text-[var(--color-text-secondary)]">{apt.time}</span>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm capitalize ${getStatusColor(apt.status)}`}>
                                        {apt.status.replace('-', ' ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Waiting Students */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-[var(--color-accent-green)]" />
                    <h3>Waiting Students</h3>
                </div>

                {waitingStudents.length === 0 ? (
                    <div className="text-center py-8">
                        <Users className="w-12 h-12 mx-auto mb-3 text-[var(--color-border)]" />
                        <p>No students currently waiting</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-[var(--color-border)]">
                                <tr>
                                    <th className="px-4 py-3 text-left">Student Name</th>
                                    <th className="px-4 py-3 text-left">Waiting Since</th>
                                    <th className="px-4 py-3 text-left">Urgency</th>
                                    <th className="px-4 py-3 text-left">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {waitingStudents.map((student) => (
                                    <tr key={student.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-primary-blue)] transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-[var(--color-mint-green)] flex items-center justify-center">
                                                    <User className="w-4 h-4 text-[var(--color-accent-green)]" />
                                                </div>
                                                <span>{student.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-[var(--color-text-secondary)]">
                                            {student.waitingSince}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-3 py-1 rounded-full text-sm capitalize ${getUrgencyColor(student.urgency)}`}>
                                                {student.urgency}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <button className="text-[var(--color-accent-blue)] hover:underline">
                                                Schedule
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
