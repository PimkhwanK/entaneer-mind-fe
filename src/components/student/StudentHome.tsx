import React from 'react';
import { Calendar, Clock, User, Sparkles } from 'lucide-react';

interface Appointment {
    id: string;
    date: string;
    time: string;
    counselor: string;
    status: 'upcoming' | 'completed' | 'cancelled';
}

interface StudentHomeProps {
    onBookSession: () => void;
    appointments: Appointment[];
}

const dailyQuotes = [
    "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity.",
    "One small positive thought can change your whole day.",
    "It's okay to not be okay. Reach out, we're here for you.",
    "Healing is not linear. Be patient with yourself.",
    "You are stronger than you think, braver than you believe.",
];

export function StudentHome({ onBookSession, appointments }: StudentHomeProps) {
    const todayQuote = dailyQuotes[new Date().getDay() % dailyQuotes.length];
    const upcomingAppointments = appointments.filter(apt => apt.status === 'upcoming');

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="mb-2">Welcome Back 👋</h1>
                <p>How are you feeling today?</p>
            </div>

            {/* Daily Quote Card */}
            <div className="bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-green)] rounded-3xl p-8 mb-8 text-white shadow-lg">
                <div className="flex items-start gap-3 mb-4">
                    <Sparkles className="w-6 h-6 mt-1" />
                    <div>
                        <h3 className="text-white mb-2">Daily Inspiration</h3>
                        <p className="text-white/90 text-lg italic">"{todayQuote}"</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Book Session CTA */}
                <div className="lg:col-span-1">
                    <button
                        onClick={onBookSession}
                        className="w-full bg-[var(--color-accent-green)] text-white p-6 rounded-3xl hover:opacity-90 transition-all shadow-md hover:shadow-lg h-full min-h-[200px] flex flex-col items-center justify-center gap-4"
                    >
                        <Calendar className="w-12 h-12" />
                        <span className="text-xl">Book a Session</span>
                        <span className="text-sm opacity-90">Schedule time with a counselor</span>
                    </button>
                </div>

                {/* Upcoming Appointments */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm">
                    <h3 className="mb-4">Upcoming Appointments</h3>
                    {upcomingAppointments.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="w-12 h-12 mx-auto mb-3 text-[var(--color-border)]" />
                            <p>No upcoming appointments</p>
                            <button
                                onClick={onBookSession}
                                className="mt-4 text-[var(--color-accent-green)] hover:underline"
                            >
                                Book your first session
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {upcomingAppointments.map((apt) => (
                                <div
                                    key={apt.id}
                                    className="flex items-center gap-4 p-4 bg-[var(--color-primary-blue)] rounded-2xl"
                                >
                                    <div className="w-12 h-12 rounded-full bg-[var(--color-mint-green)] flex items-center justify-center">
                                        <User className="w-6 h-6 text-[var(--color-accent-green)]" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-[var(--color-text-primary)]">{apt.counselor}</h4>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {apt.date}
                                            </span>
                                            <span className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {apt.time}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                        Confirmed
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <h4>Total Sessions</h4>
                    </div>
                    <p className="text-3xl text-[var(--color-text-primary)] ml-13">{appointments.length}</p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-green-600" />
                        </div>
                        <h4>This Month</h4>
                    </div>
                    <p className="text-3xl text-[var(--color-text-primary)] ml-13">
                        {appointments.filter(apt => apt.status === 'upcoming').length}
                    </p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-purple-600" />
                        </div>
                        <h4>Counselors Met</h4>
                    </div>
                    <p className="text-3xl text-[var(--color-text-primary)] ml-13">
                        {new Set(appointments.map(apt => apt.counselor)).size}
                    </p>
                </div>
            </div>
        </div>
    );
}
