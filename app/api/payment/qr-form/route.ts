import { NextRequest, NextResponse } from 'next/server';
import { credentials } from '@/lib/config';
import crypto from 'crypto';

const QNB_QR_TEST_URL = 'https://vpostest.qnb.com.tr/Gateway/QR/QRHost.aspx';

function getSHA1Base64(input: string): string {
    return crypto.createHash('sha1').update(input, 'utf8').digest('base64');
}

function generateQrOrderID(transactionId: string): string {
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${transactionId}-${random}`;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount } = body;

        // Validate inputs
        if (!amount) {
            return NextResponse.json(
                { error: 'Amount is required' },
                { status: 400 }
            );
        }

        // Generate unique order ID
        const orderId = generateQrOrderID(Date.now().toString());

        // Get base URL for callbacks
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('host') || 'localhost:3000';
        const baseUrl = `${protocol}://${host}`;

        const successUrl = `${baseUrl}/api/payment/qr-callback`;
        const errorUrl = `${baseUrl}/api/payment/qr-callback`;

        // Format amount
        const formattedAmount = amount.toFixed(2);

        // QNB QR Payment parameters
        const params: { [key: string]: string } = {
            MbrId: '5',
            MerchantID: credentials.merchantCode,
            UserCode: credentials.merchantUser,
            UserPass: credentials.merchantUserPass,
            SecureType: 'NonSecure',
            TxnType: 'Auth',
            InstallmentCount: '0',
            Currency: '949', // TRY
            OkUrl: successUrl,
            FailUrl: errorUrl,
            OrderId: orderId,
            PurchAmount: formattedAmount,
            Lang: 'TR',
            Rnd: Date.now().toString(),
            // Required empty parameters
            CardHolderName: '',
            Pan: '',
            Expiry: '',
            Cvv2: '',
            MOTO: ''
        };

        // Generate hash
        const hashStr =
            params.MbrId +
            params.OrderId +
            params.PurchAmount +
            params.OkUrl +
            params.FailUrl +
            params.TxnType +
            params.InstallmentCount +
            params.Rnd +
            credentials.merchantPass;

        params.Hash = getSHA1Base64(hashStr);

        // Return form data
        const inputs = Object.entries(params).map(([name, value]) => ({
            name,
            value
        }));

        return NextResponse.json({
            action: QNB_QR_TEST_URL,
            method: 'POST',
            inputs
        });
    } catch (error) {
        console.error('QR form generation error:', error);
        return NextResponse.json(
            { error: 'QR form generation failed', message: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
