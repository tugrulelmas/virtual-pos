import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { credentials } from '@/lib/config';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        // Extract callback parameters
        const orderId = formData.get('OrderId') as string;
        const authCode = formData.get('AuthCode') as string;
        const procReturnCode = formData.get('ProcReturnCode') as string;
        const tdStatus = formData.get('3DStatus') as string;
        const responseRnd = formData.get('ResponseRnd') as string;
        const responseHash = formData.get('ResponseHash') as string;
        const errMsg = formData.get('ErrMsg') as string;

        if (responseRnd && responseHash) {
            const expectedHashStr =
                credentials.merchantCode +
                credentials.merchantPass +
                orderId +
                (authCode || '') +
                procReturnCode +
                (tdStatus || '') +
                responseRnd +
                credentials.merchantUser;

            const expectedHash = crypto.createHash('sha1').update(expectedHashStr, 'utf8').digest('base64');

            if (expectedHash !== responseHash) {
                console.error('ResponseHash validation failed');
                return new Response('Invalid hash', { status: 400 });
            }
        }

        // Check if payment was successful
        // ProcReturnCode: "00" for success
        const isSuccess = procReturnCode === '00';

        if (isSuccess) {
            // Payment successful - redirect to success page
            const successUrl = new URL('/payment/success', request.url);
            successUrl.searchParams.set('orderId', orderId || '');
            successUrl.searchParams.set('authCode', authCode || '');

            return NextResponse.redirect(successUrl, { status: 307 });
        } else {
            // Payment failed - redirect to error page
            const errorUrl = new URL('/payment/error', request.url);
            errorUrl.searchParams.set('error', errMsg || 'Payment failed');
            errorUrl.searchParams.set('code', procReturnCode || '');
            errorUrl.searchParams.set('orderId', orderId || '');

            return NextResponse.redirect(errorUrl, { status: 307 });
        }
    } catch (error) {
        console.error('Callback processing error:', error);

        // Redirect to error page
        const errorUrl = new URL('/payment/error', request.url);
        errorUrl.searchParams.set('error', 'Callback processing failed');

        return NextResponse.redirect(errorUrl);
    }
}