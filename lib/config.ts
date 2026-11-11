export interface QnbPosCredentials {
    merchantCode: string;
    merchantTerminalNo: string;
    merchantName: string;
    merchantPass: string;
    merchantUser: string;
    merchantUserPass: string;
    apiUser: string;
    apiPass: string;
}

export const credentials: QnbPosCredentials = {
    merchantCode: '085300000009704',
    merchantTerminalNo: 'VS251939',
    merchantName: '3D PAY TEST ISYERI',
    merchantPass: '12345678',
    merchantUser: 'QNB_ISYERI_KULLANICI_3DPAY',
    merchantUserPass: 'a1234',
    apiUser: 'QNB_API_KULLANICI_3DPAY',
    apiPass: 'UcBN0',
}

export const QNB_3D_TEST_URL = 'https://vpostest.qnb.com.tr/Gateway/Default.aspx';
export const QNB_3D_PROD_URL = 'https://vpos.qnb.com.tr/Gateway/Default.aspx';
