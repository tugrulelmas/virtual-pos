import { credentials, QNB_3D_PROD_URL, QNB_3D_TEST_URL } from './config';
import { getSHA1Base64 } from './utils';

/**
 * QNB Finansbank Virtual POS Integration Service  
 * Implements 3D Secure payment flow
 */

export interface Payment3DFormData {
    action: string;
    method: string;
    inputs: { name: string; value: string }[];
}

/**
 * Generate order ID
 * Format: transactionId-RANDOM (to enable lookup in callback)
 */
export function generateOrderID(transactionId: string): string {
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${transactionId}-${random}`;
}

/**
 * Extract form action URL from HTML
 */
function getFormActionUrl(html: string): string {
    // First try to get action from form tag
    const formMatch = html.match(/<form[^>]*action=["']?([^'">\s]*)["']?/i);
    let action = formMatch ? formMatch[1] : '';

    // If action is relative (like ./Default.aspx), look for JavaScript assignment
    if (action && (action.startsWith('./') || action.startsWith('Default.aspx'))) {
        const jsMatch = html.match(/frm\.action\s*=\s*['"]([^'"]+)['"]/i);
        if (jsMatch) {
            action = jsMatch[1];
        }
    }

    return action;
}

/**
 * Extract form parameters from HTML
 */
function getFormParams(html: string): { name: string; value: string }[] {
    const params: { name: string; value: string }[] = [];

    // More flexible regex to handle various input formats
    // Matches: <input ... name="X" ... value="Y" ... />
    const regex = /<input[^>]*name=["']([^"']+)["'][^>]*value=["']([^"']*)["'][^>]*\/?>/gi;
    let match;

    while ((match = regex.exec(html)) !== null) {
        params.push({ name: match[1], value: match[2] });
    }

    return params;
}

/**
 * Initiate 3D Secure payment and get form data
 */
export async function initiate3DPayment(
    orderId: string,
    amount: number,
    cardNumber: string,
    cardExpMonth: string,
    cardExpYear: string,
    cardCVV: string,
    successUrl: string,
    errorUrl: string,
    customerIp: string = '127.0.0.1',
    customerEmail: string = 'customer@example.com',
    useProduction = false
): Promise<Payment3DFormData> {
    // QNB uses Exponent=2 to calculate kuruş automatically
    // So we send amount in TL, not multiplied by 100
    const formattedAmount = amount.toString();

    // QNB specific parameters for 3D payment
    const params: { [key: string]: string } = {
        MbrId: '5',
        // Merchant credentials
        MerchantID: credentials.merchantCode,
        UserCode: credentials.merchantUser,
        UserPass: credentials.merchantUserPass,

        // Transaction details
        SecureType: '3DPay', // QNB 3D Secure type from credentials
        TxnType: 'Auth',
        InstallmentCount: '0',
        Currency: '949', // TRY
        OkUrl: successUrl,
        FailUrl: errorUrl,
        Rnd: Date.now().toString(),
        Lang: 'TR',

        // Order details
        OrderId: orderId,
        PurchAmount: formattedAmount,

        // Card details
        Pan: cardNumber,
        Expiry: cardExpMonth.padStart(2, '0') + cardExpYear,
        Cvv2: cardCVV,

        // Customer details
        BillToName: 'Customer',
        Email: customerEmail,
    };

    // Generate hash
    // Official QNB Hash Format (C#): SHA1Base64(MbrId + OrderId + PurchAmount + OkUrl + FailUrl + TxnType + InstallmentCount + Rnd + merchantStorekey)
    const hashStr = params.MbrId + params.OrderId + params.PurchAmount + params.OkUrl + params.FailUrl + params.TxnType + params.InstallmentCount + params.Rnd + credentials.merchantPass;

    params.Hash = getSHA1Base64(hashStr);

    const url = useProduction ? QNB_3D_PROD_URL : QNB_3D_TEST_URL;

    try {
        // Send request to QNB - similar to Garanti flow
        const formBody = new URLSearchParams(params).toString();

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            },
            body: formBody,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseText = await response.text();

        // Sanitize response
        const sanitizedResp = responseText.replace(/ value\s*=\s*"/g, ' value="');

        // Parse form from HTML response
        const inputs = getFormParams(sanitizedResp);
        const actionUrl = getFormActionUrl(sanitizedResp);

        if (!actionUrl) {
            console.error('Full QNB response:', responseText.substring(0, 1000));
            throw new Error('3D Secure form action URL not found in response');
        }

        return {
            action: actionUrl,
            method: 'POST',
            inputs: inputs,
        };
    } catch (error) {
        console.error('QNB 3D payment initiation error:', error);
        throw error;
    }
}
