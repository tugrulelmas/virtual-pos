'use client';

import { useState, FormEvent } from 'react';

export default function QrPaymentForm() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [amount, setAmount] = useState('1.00');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            // Call API to generate form data for QNB QR payment
            const response = await fetch('/api/payment/qr-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'QR payment initiation failed');
            }

            const data = await response.json();

            // Create and submit form for QR payment redirect
            const form = document.createElement('form');
            form.method = data.method;
            form.action = data.action;

            data.inputs.forEach((input: { name: string; value: string }) => {
                const hiddenField = document.createElement('input');
                hiddenField.type = 'hidden';
                hiddenField.name = input.name;
                hiddenField.value = input.value;
                form.appendChild(hiddenField);
            });

            document.body.appendChild(form);
            form.submit();
        } catch (error) {
            console.error('QR Payment error:', error);
            alert('QR ödeme başlatılamadı: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">QR ile Ödeme</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Amount */}
                <div>
                    <label htmlFor="qr-amount" className="block text-sm font-medium text-gray-700 mb-1">
                        Tutar (TL)
                    </label>
                    <input
                        type="number"
                        id="qr-amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        step="0.01"
                        min="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 font-medium"
                        placeholder="1.00"
                        required
                        disabled={isProcessing}
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isProcessing}
                    className={`w-full py-3 px-4 rounded-md text-white font-semibold transition-colors ${isProcessing
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                >
                    {isProcessing ? 'QR Oluşturuluyor...' : 'QR ile Öde'}
                </button>
            </form>

            {/* Test Info */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-800">
                    <strong>QR Ödeme:</strong> Mobil bankacılık uygulamanızla QR kodu okutun
                </p>
            </div>
        </div>
    );
}
