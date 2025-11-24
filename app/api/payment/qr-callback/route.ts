import { credentials } from '@/lib/config';
import { getSHA1Base64 } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export function validateQrCallbackHash(
    orderId: string,
    authCode: string,
    procReturnCode: string,
    tdStatus: string,
    responseRnd: string,
    responseHash: string
): boolean {
    // QNB Callback Hash Format:
    // MerchantID + MerchantPass + OrderId + AuthCode + ProcReturnCode + 3DStatus + ResponseRnd + UserCode
    const expectedHashStr =
        credentials.merchantCode +
        credentials.merchantPass +
        orderId +
        (authCode || '') +
        procReturnCode +
        (tdStatus || '') +
        responseRnd +
        credentials.merchantUser;

    const expectedHash = getSHA1Base64(expectedHashStr);

    return expectedHash === responseHash;
}

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

        // Validate hash if provided
        if (responseRnd && responseHash) {
            const isValid = validateQrCallbackHash(
                orderId,
                authCode || '',
                procReturnCode,
                tdStatus || '',
                responseRnd,
                responseHash
            );

            if (!isValid) {
                console.error('QR payment callback - ResponseHash validation failed');
                return new Response('Invalid hash', { status: 400 });
            }
        }

        // Check if payment was successful
        const isSuccess = procReturnCode === '00';

        if (isSuccess) {
            // Payment successful - redirect to success page
            const successUrl = new URL('/payment/success', request.url);
            successUrl.searchParams.set('orderId', orderId || '');
            successUrl.searchParams.set('authCode', authCode || '');
            successUrl.searchParams.set('type', 'qr');

            return NextResponse.redirect(successUrl);
        } else {
            // Payment failed - redirect to error page
            const errorUrl = new URL('/payment/error', request.url);
            errorUrl.searchParams.set('error', errMsg || 'QR payment failed');
            errorUrl.searchParams.set('code', procReturnCode || '');
            errorUrl.searchParams.set('orderId', orderId || '');

            return NextResponse.redirect(errorUrl);
        }
    } catch (error) {
        console.error('QR callback processing error:', error);

        // Redirect to error page
        const errorUrl = new URL('/payment/error', request.url);
        errorUrl.searchParams.set('error', 'QR callback processing failed');

        return NextResponse.redirect(errorUrl);
    }
}
