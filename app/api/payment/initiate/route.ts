import { NextRequest, NextResponse } from 'next/server';
import { initiate3DPayment, generateOrderID } from '@/lib/qnb-pos';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { cardNumber, cardHolder, expiryMonth, expiryYear, cvv, amount } = body;

        // Validate inputs
        if (!cardNumber || !expiryMonth || !expiryYear || !cvv || !amount) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get client IP
        const clientIp = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            '127.0.0.1';

        // Generate unique order ID
        const orderId = generateOrderID(Date.now().toString());

        // Get base URL for callbacks
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('host') || 'localhost:3000';
        const baseUrl = `${protocol}://${host}`;

        const successUrl = `${baseUrl}/api/payment/callback`;
        const errorUrl = `${baseUrl}/api/payment/callback`;

        // Initiate 3D payment with QNB
        const formData = await initiate3DPayment(
            orderId,
            amount,
            cardNumber,
            expiryMonth,
            expiryYear,
            cvv,
            successUrl,
            errorUrl,
            clientIp,
            'customer@example.com',
            false // use test environment
        );

        return NextResponse.json(formData);
    } catch (error) {
        console.error('Payment initiation error:', error);
        return NextResponse.json(
            { error: 'Payment initiation failed', message: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
