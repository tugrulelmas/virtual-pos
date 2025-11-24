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
    merchantCode: '085300000009597',
    merchantTerminalNo: 'VS251922',
    merchantName: '3D TEST UYE ISYERI',
    merchantPass: '12345678',
    merchantUser: 'QNB_ISYERI_KULLANICI',
    merchantUserPass: '9ZPar',
    apiUser: 'QNB_API_KULLANICI',
    apiPass: 'FwCX2',
}

export const QNB_3D_TEST_URL = 'https://vpostest.qnb.com.tr/Gateway/Default.aspx';
export const QNB_3D_PROD_URL = 'https://vpos.qnb.com.tr/Gateway/Default.aspx';