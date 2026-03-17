import React from 'react';
import { LogOut, Home, Calendar, User, Users, FileText, Clock, BarChart3 } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
<<<<<<< HEAD
    userRole: 'student' | 'client' | 'counselor' | 'admin' | null;
=======
    userRole: 'client' | 'counselor' | 'admin' | null;
>>>>>>> 5558b0f80c17607581bbe1cdf1acd05cdf7aaa30
    currentPage: string;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}

export function Layout({ children, userRole, currentPage, onNavigate, onLogout }: LayoutProps) {
    if (!userRole) {
        return <div className="min-h-screen">{children}</div>;
    }

    const getNavItems = () => {
        switch (userRole) {
<<<<<<< HEAD
            case 'student':
=======
>>>>>>> 5558b0f80c17607581bbe1cdf1acd05cdf7aaa30
            case 'client':
                return [
                    { icon: Home, label: 'Home', page: 'client-home' },
                    { icon: Calendar, label: 'Book Session', page: 'client-booking' },
                    { icon: FileText, label: 'History', page: 'client-history' },
                    { icon: User, label: 'Profile', page: 'client-profile' },
                ];
            case 'counselor':
                return [
                    { icon: Home, label: 'Dashboard', page: 'counselor-dashboard' },
                    { icon: FileText, label: 'Case Notes', page: 'counselor-notes' },
                    { icon: Clock, label: 'Manage Schedule', page: 'counselor-schedule' },
                    // ── เพิ่มใหม่ ──
                    { icon: Users, label: 'User Management', page: 'counselor-users' },
                    { icon: BarChart3, label: 'Full Report', page: 'counselor-report' },
                ];
            case 'admin':
                // ── ของเดิม ไม่แตะ ──
                return [
                    { icon: Home, label: 'Dashboard', page: 'admin-home' },
                    { icon: Users, label: 'User Management', page: 'admin-users' },
                ];
            default:
                return [];
        }
    };

    const navItems = getNavItems();

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-sm border-r border-[var(--color-border)] flex flex-col sticky top-0 h-screen">
                <div className="p-6 border-b border-[var(--color-border)]">
                    <h3 className="text-[var(--color-accent-blue)]">Entaneer Mind</h3>
<<<<<<< HEAD
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1 capitalize">{(userRole === 'student' || userRole === 'client') ? 'Client' : userRole}</p>
=======
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1 capitalize">{userRole === 'client' ? 'ผู้รับคำปรึกษา' : userRole}</p>
>>>>>>> 5558b0f80c17607581bbe1cdf1acd05cdf7aaa30
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.page;
                        return (
                            <button
                                key={item.page}
                                onClick={() => onNavigate(item.page)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${isActive
                                    ? 'bg-[var(--color-mint-green)] text-[var(--color-accent-green)]'
                                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-blue)]'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-[var(--color-border)]">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[var(--color-text-secondary)] hover:bg-red-50 hover:text-red-600 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}