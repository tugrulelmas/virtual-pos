'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId') || '-';
    const transId = searchParams.get('transId') || '-';
    const authCode = searchParams.get('authCode') || '-';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                <div className="text-center">
                    {/* Success Icon */}
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                        <svg
                            className="h-10 w-10 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>

                    {/* Success Message */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Ödeme Başarılı!
                    </h1>
                    <p className="text-gray-600 mb-6">
                        3D Secure ödemeniz başarıyla tamamlandı.
                    </p>

                    {/* Payment Details */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Sipariş No:</span>
                                <span className="font-medium text-gray-900">{orderId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">İşlem No:</span>
                                <span className="font-medium text-gray-900">{transId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Yetki Kodu:</span>
                                <span className="font-medium text-gray-900">{authCode}</span>
                            </div>
                        </div>
                    </div>

                    {/* Back Button */}
                    <Link
                        href="/"
                        className="inline-block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors"
                    >
                        Ana Sayfaya Dön
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
