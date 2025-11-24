'use client';

import { useState, FormEvent } from 'react';

export default function PaymentForm() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardNumber, setCardNumber] = useState('4508034508034509'); // Test card
    const [cardHolder, setCardHolder] = useState('TEST USER');
    const [expiryMonth, setExpiryMonth] = useState('12');
    const [expiryYear, setExpiryYear] = useState('25');
    const [cvv, setCvv] = useState('000');
    const [amount, setAmount] = useState('1.00');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            const response = await fetch('/api/payment/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cardNumber,
                    cardHolder,
                    expiryMonth,
                    expiryYear,
                    cvv,
                    amount: parseFloat(amount),
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Payment initiation failed');
            }

            const data = await response.json();

            // Create and submit form for 3D Secure redirect
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
            console.error('Payment error:', error);
            alert('Ödeme başlatılamadı: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Kredi Kartı ile Ödeme</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Card Number */}
                <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Kart Numarası
                    </label>
                    <input
                        type="text"
                        id="cardNumber"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
                        maxLength={16}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                        placeholder="4508034508034509"
                        required
                    />
                </div>

                {/* Card Holder */}
                <div>
                    <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700 mb-1">
                        Kart Sahibi
                    </label>
                    <input
                        type="text"
                        id="cardHolder"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                        placeholder="TEST USER"
                        required
                    />
                </div>

                {/* Expiry Date */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-700 mb-1">
                            Ay
                        </label>
                        <select
                            id="expiryMonth"
                            value={expiryMonth}
                            onChange={(e) => setExpiryMonth(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                            required
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                <option key={month} value={month.toString().padStart(2, '0')}>
                                    {month.toString().padStart(2, '0')}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="expiryYear" className="block text-sm font-medium text-gray-700 mb-1">
                            Yıl
                        </label>
                        <select
                            id="expiryYear"
                            value={expiryYear}
                            onChange={(e) => setExpiryYear(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                            required
                        >
                            {Array.from({ length: 10 }, (_, i) => 25 + i).map((year) => (
                                <option key={year} value={year.toString()}>
                                    20{year}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* CVV */}
                <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                    </label>
                    <input
                        type="text"
                        id="cvv"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        maxLength={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                        placeholder="000"
                        required
                    />
                </div>

                {/* Amount */}
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                        Tutar (TL)
                    </label>
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        step="0.01"
                        min="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                        placeholder="1.00"
                        required
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isProcessing}
                    className={`w-full py-3 px-4 rounded-md text-white font-semibold transition-colors ${isProcessing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {isProcessing ? 'İşlem Yapılıyor...' : '3D ile Öde'}
                </button>
            </form>

            {/* Test Card Info */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs text-yellow-800">
                    <strong>Test Kart:</strong> 4508034508034509
                    <br />
                    <strong>CVV:</strong> 000 | <strong>Son Kullanma:</strong> 12/25
                </p>
            </div>
        </div>
    );
}
