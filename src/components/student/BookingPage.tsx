import React, { useState } from 'react';
import { Calendar, Clock, User, ChevronLeft, ChevronRight, X, Bell, Info, Phone, Hash, ArrowRight } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

interface TimeSlot {
    time: string;
    available: boolean;
    counselor: string;
}

interface BookingPageProps {
    onBook: (date: string, time: string, details: any) => void;
    onNavigateToHistory: () => void;
    hasExistingBooking?: boolean;
}

export function BookingPage({ onBook, onNavigateToHistory, hasExistingBooking = false }: BookingPageProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [selectedCounselor, setSelectedCounselor] = useState('พี่ป๊อป (ห้อง 1)');
    const [showDescriptionModal, setShowDescriptionModal] = useState(false);

    const [studentInfo, setStudentInfo] = useState({
        studentId: '',
        faculty: '',
        phone: '',
        description: ''
    });

    const [syncWithGoogle, setSyncWithGoogle] = useState(false);
    const [googleToken, setGoogleToken] = useState<string | null>(null);

    const counselorData: { [key: string]: { room: string, email: string } } = {
        'พี่ป๊อป (ห้อง 1)': { room: 'ห้อง 1', email: 'fordsaranpong@gmail.com' },
        'พี่น้ำขิง (ห้อง 2)': { room: 'ห้อง 2', email: 'pimkhwan2002@gmail.com' }
    };

    const counselors = Object.keys(counselorData);

    const timeSlots: TimeSlot[] = [
        { time: '09:00', available: true, counselor: selectedCounselor },
        { time: '10:00', available: false, counselor: selectedCounselor },
        { time: '11:00', available: true, counselor: selectedCounselor },
        { time: '13:00', available: true, counselor: selectedCounselor },
        { time: '14:00', available: true, counselor: selectedCounselor },
        { time: '15:00', available: false, counselor: selectedCounselor },
    ];

    const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 9) {
            setStudentInfo({ ...studentInfo, studentId: value });
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 10) {
            setStudentInfo({ ...studentInfo, phone: value });
        }
    };

    // แก้ไข: ให้ฟังก์ชันนี้คืนค่า Google Event Data เพื่อเอา Event ID ไปใช้ยกเลิกภายหลัง
    const createGoogleEvent = async (date: Date, time: string, info: any, counselorName: string) => {
        const [hours, minutes] = time.split(':');
        const startDateTime = new Date(date);
        startDateTime.setHours(parseInt(hours), parseInt(minutes), 0);

        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(startDateTime.getHours() + 1);

        const counselorEmail = counselorData[counselorName].email;

        const event = {
            summary: `นัดหมายปรึกษา: ${counselorName} (Entaneer Mind)`,
            description: `รหัสนักศึกษา: ${info.studentId}\nเบอร์โทร: ${info.phone}\nเรื่องที่ปรึกษา: ${info.description}`,
            start: { dateTime: startDateTime.toISOString(), timeZone: 'Asia/Bangkok' },
            end: { dateTime: endDateTime.toISOString(), timeZone: 'Asia/Bangkok' },
            attendees: [
                { email: counselorEmail }
            ],
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 1440 },
                    { method: 'popup', minutes: 30 },
                ],
            },
        };

        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${googleToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
        });

        if (!response.ok) throw new Error('Failed to create Google event');
        const data = await response.json();
        return data.id; // ส่ง ID ของ Event กลับไปบันทึก
    };

    const loginToGoogle = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            setGoogleToken(tokenResponse.access_token);
            setSyncWithGoogle(true);
        },
        scope: 'https://www.googleapis.com/auth/calendar.events',
    });

    const handleBooking = async () => {
        if (studentInfo.studentId.length !== 9) {
            alert('รหัสนักศึกษาต้องมี 9 หลัก');
            return;
        }
        if (studentInfo.phone.length !== 10) {
            alert('เบอร์โทรศัพท์ต้องมี 10 หลัก');
            return;
        }

        if (selectedSlot) {
            const dateStr = selectedDate.toLocaleDateString('th-TH', {
                month: 'short', day: 'numeric', year: 'numeric'
            });

            let googleEventId = null;

            if (syncWithGoogle && googleToken) {
                try {
                    // เก็บ Event ID ไว้เพื่อส่งต่อให้ฟังก์ชัน onBook
                    googleEventId = await createGoogleEvent(selectedDate, selectedSlot.time, studentInfo, selectedCounselor);
                } catch (error) {
                    console.error("Google Sync Error:", error);
                }
            }

            // ส่งข้อมูลทั้งหมดรวมถึง googleEventId และ token เพื่อใช้ในการยกเลิก (Cancel) ในหน้า History
            onBook(dateStr, selectedSlot.time, {
                ...studentInfo,
                googleEventId,
                googleToken: syncWithGoogle ? googleToken : null,
                counselorName: selectedCounselor
            });

            setShowDescriptionModal(false);
            setStudentInfo({ studentId: '', faculty: '', phone: '', description: '' });
        }
    };

    const { daysInMonth, startingDayOfWeek } = (() => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        return {
            daysInMonth: new Date(year, month + 1, 0).getDate(),
            startingDayOfWeek: new Date(year, month, 1).getDay()
        };
    })();

    return (
        <div className="p-8 max-w-6xl mx-auto font-sans bg-[#FBFBFB] min-h-screen">
            <header className="mb-8">
                <h1 className="mb-2 text-3xl font-bold text-gray-800">จองคิวรับคำปรึกษา</h1>
                <p className="text-gray-500">เลือกผู้ให้คำปรึกษา วันที่ และเวลาที่ท่านสะดวก</p>
            </header>

            <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-3xl flex gap-4 items-center shadow-sm">
                <div className="bg-amber-100 p-2 rounded-full">
                    <Info className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                    <p className="text-sm text-amber-800 leading-relaxed">
                        <strong>คำแนะนำการจอง:</strong> ท่านสามารถมีนัดหมายได้เพียง 1 รายการเท่านั้น
                        หากต้องการเปลี่ยนเวลา <button onClick={onNavigateToHistory} className="font-bold underline text-amber-900 hover:text-amber-700 decoration-amber-500 underline-offset-4">กรุณายกเลิกนัดเดิมที่หน้าประวัติ</button> ก่อนทำรายการใหม่
                    </p>
                </div>
                <ArrowRight className="w-5 h-5 text-amber-400" />
            </div>

            {/* 1. เลือกผู้ให้คำปรึกษา */}
            <section className="mb-10">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-700">
                    <User className="w-5 h-5 text-green-600" /> 1. เลือกผู้ให้คำปรึกษา
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {counselors.map((name) => (
                        <button
                            key={name}
                            onClick={() => setSelectedCounselor(name)}
                            className={`p-6 rounded-[2rem] border-2 transition-all text-left flex items-center justify-between ${selectedCounselor === name ? 'border-green-500 bg-green-50 shadow-md shadow-green-100' : 'border-white bg-white hover:border-gray-200 shadow-sm'}`}
                        >
                            <p className={`font-bold text-lg ${selectedCounselor === name ? 'text-green-800' : 'text-gray-700'}`}>{name}</p>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedCounselor === name ? 'border-green-500 bg-green-500' : 'border-gray-200'}`}>
                                {selectedCounselor === name && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* 2. เลือกวันที่ */}
                <section>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-700">
                        <Calendar className="w-5 h-5 text-green-600" /> 2. เลือกวันที่
                    </h3>
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="font-bold text-xl">{selectedDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}</h4>
                            <div className="flex gap-2">
                                <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                                <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"><ChevronRight className="w-5 h-5" /></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-gray-400 mb-4 tracking-widest">
                            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => <div key={d}>{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-3">
                            {Array.from({ length: startingDayOfWeek }).map((_, i) => <div key={i} />)}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const isSelected = selectedDate.getDate() === day;
                                return (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))}
                                        className={`aspect-square rounded-2xl text-base font-medium transition-all ${isSelected ? 'bg-green-500 text-white shadow-lg shadow-green-200 scale-110' : 'hover:bg-green-50 text-gray-600'}`}
                                    >{day}</button>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* 3. เลือกเวลา */}
                <section>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-700">
                        <Clock className="w-5 h-5 text-green-600" /> 3. เลือกเวลา
                    </h3>
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50 h-[460px] flex flex-col">
                        <div className="mb-4 text-sm text-gray-400 font-medium">ตารางเวลาสำหรับ {selectedDate.toLocaleDateString('th-TH', { dateStyle: 'long' })}</div>
                        <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                            {timeSlots.map((slot, i) => (
                                <button
                                    key={i}
                                    disabled={!slot.available || hasExistingBooking}
                                    onClick={() => { setSelectedSlot(slot); setShowDescriptionModal(true); }}
                                    className={`w-full p-5 rounded-2xl flex items-center justify-between border-2 transition-all ${slot.available ? 'border-gray-50 bg-gray-50 hover:border-green-500 hover:bg-white' : 'bg-gray-50 opacity-40 cursor-not-allowed'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-2 rounded-full ${slot.available ? 'bg-green-500' : 'bg-gray-400'}`} />
                                        <span className="font-bold text-gray-700 text-lg">{slot.time} น.</span>
                                    </div>
                                    <span className={`text-xs font-bold px-4 py-1.5 rounded-full ${slot.available ? 'bg-white text-green-600 border border-green-100' : 'bg-gray-200 text-gray-500'}`}>
                                        {slot.available ? 'ว่างสำหรับการจอง' : 'มีผู้จองแล้ว'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            {/* Modal ยืนยันข้อมูล */}
            {showDescriptionModal && selectedSlot && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[3rem] shadow-2xl max-w-md w-full p-10 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-bold text-gray-800">ยืนยันข้อมูลนัดหมาย</h3>
                            <button onClick={() => setShowDescriptionModal(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200"><X className="w-5 h-5 text-gray-500" /></button>
                        </div>

                        <div className="space-y-5">
                            <div className="bg-green-50 p-4 rounded-2xl border border-green-100 mb-2 text-sm text-green-800">
                                <p><strong>ผู้ให้คำปรึกษา:</strong> {selectedCounselor}</p>
                                <p><strong>วัน/เวลา:</strong> {selectedDate.toLocaleDateString('th-TH')} @ {selectedSlot.time} น.</p>
                            </div>

                            <div className="relative">
                                <label className="flex items-center gap-2 text-xs font-black text-gray-400 mb-2 uppercase tracking-tighter">รหัสนักศึกษา *</label>
                                <div className="relative">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="650610xxx"
                                        value={studentInfo.studentId}
                                        onChange={handleStudentIdChange}
                                    />
                                </div>
                            </div>

                            <div className="relative">
                                <label className="flex items-center gap-2 text-xs font-black text-gray-400 mb-2 uppercase tracking-tighter">เบอร์โทรศัพท์ *</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="08xxxxxxxx"
                                        value={studentInfo.phone}
                                        onChange={handlePhoneChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-tighter">เรื่องที่ต้องการปรึกษา</label>
                                <textarea className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 outline-none min-h-[100px] resize-none" placeholder="ระบุสิ่งที่กังวล..." value={studentInfo.description} onChange={(e) => setStudentInfo({ ...studentInfo, description: e.target.value })} />
                            </div>

                            <button onClick={() => !syncWithGoogle && loginToGoogle()} className={`w-full p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${syncWithGoogle ? 'bg-green-600 border-green-600 text-white' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                                <div className="flex items-center gap-3">
                                    <Bell className={`w-5 h-5 ${syncWithGoogle ? 'text-white' : 'text-gray-400'}`} />
                                    <span className="text-sm font-bold">แจ้งเตือนผู้ให้คำปรึกษา (Calendar)</span>
                                </div>
                                <div className={`w-10 h-5 rounded-full relative ${syncWithGoogle ? 'bg-white/20' : 'bg-gray-200'}`}>
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${syncWithGoogle ? 'right-1' : 'left-1'}`} />
                                </div>
                            </button>

                            <button onClick={handleBooking} className="w-full py-5 bg-green-500 text-white font-bold text-lg rounded-[1.5rem] shadow-xl shadow-green-200 hover:bg-green-600 hover:-translate-y-1 transition-all active:scale-95">
                                ยืนยันนัดหมาย
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}