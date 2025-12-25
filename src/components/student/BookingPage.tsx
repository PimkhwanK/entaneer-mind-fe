import React, { useState } from 'react';
import { Calendar, Clock, User, ChevronLeft, ChevronRight, X } from 'lucide-react';

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

    // Generate mock time slots for the selected date
    const generateTimeSlots = (): TimeSlot[] => {
        const slots: TimeSlot[] = [];
        const counselors = ['Dr. Sarah Chen', 'Dr. Michael Torres', 'Dr. Emily Watson'];
        const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

        times.forEach((time) => {
            const randomCounselor = counselors[Math.floor(Math.random() * counselors.length)];
            const available = Math.random() > 0.3; // 70% availability
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

    const handleBooking = () => {
        if (selectedSlot && description.trim()) {
            const dateStr = selectedDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            onBook(dateStr, selectedSlot.time, description);
            setShowDescriptionModal(false);
            setDescription('');
            setSelectedSlot(null);
        }
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek };
    };

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(selectedDate);

    const previousMonth = () => {
        setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="mb-2">Book a Session</h1>
            <p className="mb-8">Select a date and time that works best for you</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Calendar */}
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3>
                            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h3>
                        <div className="flex gap-2">
                            <button
                                onClick={previousMonth}
                                className="p-2 hover:bg-[var(--color-primary-blue)] rounded-xl transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={nextMonth}
                                className="p-2 hover:bg-[var(--color-primary-blue)] rounded-xl transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="text-center text-sm text-[var(--color-text-secondary)] py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const isSelected = selectedDate.getDate() === day;
                            const isToday = new Date().getDate() === day &&
                                new Date().getMonth() === selectedDate.getMonth();

                            return (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))}
                                    className={`aspect-square rounded-xl flex items-center justify-center transition-all ${isSelected
                                            ? 'bg-[var(--color-accent-green)] text-white'
                                            : isToday
                                                ? 'bg-[var(--color-mint-green)] text-[var(--color-accent-green)]'
                                                : 'hover:bg-[var(--color-primary-blue)]'
                                        }`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Available Time Slots */}
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <Calendar className="w-5 h-5 text-[var(--color-accent-green)]" />
                        <h3>
                            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </h3>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {timeSlots.map((slot, index) => (
                            <button
                                key={index}
                                onClick={() => handleSlotClick(slot)}
                                disabled={!slot.available}
                                className={`w-full p-4 rounded-2xl transition-all flex items-center justify-between ${slot.available
                                        ? 'bg-[var(--color-primary-blue)] hover:bg-[var(--color-mint-green)] cursor-pointer'
                                        : 'bg-gray-100 opacity-50 cursor-not-allowed'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-[var(--color-accent-blue)]" />
                                    <div className="text-left">
                                        <div className="text-[var(--color-text-primary)]">{slot.time}</div>
                                        <div className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {slot.counselor}
                                        </div>
                                    </div>
                                </div>
                                <span className={`text-sm px-3 py-1 rounded-full ${slot.available
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {slot.available ? 'Available' : 'Booked'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Problem Description Modal */}
            {showDescriptionModal && selectedSlot && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h3>Describe Your Concern</h3>
                            <button
                                onClick={() => {
                                    setShowDescriptionModal(false);
                                    setDescription('');
                                }}
                                className="p-2 hover:bg-[var(--color-primary-blue)] rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-6 p-4 bg-[var(--color-primary-blue)] rounded-2xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-[var(--color-accent-blue)]" />
                                <span className="text-sm">
                                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                </span>
                                <span className="text-[var(--color-text-secondary)]">•</span>
                                <Clock className="w-4 h-4 text-[var(--color-accent-blue)]" />
                                <span className="text-sm">{selectedSlot.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-[var(--color-accent-blue)]" />
                                <span className="text-sm">{selectedSlot.counselor}</span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm mb-2 text-[var(--color-text-secondary)]">
                                What would you like to discuss? (Optional)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Share what's on your mind... This helps your counselor prepare for the session."
                                rows={6}
                                className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-green)] resize-none"
                            />
                            <p className="text-sm text-[var(--color-text-secondary)] mt-2">
                                Your information is confidential and secure.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDescriptionModal(false);
                                    setDescription('');
                                }}
                                className="flex-1 px-6 py-3 border border-[var(--color-border)] rounded-2xl hover:bg-[var(--color-primary-blue)] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBooking}
                                className="flex-1 px-6 py-3 bg-[var(--color-accent-green)] text-white rounded-2xl hover:opacity-90 transition-opacity"
                            >
                                Confirm Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
