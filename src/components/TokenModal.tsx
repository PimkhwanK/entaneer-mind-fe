import React, { useState } from 'react';
import { Key, AlertCircle } from 'lucide-react';

interface TokenModalProps {
    onSubmit: (token: string) => void;
}

export function TokenModal({ onSubmit }: TokenModalProps) {
    const [token, setToken] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!token.trim()) {
            setError('กรุณากรอกรหัสลงทะเบียนที่ได้รับจากเจ้าหน้าที่');
            return;
        }
        onSubmit(token.trim());
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-mint-green)] flex items-center justify-center">
                        <Key className="w-6 h-6 text-[var(--color-accent-green)]" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">ยืนยันรหัสเข้าใช้งาน</h3>
                </div>

                <p className="mb-6 text-sm text-gray-600 leading-relaxed">
                    กรุณากรอกรหัส <span className="font-bold text-gray-900">Case Code</span> ที่ได้รับจากพี่ป๊อปผ่าน Facebook เพื่อเริ่มต้นการใช้งานระบบนัดหมาย
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm mb-2 text-[var(--color-text-secondary)]">
                            รหัสลงทะเบียน
                        </label>
                        <input
                            type="text"
                            value={token}
                            onChange={(e) => {
                                setToken(e.target.value.toUpperCase());
                                setError('');
                            }}
                            placeholder=""
                            className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-green)] bg-white text-lg font-mono tracking-wider"
                        />
                        {error && (
                            <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[var(--color-accent-green)] text-white py-3 rounded-2xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-green-100"
                    >
                        ตรวจสอบรหัสและเข้าสู่ระบบ
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400">
                        หากยังไม่มีรหัส กรุณาติดต่อ <a href="#" className="text-[var(--color-accent-blue)] font-bold hover:underline">เพจ Entaneer Mind</a>
                    </p>
                </div>
            </div>
        </div>
    );
}