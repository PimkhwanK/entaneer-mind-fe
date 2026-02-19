import React from 'react';
import { Shield, Info, Lock, UserCheck } from 'lucide-react';

interface PDPAModalProps {
    onAccept: () => void;
}

export function PDPAModal({ onAccept }: PDPAModalProps) {
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full p-8 md:p-10 animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--color-mint-green)] flex items-center justify-center shrink-0">
                        <Shield className="w-8 h-8 text-[var(--color-accent-green)]" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">ข้อกำหนดและเงื่อนไข</h2>
                        <p className="text-sm text-gray-500">Personal Data Protection Policy (PDPA)</p>
                    </div>
                </div>

                {/* Content Area - Scrollable */}
                <div className="space-y-6 overflow-y-auto pr-4 mb-8 custom-scrollbar text-gray-600 leading-relaxed">

                    <section className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100">
                        <h4 className="flex items-center gap-2 font-bold text-[var(--color-accent-blue)] mb-3">
                            <Info className="w-5 h-5" /> วัตถุประสงค์ของระบบ
                        </h4>
                        <p className="text-sm">
                            Entaneer Mind เป็นเครื่องมือประเมินสุขภาพจิตเบื้องต้นและนัดหมายเพื่อรับคำปรึกษา
                            โดยมีวัตถุประสงค์เพื่อคัดกรองความเสี่ยงและติดตามดูแลช่วยเหลือผู้รับคำปรึกษา
                            ข้อมูลจะถูกนำไปใช้เพื่อพัฒนาระบบการดูแลสุขภาพจิตตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
                        </p>
                    </section>

                    <div className="space-y-4 px-2">
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-[var(--color-accent-green)]" /> การเก็บรวบรวมและคุ้มครองข้อมูล
                        </h4>
                        <ul className="list-none space-y-3 text-sm">
                            <li className="flex items-start gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-accent-green)] shrink-0" />
                                <span><b>ข้อมูลส่วนบุคคล:</b> ชื่อ-นามสกุล, รหัสประจำตัว และข้อมูลการติดต่อเพื่อใช้ในการนัดหมาย</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-accent-green)] shrink-0" />
                                <span><b>ข้อมูลอ่อนไหว:</b> ผลการประเมินสุขภาพจิตและบันทึกการปรึกษา (ข้อมูลนี้จะถูกเก็บเป็นความลับสูงสุดตามจรรยาบรรณวิชาชีพ)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-accent-green)] shrink-0" />
                                <span><b>การเปิดเผยข้อมูล:</b> มหาวิทยาลัยจะไม่เปิดเผยข้อมูลให้บุคคลภายนอก เว้นแต่เพื่อประโยชน์ในการดูแลรักษาพยาบาลหรือตามที่กฎหมายกำหนด</span>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4 px-2">
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-[var(--color-accent-blue)]" /> สิทธิของเจ้าของข้อมูล
                        </h4>
                        <p className="text-sm">
                            ท่านมีสิทธิในการเข้าถึง ขอสำเนา แก้ไข หรือขอให้ลบข้อมูลส่วนบุคคลของท่านได้ตลอดเวลา
                            โดยสามารถติดต่อเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคลผ่านช่องทางที่มหาวิทยาลัยกำหนด
                        </p>
                    </div>

                    <p className="text-[13px] italic bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        * การคลิก "ยอมรับและดำเนินการต่อ" ถือว่าท่านได้รับทราบและยินยอมให้นโยบายคุ้มครองข้อมูลส่วนบุคคลข้างต้นมีผลบังคับใช้
                    </p>
                </div>

                {/* Footer Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => window.history.back()}
                        className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition-colors"
                    >
                        ปฏิเสธ
                    </button>
                    <button
                        onClick={onAccept}
                        className="flex-[2] bg-[var(--color-accent-green)] text-white py-4 rounded-2xl font-bold shadow-lg shadow-green-200 hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                        ยอมรับและดำเนินการต่อ
                    </button>
                </div>
            </div>
        </div>
    );
}