'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error') || 'Ödeme işlemi başarısız oldu';
    const code = searchParams.get('code') || '';
    const orderId = searchParams.get('orderId') || '';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                <div className="text-center">
                    {/* Error Icon */}
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                        <svg
                            className="h-10 w-10 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </div>

                    {/* Error Message */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Ödeme Başarısız
                    </h1>
                    <p className="text-gray-600 mb-6">
                        {error}
                    </p>

                    {/* Error Details */}
                    {(code || orderId) && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                            <div className="space-y-2 text-sm">
                                {orderId && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Sipariş No:</span>
                                        <span className="font-medium text-gray-900">{orderId}</span>
                                    </div>
                                )}
                                {code && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Hata Kodu:</span>
                                        <span className="font-medium text-gray-900">{code}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Back Button */}
                    <Link
                        href="/"
                        className="inline-block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors"
                    >
                        Tekrar Dene
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function ErrorPage() {
    return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
            <ErrorContent />
        </Suspense>
    );
}
