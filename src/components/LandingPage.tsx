import React from 'react';
import { Facebook, Shield, Calendar, Timer } from 'lucide-react';

interface LandingPageProps {
    onLoginSuccess?: () => void;
}

export function LandingPage({ onLoginSuccess }: LandingPageProps) {
    // ✅ คงลิงก์ OAuth เดิมไว้เพื่อให้ Login ได้
    const CMU_OAUTH_URL = "https://login.microsoftonline.com/cf81f1df-de59-4c29-91da-a2dfd04aa751/oauth2/v2.0/authorize?client_id=3627140d-5cca-4468-8567-874e0c9d1230&response_type=code&redirect_uri=http://localhost:3000/cmuEntraIDCallback&scope=api%3A%2F%2Fcmu%2FMis.Account.Read.Me.Basicinfo%20offline_access";

    const handleCMULogin = () => {
        window.location.href = CMU_OAUTH_URL;
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#FBF8EF] font-sans">
            <div className="max-w-4xl w-full">

                {/* Logo and Title - ปรับตาม PR */}
                <div className="text-center mb-4">
                    <img src="Entaneer Mind LOGO.png" className="w-20 h-20 mx-auto mb-4 rounded-full shadow-sm" alt="Logo" />
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-green)] bg-clip-text text-transparent">
                        Entaneer Mind Friend
                    </h1>
                </div>

                {/* Welcome Card */}
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg mb-8 border border-gray-50">
                    <div className="text-center mb-8">
                        <p className="mb-2 text-gray-600">ติดต่อสอบถามเพิ่มเติม Facebook :</p>
                        <a href="https://web.facebook.com/EntaneerMindFriendCMU" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                            Entaneer Mind Friend - คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเชียงใหม่
                        </a>

                        <h2 className="text-2xl font-bold text-gray-800 mt-6 mb-4"></h2>
                        <p className="text-lg text-gray-500 leading-relaxed">
                            เว็บไซต์สำหรับการนัดคิวเพื่อบริการให้คำปรึกษาและดูแลสุขภาพจิต <br />
                            งานบริการศึกษาและพัฒนาคุณภาพนักศึกษา คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเชียงใหม่
                        </p>
                    </div>

                    {/* Login Action - ใช้ฟังก์ชันเดิมที่ทำงานได้ */}
                    <button
                        onClick={handleCMULogin}
                        className="flex items-center justify-center gap-3 w-full max-w-md mx-auto bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-green)] text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-lg mb-10"
                    >
                        <span>เข้าสู่ระบบด้วย CMU Account</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                        </svg>
                    </button>

                    <hr className="mb-10 border-gray-100" />

                    <h3 className="text-xl font-bold text-gray-800 mb-8 text-center">วิธีการจองสำหรับรับบริการครั้งแรก</h3>

                    {/* Features Grid - ขั้นตอน 4 อย่างจาก PR */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        {/* ขั้นตอนที่ 1 */}
                        <div className="text-center p-6 bg-[var(--color-primary-blue)] rounded-2xl border border-blue-50">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--color-mint-green)] flex items-center justify-center">
                                <Facebook className="w-6 h-6 text-[var(--color-accent-green)]" />
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2 text-sm">1. ติดต่อเพจ Facebook</h4>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                ติดต่อผ่านเพจ {" "}
                                <a href="https://web.facebook.com/EntaneerMindFriendCMU" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                                    Entaneer Mind Friend - คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเชียงใหม่
                                </a>
                                {" "}เพื่อพูดคุยเบื้องต้นก่อนรับบริการ
                            </p>
                        </div>

                        {/* ขั้นตอนที่ 2 */}
                        <div className="text-center p-6 bg-[var(--color-primary-blue)] rounded-2xl border border-blue-50">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--color-mint-green)] flex items-center justify-center">
                                <Shield className="w-6 h-6 text-[var(--color-accent-green)]" />
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2 text-sm">2. รับรหัสลงทะเบียน</h4>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                หลังจากพูดคุยกับนักจิตวิทยา คุณจะได้รับรหัสสำหรับนำมาลงทะเบียนในระบบครั้งแรก
                            </p>
                        </div>

                        {/* ขั้นตอนที่ 3 */}
                        <div className="text-center p-6 bg-[var(--color-primary-blue)] rounded-2xl border border-blue-50">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--color-mint-green)] flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-[var(--color-accent-green)]" />
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2 text-sm">3. จองคิวนัดปรึกษา</h4>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                เลือกวันและเวลาที่สะดวกตามตารางเรียนของคุณได้อย่างง่ายดายผ่านเว็บไซต์
                            </p>
                        </div>

                        {/* ขั้นตอนที่ 4 */}
                        <div className="text-center p-6 bg-[var(--color-primary-blue)] rounded-2xl border border-blue-50">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--color-mint-green)] flex items-center justify-center">
                                <Timer className="w-6 h-6 text-[var(--color-accent-green)]" />
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2 text-sm">4. เช็คการจอง</h4>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                ติดตามสถานะและตรวจสอบการนัดหมายได้ที่เมนู "ประวัติการจอง"
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Message */}
                <div className="text-center bg-[var(--color-mint-green)] rounded-3xl p-6 border border-green-100">
                    <p className="text-gray-700 font-medium">
                        <span className="text-[var(--color-accent-green)] mr-2">💚</span>
                        การขอความช่วยเหลือคือความกล้าหาญอย่างหนึ่ง เราพร้อมจะอยู่เคียงข้างคุณ
                    </p>
                </div>
            </div>
        </div>
    );
}