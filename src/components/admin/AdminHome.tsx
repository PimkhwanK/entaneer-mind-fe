import React from 'react';
import { Users, Calendar, Activity, TrendingUp, UserCheck, Clock, AlertCircle } from 'lucide-react';

interface AdminStats {
    totalUsers: number;
    activeStudents: number;
    activeCounselors: number;
    pendingApprovals: number;
    totalSessions: number;
    sessionsThisMonth: number;
    upcomingSessions: number;
    averageWaitTime: string;
}

interface AdminHomeProps {
    stats: AdminStats;
}

export function AdminHome({ stats }: AdminHomeProps) {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="mb-2">Admin Dashboard</h1>
            <p className="mb-8">Platform overview and key metrics</p>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-1">Total Users</p>
                    <h2 className="text-[var(--color-text-primary)]">{stats.totalUsers}</h2>
                    <p className="text-xs text-green-600 mt-2">+12% from last month</p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <UserCheck className="w-6 h-6 text-green-600" />
                        </div>
                        <Activity className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-1">Active Students</p>
                    <h2 className="text-[var(--color-text-primary)]">{stats.activeStudents}</h2>
                    <p className="text-xs text-green-600 mt-2">+8% from last month</p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        <Activity className="w-5 h-5 text-purple-500" />
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-1">Active Counselors</p>
                    <h2 className="text-[var(--color-text-primary)]">{stats.activeCounselors}</h2>
                    <p className="text-xs text-purple-600 mt-2">5 available now</p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-orange-600" />
                        </div>
                        <Clock className="w-5 h-5 text-orange-500" />
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-1">Pending Approvals</p>
                    <h2 className="text-[var(--color-text-primary)]">{stats.pendingApprovals}</h2>
                    <p className="text-xs text-orange-600 mt-2">Requires attention</p>
                </div>
            </div>

            {/* Session Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <Calendar className="w-5 h-5 text-[var(--color-accent-blue)]" />
                        <h3>Session Statistics</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-[var(--color-text-secondary)]">Total Sessions</span>
                                <span className="text-[var(--color-text-primary)]">{stats.totalSessions}</span>
                            </div>
                            <div className="w-full bg-[var(--color-primary-blue)] rounded-full h-2">
                                <div className="bg-[var(--color-accent-blue)] h-2 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-[var(--color-text-secondary)]">This Month</span>
                                <span className="text-[var(--color-text-primary)]">{stats.sessionsThisMonth}</span>
                            </div>
                            <div className="w-full bg-[var(--color-primary-blue)] rounded-full h-2">
                                <div className="bg-[var(--color-accent-green)] h-2 rounded-full" style={{ width: '60%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-[var(--color-text-secondary)]">Upcoming</span>
                                <span className="text-[var(--color-text-primary)]">{stats.upcomingSessions}</span>
                            </div>
                            <div className="w-full bg-[var(--color-primary-blue)] rounded-full h-2">
                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-green)] rounded-3xl p-6 text-white shadow-lg">
                    <h3 className="text-white mb-4">Average Wait Time</h3>
                    <p className="text-5xl mb-2">{stats.averageWaitTime}</p>
                    <p className="text-white/80">Until next available slot</p>
                    <div className="mt-6 pt-6 border-t border-white/20">
                        <p className="text-sm text-white/80 mb-1">Platform Health</p>
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            <span>Excellent</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <h3>Quick Actions</h3>
                    </div>
                    <div className="space-y-3">
                        <button className="w-full px-4 py-3 bg-[var(--color-primary-blue)] text-[var(--color-text-primary)] rounded-2xl hover:bg-[var(--color-mint-green)] transition-colors text-left">
                            Review Pending Users
                        </button>
                        <button className="w-full px-4 py-3 bg-[var(--color-primary-blue)] text-[var(--color-text-primary)] rounded-2xl hover:bg-[var(--color-mint-green)] transition-colors text-left">
                            Generate Report
                        </button>
                        <button className="w-full px-4 py-3 bg-[var(--color-primary-blue)] text-[var(--color-text-primary)] rounded-2xl hover:bg-[var(--color-mint-green)] transition-colors text-left">
                            System Settings
                        </button>
                        <button className="w-full px-4 py-3 bg-[var(--color-primary-blue)] text-[var(--color-text-primary)] rounded-2xl hover:bg-[var(--color-mint-green)] transition-colors text-left">
                            View Analytics
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h3 className="mb-4">Recent Activity</h3>
                <div className="space-y-3">
                    {[
                        { icon: UserCheck, color: 'green', action: 'New student registration', detail: 'John Doe registered', time: '5 mins ago' },
                        { icon: Calendar, color: 'blue', action: 'Session completed', detail: 'Dr. Sarah Chen completed a session', time: '15 mins ago' },
                        { icon: AlertCircle, color: 'orange', action: 'Approval pending', detail: 'Jane Smith awaiting approval', time: '1 hour ago' },
                        { icon: Users, color: 'purple', action: 'Counselor joined', detail: 'Dr. Michael Torres joined the platform', time: '2 hours ago' },
                    ].map((activity, index) => {
                        const Icon = activity.icon;
                        return (
                            <div key={index} className="flex items-center gap-4 p-4 bg-[var(--color-primary-blue)] rounded-2xl">
                                <div className={`w-10 h-10 rounded-full bg-${activity.color}-100 flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 text-${activity.color}-600`} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm text-[var(--color-text-primary)]">{activity.action}</h4>
                                    <p className="text-sm text-[var(--color-text-secondary)]">{activity.detail}</p>
                                </div>
                                <span className="text-xs text-[var(--color-text-secondary)]">{activity.time}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
