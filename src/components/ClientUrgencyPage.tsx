import React, { useState } from 'react';
import { ClockFading , AlertCircle, CheckCircle2 } from 'lucide-react';

interface UrgencyModalProps {
    onSubmit: (urgencyLevel: string, urgencyDetails: string) => void;
}

export function UrgencyModal({ onSubmit }: UrgencyModalProps) {
    const [urgencyLevel, setUrgencyLevel] = useState('');
    const [urgencyDetails, setUrgencyDetails] = useState('');
    const [error, setError] = useState('');


    {/*สำหรับตกแต่งสีของปุ่ม*/}
    const urgencyOptions = [
       { 
            id: 'low', 
            label: 'ไม่รีบ', 
            baseStyle: { borderColor: '#E0F2F1', color: '#2E7D32', backgroundColor: '#F1F8F7' },
            activeStyle: { borderColor: '#66BB6A', ringColor: '#E0F2F1' }
        },
        { 
            id: 'medium', 
            label: 'ยังพอไหว', 
            baseStyle: { borderColor: '#FEF08A', color: '#A16207', backgroundColor: '#FEFCE8' },
            activeStyle: { borderColor: '#EAB308', ringColor: '#FEF9C3' } 
        },
        { 
            id: 'high', 
            label: 'ไม่ไหวแล้ว', 
            baseStyle: { borderColor: '#FECACA', color: '#B91C1C', backgroundColor: '#FEF2F2' },
            activeStyle: { borderColor: '#EF4444', ringColor: '#FEE2E2' } 
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!urgencyLevel) {
            setError('กรุณาเลือกระดับความเร่งด่วน');
            return;
        }
        onSubmit(urgencyLevel,urgencyDetails);
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-mint-green)] flex items-center justify-center">
                        <ClockFading className="w-6 h-6 text-[var(--color-accent-green)]" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">ระดับความเร่งด่วน</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/*ตัวเลือกระดับความฉุกเฉิน*/}
                    <div className="grid grid-cols-1 gap-3">
                        {urgencyOptions.map((opt) => {
                            const isActive = urgencyLevel === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => { setUrgencyLevel(opt.id); setError(''); }}
                                    style={{
                                        borderColor: isActive ? opt.activeStyle.borderColor : opt.baseStyle.borderColor,
                                        color: opt.baseStyle.color,
                                        backgroundColor: opt.baseStyle.backgroundColor,
                                        boxShadow: isActive ? `0 0 0 4px ${opt.activeStyle.ringColor}` : 'none'
                                    }}
                                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all font-bold ${
                                        !isActive ? 'opacity-70 grayscale-[0.3]' : 'opacity-100'
                                    }`}
                                >
                                    {opt.label}
                                    {isActive && <CheckCircle2 className="w-5 h-5" style={{ color: opt.activeStyle.borderColor }} />}
                                </button>
                            );
                        })}
                    </div>

                    {/*รายละเอียดเพิ่มเติมเผื่ออยากอธิบายพี่ป๊อบ*/}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            รายละเอียดเพิ่มเติม (ถ้ามี)
                        </label>
                        <div className="relative">
                            <textarea
                                value={urgencyDetails}
                                onChange={(e) => {
                                    setUrgencyDetails(e.target.value);
                                    if (error) setError('');
                                }}
                                placeholder=" "
                                className="w-full px-4 py-2 rounded-xl border-2 border-gray-100 focus:border-[var(--color-accent-green)] focus:ring-0 transition-all outline-none min-h-[80px] resize-none"
                            />
                            
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-500 text-sm animate-shake">
                            <AlertCircle className="w-4 h-4" />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full mt-4 bg-[var(--color-accent-green)] text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-green-200"
                    >
                        บันทึกข้อมูล
                    </button>
                </form>

            </div>
        </div>
    );
}