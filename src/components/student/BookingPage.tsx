import React, { useState } from 'react';
import { Calendar, Clock, User, ChevronLeft, ChevronRight, X, Bell } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

interface TimeSlot {
    time: string;
    available: boolean;
    counselor: string;
}

interface BookingPageProps {
    onBook: (date: string, time: string, description: string) => void;
}

export function BookingPage({ onBook }: BookingPageProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [showDescriptionModal, setShowDescriptionModal] = useState(false);
    const [description, setDescription] = useState('');
    const [syncWithGoogle, setSyncWithGoogle] = useState(false);
    const [googleToken, setGoogleToken] = useState<string | null>(null);

    // --- ฟังก์ชันสร้าง Event ใน Google Calendar ---
    const createGoogleEvent = async (date: Date, time: string, desc: string, counselor: string) => {
        const [hours, minutes] = time.split(':');
        const startDateTime = new Date(date);
        startDateTime.setHours(parseInt(hours), parseInt(minutes), 0);

        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(startDateTime.getHours() + 1); // นัดหมายครั้งละ 1 ชม.

        const event = {
            summary: `Counseling: ${counselor} (Entaneer Mind)`,
            description: desc,
            start: { dateTime: startDateTime.toISOString(), timeZone: 'Asia/Bangkok' },
            end: { dateTime: endDateTime.toISOString(), timeZone: 'Asia/Bangkok' },
            reminders: { useDefault: true }
        };

        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${googleToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
        });

        if (!response.ok) throw new Error('Failed to create Google event');
        return response.json();
    };

    const loginToGoogle = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            setGoogleToken(tokenResponse.access_token);
            setSyncWithGoogle(true);
        },
        scope: 'https://www.googleapis.com/auth/calendar.events',
        onError: () => {
            alert('Google Login Failed');
            setSyncWithGoogle(false);
        }
    });

    const handleGoogleToggle = () => {
        if (!syncWithGoogle && !googleToken) {
            loginToGoogle();
        } else {
            setSyncWithGoogle(!syncWithGoogle);
        }
    };

    const generateTimeSlots = (): TimeSlot[] => {
        const slots: TimeSlot[] = [];
        const counselors = ['Dr. Sarah Chen', 'Dr. Michael Torres', 'Dr. Emily Watson'];
        const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
        times.forEach((time) => {
            const randomCounselor = counselors[Math.floor(Math.random() * counselors.length)];
            const available = Math.random() > 0.3;
            slots.push({ time, available, counselor: randomCounselor });
        });
        return slots;
    };

    const timeSlots = generateTimeSlots();

    const handleSlotClick = (slot: TimeSlot) => {
        if (slot.available) {
            setSelectedSlot(slot);
            setShowDescriptionModal(true);
        }
    };

    const handleBooking = async () => {
        if (selectedSlot && description.trim()) {
            const dateStr = selectedDate.toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            });

            // --- ส่วนที่แก้ไข: ส่งไป Google Calendar ถ้า User ติ๊กไว้ ---
            if (syncWithGoogle && googleToken) {
                try {
                    await createGoogleEvent(selectedDate, selectedSlot.time, description, selectedSlot.counselor);
                    alert('Successfully booked and added to Google Calendar!');
                } catch (error) {
                    console.error("Google Sync Error:", error);
                    alert('Booking saved in system, but failed to sync with Google Calendar.');
                }
            }

            onBook(dateStr, selectedSlot.time, description);

            // Reset states
            setShowDescriptionModal(false);
            setDescription('');
            setSelectedSlot(null);
            setSyncWithGoogle(false);
        }
    };

    // --- ส่วนการจัดการวันที่ (คงเดิม) ---
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        return { daysInMonth: lastDay.getDate(), startingDayOfWeek: firstDay.getDay() };
    };

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(selectedDate);
    const previousMonth = () => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
    const nextMonth = () => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="mb-2 text-3xl font-bold">Book a Session</h1>
            <p className="mb-8 text-[var(--color-text-secondary)]">Select a date and time that works best for you</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold">
                            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h3>
                        <div className="flex gap-2">
                            <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded-xl"><ChevronLeft className="w-5 h-5" /></button>
                            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-xl"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: startingDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const isSelected = selectedDate.getDate() === day;
                            return (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))}
                                    className={`aspect-square rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-[var(--color-accent-green)] text-white shadow-md' : 'hover:bg-gray-100'
                                        }`}
                                >{day}</button>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6 text-[var(--color-accent-green)]">
                        <Calendar className="w-5 h-5" />
                        <h3 className="text-xl font-semibold text-gray-800">
                            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </h3>
                    </div>
                    <div className="space-y-3 overflow-y-auto pr-2 max-h-[450px]">
                        {timeSlots.map((slot, index) => (
                            <button
                                key={index}
                                onClick={() => handleSlotClick(slot)}
                                disabled={!slot.available}
                                className={`w-full p-4 rounded-2xl transition-all flex items-center justify-between ${slot.available ? 'bg-gray-50 hover:bg-[var(--color-mint-green)]' : 'opacity-40 cursor-not-allowed'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-xl shadow-sm"><Clock className="w-5 h-5 text-[var(--color-accent-blue)]" /></div>
                                    <div className="text-left">
                                        <div className="font-semibold">{slot.time}</div>
                                        <div className="text-sm text-gray-500">{slot.counselor}</div>
                                    </div>
                                </div>
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${slot.available ? 'bg-green-100 text-green-700' : 'bg-gray-200'}`}>
                                    {slot.available ? 'AVAILABLE' : 'BOOKED'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {showDescriptionModal && selectedSlot && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full p-8 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold">Booking Details</h3>
                            <button onClick={() => setShowDescriptionModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
                        </div>

                        <div className="mb-6 p-5 bg-[var(--color-primary-blue)] rounded-3xl">
                            <div className="flex items-center gap-3 mb-2 text-sm font-medium">
                                <Calendar className="w-4 h-4" /> {selectedDate.toDateString()}
                                <Clock className="w-4 h-4 ml-2" /> {selectedSlot.time}
                            </div>
                            <div className="flex items-center gap-3 text-sm"><User className="w-4 h-4" /> {selectedSlot.counselor}</div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2 text-gray-600">What's on your mind?</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-accent-green)] outline-none min-h-[120px] resize-none"
                                placeholder="Briefly describe your concern..."
                            />
                        </div>

                        <div
                            onClick={handleGoogleToggle}
                            className={`mb-8 p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${syncWithGoogle ? 'border-[var(--color-accent-green)] bg-green-50' : 'border-gray-100 hover:border-gray-200'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${syncWithGoogle ? 'bg-[var(--color-accent-green)] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold">Notify via Google Calendar</div>
                                    <div className="text-xs text-gray-500">Sync this appointment to your Gmail</div>
                                </div>
                            </div>
                            <div className={`w-12 h-6 rounded-full relative transition-colors ${syncWithGoogle ? 'bg-[var(--color-accent-green)]' : 'bg-gray-200'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${syncWithGoogle ? 'left-7' : 'left-1'}`} />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setShowDescriptionModal(false)} className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-50 rounded-2xl">Cancel</button>
                            <button onClick={handleBooking} className="flex-1 py-4 font-bold bg-[var(--color-accent-green)] text-white rounded-2xl shadow-lg hover:opacity-90 transition-opacity">Confirm Booking</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}