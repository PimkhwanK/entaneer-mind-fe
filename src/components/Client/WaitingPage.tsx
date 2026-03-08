import { useEffect, useState } from 'react';

interface WaitingPageProps {
    userName?: string;
}

export function WaitingPage({ userName }: WaitingPageProps) {
    const [dots, setDots] = useState('');
    const [pulse, setPulse] = useState(false);

    // Animated dots
    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 600);
        return () => clearInterval(interval);
    }, []);

    // Pulse effect every few seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setPulse(true);
            setTimeout(() => setPulse(false), 800);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-6"
            style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #fafff7 40%, #f0f9ff 100%)',
            }}
        >
            {/* Decorative blobs */}
            <div
                className="fixed top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(134,239,172,0.18) 0%, transparent 70%)',
                    transform: 'translate(-30%, -30%)',
                }}
            />
            <div
                className="fixed bottom-0 right-0 w-96 h-96 rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(147,197,253,0.15) 0%, transparent 70%)',
                    transform: 'translate(30%, 30%)',
                }}
            />

            <div className="relative z-10 max-w-sm w-full text-center">

                {/* Animated icon */}
                <div className="relative mx-auto mb-10 w-28 h-28">
                    {/* Outer pulse rings */}
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: 'rgba(134,239,172,0.15)',
                            animation: 'ping 2.5s cubic-bezier(0,0,0.2,1) infinite',
                        }}
                    />
                    <div
                        className="absolute inset-3 rounded-full"
                        style={{
                            background: 'rgba(134,239,172,0.12)',
                            animation: 'ping 2.5s cubic-bezier(0,0,0.2,1) infinite 0.4s',
                        }}
                    />
                    {/* Inner circle */}
                    <div
                        className="absolute inset-5 rounded-full flex items-center justify-center shadow-lg"
                        style={{
                            background: 'linear-gradient(135deg, #4ade80, #34d399)',
                            transition: 'transform 0.3s ease',
                            transform: pulse ? 'scale(1.08)' : 'scale(1)',
                        }}
                    >
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M12 6v6l4 2"
                                stroke="white"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2.5" />
                        </svg>
                    </div>
                </div>

                {/* Text */}
                <div className="mb-3">
                    {userName && (
                        <p className="text-sm text-gray-400 font-medium mb-1">
                            สวัสดี, {userName}
                        </p>
                    )}
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight leading-tight">
                        รอการยืนยัน
                    </h1>
                </div>

                <p className="text-gray-500 text-sm leading-relaxed mb-10 font-medium">
                    เจ้าหน้าที่กำลังตรวจสอบข้อมูลของคุณ<br />
                    กรุณารอสักครู่ ระบบจะพาคุณเข้าหน้าหลักโดยอัตโนมัติ<br />
                    เมื่อได้รับการยืนยันเรียบร้อยแล้ว
                </p>

                {/* Status bar */}
                <div
                    className="rounded-2xl px-6 py-5 mb-6 text-left"
                    style={{
                        background: 'rgba(255,255,255,0.85)',
                        border: '1px solid rgba(134,239,172,0.3)',
                        backdropFilter: 'blur(8px)',
                    }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-2 h-2 rounded-full bg-green-400" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
                        <span className="text-xs font-bold text-green-600 uppercase tracking-widest">
                            รอการยืนยัน{dots}
                        </span>
                    </div>

                    {/* Steps */}
                    {[
                        { label: 'ลงทะเบียนสำเร็จ', done: true },
                        { label: 'ยืนยัน PDPA', done: true },
                        { label: 'ใช้รหัส Token', done: true },
                        { label: 'รอเจ้าหน้าที่ยืนยัน', done: false, active: true },
                        { label: 'เข้าสู่ระบบ', done: false },
                    ].map((step, i) => (
                        <div key={i} className="flex items-center gap-3 py-2">
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-black transition-all"
                                style={{
                                    background: step.done
                                        ? 'linear-gradient(135deg, #4ade80, #34d399)'
                                        : step.active
                                            ? 'rgba(74,222,128,0.15)'
                                            : 'rgba(229,231,235,0.8)',
                                    border: step.active ? '2px solid #4ade80' : 'none',
                                    color: step.done ? 'white' : step.active ? '#16a34a' : '#9ca3af',
                                }}
                            >
                                {step.done ? '✓' : i + 1}
                            </div>
                            <span
                                className="text-sm font-medium"
                                style={{
                                    color: step.done ? '#15803d' : step.active ? '#1f2937' : '#9ca3af',
                                }}
                            >
                                {step.label}
                            </span>
                            {step.active && (
                                <div className="ml-auto flex gap-1">
                                    {[0, 0.2, 0.4].map((delay, j) => (
                                        <div
                                            key={j}
                                            className="w-1.5 h-1.5 rounded-full bg-green-400"
                                            style={{ animation: `bounce 1s ease-in-out infinite ${delay}s` }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Refresh hint */}
                <button
                    onClick={() => window.location.reload()}
                    className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-95"
                    style={{
                        background: 'rgba(255,255,255,0.7)',
                        border: '1px solid rgba(209,250,229,0.8)',
                        color: '#6b7280',
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(240,253,244,0.9)';
                        (e.currentTarget as HTMLElement).style.color = '#16a34a';
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.7)';
                        (e.currentTarget as HTMLElement).style.color = '#6b7280';
                    }}
                >
                    ↻ &nbsp;ตรวจสอบสถานะอีกครั้ง
                </button>

                <p className="mt-6 text-xs text-gray-300">
                    Entaneer Mind · CMU Engineering
                </p>
            </div>

            <style>{`
                @keyframes ping {
                    75%, 100% { transform: scale(1.8); opacity: 0; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
            `}</style>
        </div>
    );
}