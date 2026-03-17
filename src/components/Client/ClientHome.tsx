import React, { useMemo } from 'react';
import { Calendar, Clock, User, Sparkles, Timer, ArrowRight, Info } from 'lucide-react';

interface UpcomingAppointment {
    id: string;
    date: string;
    time: string;
    counselor: string;
}

interface ClientHomeProps {
    onBookSession: () => void;
    onViewHistory: () => void;
    upcomingAppointments: UpcomingAppointment[];
    completedCount: number;
    counselorCount: number;
    isWaitingForQueue?: boolean;
    onDebugSkipWaiting?: () => void;
    hasExistingBooking: boolean;
}

const dailyQuotes = [
    "สุขภาพจิตของคุณคือสิ่งสำคัญ ความสุขของคุณเป็นเรื่องจำเป็น การดูแลตัวเองเป็นเรื่องที่ต้องทำ",
    "ความคิดบวกเพียงเล็กน้อยสามารถเปลี่ยนวันทั้งวันของคุณได้",
    "ไม่เป็นไรถ้าคุณจะรู้สึกไม่โอเค เราพร้อมรับฟังและอยู่ตรงนี้เพื่อคุณ",
    "การเยียวยาต้องใช้เวลา ให้ความพยายามกับตัวเองอย่างใจเย็นนะ",
    "คุณเข้มแข็งกว่าที่คุณคิด และกล้าหาญกว่าที่คุณเชื่อ",
];

export function ClientHome({
    onBookSession,
    onViewHistory,
    upcomingAppointments,
    completedCount,
    counselorCount,
    isWaitingForQueue = false,
    onDebugSkipWaiting,
    hasExistingBooking,
}: ClientHomeProps) {
    const todayQuote = useMemo(
        () => dailyQuotes[new Date().getDay() % dailyQuotes.length],
        []
    );

    if (isWaitingForQueue) {
        return (
            <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-8 text-center font-sans">
                <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                    <Timer className="w-12 h-12 text-[var(--color-accent-blue)] animate-pulse" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">ได้รับข้อมูลของคุณเรียบร้อยแล้ว</h1>
                <p className="text-lg text-gray-600 max-w-md mb-8 leading-relaxed">
                    พี่ป๊อปกำลังพิจารณาและจัดสรรผู้ให้คำปรึกษาที่เหมาะสมกับคุณ
                    เราจะแจ้งเตือนคุณผ่านทางหน้าเพจ, เว็บไซต์ และ Google Calendar เมื่อตารางเวลาลงตัว
                </p>
                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 max-w-lg mb-8">
                    <p className="text-amber-800 text-sm italic">"ระหว่างรอ... อย่าลืมใจดีกับตัวเองให้มากๆ นะครับ"</p>
                </div>
                <button
                    onClick={onDebugSkipWaiting}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-[var(--color-accent-blue)] transition-colors"
                >
                    เข้าสู่หน้าหลักชั่วคราว (เพื่อการทดสอบ) <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">ยินดีต้อนรับกลับมา 👋</h1>
                <p className="text-[var(--color-text-secondary)]">วันนี้คุณรู้สึกอย่างไรบ้าง? เราพร้อมรับฟังคุณเสมอ</p>
            </div>

            <div className="bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-green)] rounded-[2rem] p-8 mb-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10 flex items-start gap-4">
                    <Sparkles className="w-8 h-8 shrink-0 opacity-80" />
                    <div>
                        <h3 className="text-white/80 font-medium mb-1 uppercase tracking-wider text-xs">แรงบันดาลใจวันนี้</h3>
                        <p className="text-xl md:text-2xl font-medium leading-relaxed italic">"{todayQuote}"</p>
                    </div>
                </div>
                <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-1">
                    <button
                        onClick={hasExistingBooking ? onViewHistory : onBookSession}
                        className={`w-full p-8 rounded-[2rem] shadow-md flex flex-col items-center justify-center gap-4 group h-full min-h-[250px] transition-all ${hasExistingBooking
                                ? 'bg-amber-50 border-2 border-amber-200 text-amber-800 hover:bg-amber-100'
                                : 'bg-[var(--color-accent-green)] text-white hover:opacity-90'
                            }`}
                    >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${hasExistingBooking ? 'bg-amber-200' : 'bg-white/20'}`}>
                            {hasExistingBooking
                                ? <Info className="w-8 h-8 text-amber-600" />
                                : <Calendar className="w-8 h-8 text-white" />
                            }
                        </div>
                        <div className="text-center">
                            <span className="text-xl font-bold block mb-1">
                                {hasExistingBooking ? 'ท่านมีนัดหมายอยู่แล้ว' : 'จองเวลารับคำปรึกษา'}
                            </span>
                            <span className={`text-sm ${hasExistingBooking ? 'text-amber-700 font-medium underline' : 'opacity-80'}`}>
                                {hasExistingBooking ? 'กรุณายกเลิกนัดเดิมที่หน้าประวัติ' : 'นัดหมายต่อเนื่องหรือขอคำปรึกษาใหม่'}
                            </span>
                        </div>
                    </button>
                </div>

                <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-[var(--color-border)]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">การนัดหมายที่กำลังจะมาถึง</h3>
                        <button onClick={onViewHistory} className="text-xs text-[var(--color-accent-blue)] font-bold hover:underline">
                            ประวัติทั้งหมด
                        </button>
                    </div>

                    {upcomingAppointments.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-gray-400">ไม่มีนัดหมายที่กำลังจะมาถึง</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {upcomingAppointments.map((apt) => (
                                <div key={apt.id} className="flex flex-col md:flex-row md:items-center gap-4 p-5 bg-[var(--color-primary-blue)] rounded-2xl border border-blue-50">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0">
                                        <User className="w-6 h-6 text-[var(--color-accent-green)]" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-[var(--color-text-primary)]">
                                            ผู้ให้คำปรึกษา: {apt.counselor}
                                        </h4>
                                        <div className="flex gap-4 mt-1 flex-wrap">
                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                <Calendar className="w-4 h-4" /> {apt.date}
                                            </span>
                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                <Clock className="w-4 h-4" /> {apt.time} น.
                                            </span>
                                        </div>
                                    </div>
                                    <div className="px-4 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-bold border border-green-100">
                                        ยืนยันแล้ว
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-border)]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-[var(--color-accent-blue)]" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">เซสชันที่เสร็จสิ้น</p>
                            <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-border)]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                            <User className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">ผู้เชี่ยวชาญในระบบ</p>
                            <p className="text-2xl font-bold text-gray-900">{counselorCount}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}