import React from 'react';
import { Heart, Shield, Calendar } from 'lucide-react';

interface LandingPageProps {
    onLogin: () => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#FBF8EF]">
            <div className="max-w-4xl w-full">
                {/* Logo and Title */}
                <div className="text-center mb-4">
                    <div>
                        <img src="Entaneer Mind LOGO.png" className="w-20 h-20 mx-auto mb-4 rounded-full" />
                    </div>
                    <h1 className="mb-6 bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-green)] bg-clip-text text-transparent">
                        Welcome Back
                    </h1>
                    
                </div>

                {/* Welcome Card */}
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg mb-8">
                    <div className="text-center mb-8">  
                        ติดต่อสอบถามเพิ่มเติม Facebook :{" "}
                        <a href="https://web.facebook.com/EntaneerMindFriendCMU" target="_blank" rel="noopener noreferrer"className="text-blue-600 hover:underline">
                            Entaneer Mind Friend - คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเชียงใหม่
                        </a>

                        <h2 className="mb-4">Entaneer Mind Friend - คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเชียงใหม่</h2>
                        <p className="text-lg">
                            เว็บไซต์สำหรับการนัดคิวเพื่อบริการให้คำปรึกษาและดูและสุขภาพจิต งานบริการศึกษาและพัฒนาคุณภาพนักศึกษา คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเชียงใหม่
                        </p>
                    </div>

                    <p className="text-sm text-[var(--color-text-secondary)] text-center mt-4">
                        

                    {/* Login Button */}
                    <button
                        onClick={onLogin}
                        className="flex items-center gap-2 w-ful p-6 bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-green)] text-white py-4 rounded-2xl hover:opacity-90 transition-opacity shadow-md mx-auto mb-10 "
                    >
                        <span>Login</span><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                        </svg>

                    </button>

                    <h3 className="mb-6">วิธีการจองสำหรับรับบริการครั้งแรก</h3>

                    {/* Features */}
                    <div className="flex flex-col gap-6 mb-4 max-w-2xl mx-auto">
    {/* การ์ดที่ 1 */}
    <div className="text-center p-6 bg-[var(--color-primary-blue)] rounded-2xl">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--color-mint-green)] flex items-center justify-center">
            <svg  className="w-7 h-7 text-[var(--color-accent-green)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" >
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
            </svg>
        </div>
        
        <h4 className="mb-2">ติดต่อ Entaneer Mind Friend - คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเชียงใหม่</h4>
        <p className="text-sm">
    ผู้ใช้ต้องติดต่อเพจ{" "}
    <a href="https://web.facebook.com/EntaneerMindFriendCMU" target="_blank" rel="noopener noreferrer"className="text-[#800000] hover:underline font-medium">
        Entaneer Mind Friend - คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเชียงใหม่
    </a>

    {" "}ก่อนเข้ารับบริการเพื่อพูดคุยเบื้องต้น 
</p>
    </div>

    {/* การ์ดที่ 2 */}
    <div className="text-center p-6 bg-[var(--color-primary-blue)] rounded-2xl">
        <div className=" w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--color-mint-green)] flex items-center justify-center">
            <svg className=" w-7 h-7 text-[var(--color-accent-green)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
            </svg>

        </div>
        <h4 className="mb-2">นำรหัสที่ได้จากการรับมาจากนักจิตวิทยาไปลงทะเบียน</h4>
        <p className="text-sm">
            หลังจากพูดคุยเบื้องต้นกับนักจิตวิทยาแล้วจะได้รับรหัสสำหรับเข้ารับบริการครั้งแรกมา ให้ผู้ใช้นำไปกรอกสำหรับการลงทะเบียน
        </p>
    </div>

    {/* การ์ดที่ 3 */}
    <div className="text-center p-6 bg-[var(--color-primary-blue)] rounded-2xl">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--color-mint-green)] flex items-center justify-center">
            <Calendar className="w-6 h-6 text-[var(--color-accent-green)]" />
            
        </div>
        <h4 className="mb-2">จองคิวนัดปรึกษา</h4>
        <p className="text-sm">
            เลือกวันและเวลาที่สะดวกตามตารางเรียนของคุณได้อย่างง่ายดาย
        </p>
    </div>

    {/* การ์ดที่ 4 */}
    <div className="text-center p-6 bg-[var(--color-primary-blue)] rounded-2xl">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--color-mint-green)] flex items-center justify-center">
            <svg className=" w-7 h-7 text-[var(--color-accent-green)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
        </div>
        <h4 className="mb-2">เช็คการจอง</h4>
        <p className="text-sm">
            ผู้ใช้บริการสามารถเช็คการจองโดยไปที่เมนู ประวัติการจอง
        </p>
    </div>
</div>

            </p>
                    
                </div>

            </div>
        </div>
    );
}
