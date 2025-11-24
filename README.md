# QNB Virtual POS Entegrasyonu

QNB Finansbank ile 3D Secure ve QR ödeme entegrasyonu içeren Next.js tabanlı sanal POS uygulaması.

## 📋 İçindekiler

- [Özellikler](#özellikler)
- [Kurulum](#kurulum)
- [Mimari Yapı](#mimari-yapı)
- [3D Secure Ödeme](#3d-secure-ödeme)
- [QR Ödeme](#qr-ödeme)
- [API Endpoints](#api-endpoints)
- [Güvenlik](#güvenlik)

## ✨ Özellikler

- ✅ **3D Secure Kredi Kartı Ödemeleri**: QNB Finansbank ile güvenli 3D ödeme işlemleri
- ✅ **QR Kod Ödemeleri**: Mobil bankacılık uygulamaları için QR kod ile ödeme
- ✅ **Hash Validasyonu**: Tüm işlemlerde SHA1 hash kontrolü
- ✅ **Test Ortamı Desteği**: QNB test URL'leri ile güvenli test imkanı
- ✅ **Responsive Tasarım**: Mobil ve masaüstü uyumlu arayüz
- ✅ **TypeScript**: Tip güvenli kod yapısı

## 🚀 Kurulum

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## 🏗️ Mimari Yapı

```
virtual-pos/
├── app/
│   ├── api/
│   │   └── payment/
│   │       ├── initiate/          # 3D ödeme başlatma
│   │       ├── callback/           # 3D ödeme callback
│   │       ├── qr-form/           # QR ödeme form oluşturma
│   │       └── qr-callback/       # QR ödeme callback
│   ├── components/
│   │   ├── PaymentForm.tsx        # Kredi kartı formu
│   │   └── QrPaymentForm.tsx      # QR ödeme formu
│   ├── payment/
│   │   ├── success/               # Başarılı ödeme sayfası
│   │   └── error/                 # Hatalı ödeme sayfası
│   └── page.tsx                   # Ana sayfa
├── lib/
│   ├── config.ts                  # QNB credentials ve URL'ler
│   ├── qnb-pos.ts                 # 3D ödeme servisleri
│   └── utils.ts                   # Yardımcı fonksiyonlar (hash)
```

## 💳 3D Secure Ödeme

### Akış Şeması

```
Kullanıcı → Form Doldurur → API (initiate) → QNB 3D Sayfası → 
OTP Girişi → QNB Callback → Success/Error Sayfası
```

### 1. Ödeme Formunu Doldurma

```tsx
// app/components/PaymentForm.tsx
const [cardNumber, setCardNumber] = useState('4508034508034509');
const [expiryMonth, setExpiryMonth] = useState('12');
const [expiryYear, setExpiryYear] = useState('25');
const [cvv, setCvv] = useState('000');
const [amount, setAmount] = useState('1.00');
```

### 2. Ödeme Başlatma (API)

```typescript
// app/api/payment/initiate/route.ts
import { initiate3DPayment, generateOrderID } from '@/lib/qnb-pos';

// Sipariş ID oluştur
const orderId = generateOrderID(Date.now().toString());

// QNB'ye 3D ödeme isteği gönder
const formData = await initiate3DPayment(
  orderId,
  amount,
  cardNumber,
  expiryMonth,
  expiryYear,
  cvv,
  successUrl,  // callback URL'i
  errorUrl,
  clientIp,
  'customer@example.com',
  false // test ortamı
);

// Form verisi frontend'e döner
return NextResponse.json(formData);
```

### 3. Hash Oluşturma

```typescript
// lib/qnb-pos.ts
import { getSHA1Base64 } from './utils';

// QNB Hash Formatı
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
```

### 4. QNB'ye Yönlendirme

```typescript
// Frontend - PaymentForm.tsx
const form = document.createElement('form');
form.method = data.method;
form.action = data.action; // QNB 3D URL

data.inputs.forEach((input) => {
  const hiddenField = document.createElement('input');
  hiddenField.type = 'hidden';
  hiddenField.name = input.name;
  hiddenField.value = input.value;
  form.appendChild(hiddenField);
});

document.body.appendChild(form);
form.submit(); // QNB 3D sayfasına yönlendir
```

### 5. Callback İşleme

```typescript
// app/api/payment/callback/route.ts
const orderId = formData.get('OrderId') as string;
const authCode = formData.get('AuthCode') as string;
const procReturnCode = formData.get('ProcReturnCode') as string;
const responseHash = formData.get('ResponseHash') as string;

// Hash doğrulama
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

  const expectedHash = getSHA1Base64(expectedHashStr);
  
  if (expectedHash !== responseHash) {
    return new Response('Invalid hash', { status: 400 });
  }
}

// Başarı kontrolü
const isSuccess = procReturnCode === '00';
```

## 📱 QR Ödeme

### Akış Şeması

```
Kullanıcı → Tutar Girer → API (qr-form) → QNB QR Sayfası → 
QR Kod Gösterimi → Mobil Uygulama ile Okutma → Callback → Success/Error
```

### 1. QR Form Parametreleri

```typescript
// app/api/payment/qr-form/route.ts
const QNB_QR_TEST_URL = 'https://vpostest.qnb.com.tr/Gateway/QR/QRHost.aspx';

const params = {
  MbrId: '5',
  MerchantID: credentials.merchantCode,
  UserCode: credentials.merchantUser,
  UserPass: credentials.merchantUserPass,
  SecureType: 'NonSecure', // QR için NonSecure
  TxnType: 'Auth',
  InstallmentCount: '0',
  Currency: '949', // TRY
  OkUrl: successUrl,
  FailUrl: errorUrl,
  OrderId: orderId,
  PurchAmount: formattedAmount,
  // Kart bilgileri boş
  CardHolderName: '',
  Pan: '',
  Expiry: '',
  Cvv2: '',
  MOTO: ''
};
```

### 2. QR Hash Oluşturma

```typescript
// QR ödeme için hash formatı
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
```

### 3. QR Form Submit

```typescript
// app/components/QrPaymentForm.tsx
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  
  // QR form verilerini al
  const response = await fetch('/api/payment/qr-form', {
    method: 'POST',
    body: JSON.stringify({ amount: parseFloat(amount) })
  });
  
  const data = await response.json();
  
  // Dinamik form oluştur ve QNB'ye gönder
  const form = document.createElement('form');
  form.method = data.method;
  form.action = data.action; // QNB QR URL
  
  data.inputs.forEach((input) => {
    const hiddenField = document.createElement('input');
    hiddenField.type = 'hidden';
    hiddenField.name = input.name;
    hiddenField.value = input.value;
    form.appendChild(hiddenField);
  });
  
  document.body.appendChild(form);
  form.submit();
};
```

### 4. QR Callback

```typescript
// app/api/payment/qr-callback/route.ts
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  
  const orderId = formData.get('OrderId') as string;
  const procReturnCode = formData.get('ProcReturnCode') as string;
  
  // Hash validasyonu
  const isValid = validateQrCallbackHash(
    orderId,
    authCode || '',
    procReturnCode,
    tdStatus || '',
    responseRnd,
    responseHash
  );
  
  // Başarı kontrolü
  const isSuccess = procReturnCode === '00';
  
  if (isSuccess) {
    return NextResponse.redirect(new URL('/payment/success', request.url));
  } else {
    return NextResponse.redirect(new URL('/payment/error', request.url));
  }
}
```

## 🔌 API Endpoints

### 3D Secure Endpoints

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/api/payment/initiate` | POST | 3D ödeme başlatır, form verisi döner |
| `/api/payment/callback` | POST | QNB'den gelen 3D callback'i işler |

**3D Initiate Request:**
```json
{
  "cardNumber": "4508034508034509",
  "cardHolder": "TEST USER",
  "expiryMonth": "12",
  "expiryYear": "25",
  "cvv": "000",
  "amount": 1.00
}
```

**3D Initiate Response:**
```json
{
  "action": "https://vpostest.qnb.com.tr/Gateway/Default.aspx",
  "method": "POST",
  "inputs": [
    { "name": "MbrId", "value": "5" },
    { "name": "MerchantID", "value": "085300000009597" },
    { "name": "Hash", "value": "..." },
    ...
  ]
}
```

### QR Ödeme Endpoints

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/api/payment/qr-form` | POST | QR ödeme form verisi oluşturur |
| `/api/payment/qr-callback` | POST | QNB'den gelen QR callback'i işler |

**QR Form Request:**
```json
{
  "amount": 1.00
}
```

**QR Form Response:**
```json
{
  "action": "https://vpostest.qnb.com.tr/Gateway/QR/QRHost.aspx",
  "method": "POST",
  "inputs": [
    { "name": "MbrId", "value": "5" },
    { "name": "SecureType", "value": "NonSecure" },
    { "name": "Hash", "value": "..." },
    ...
  ]
}
```

## 🔐 Güvenlik

### Hash Validasyonu

Tüm QNB isteklerinde SHA1 hash kullanılır:

```typescript
// lib/utils.ts
import crypto from 'crypto';

export function getSHA1Base64(input: string): string {
  return crypto.createHash('sha1')
    .update(input, 'utf8')
    .digest('base64');
}
```

### Credential Yönetimi

```typescript
// lib/config.ts
export const credentials = {
  merchantCode: '085300000009597',
  merchantTerminalNo: 'VS251922',
  merchantName: '3D TEST UYE ISYERI',
  merchantPass: '12345678',
  merchantUser: 'QNB_ISYERI_KULLANICI',
  merchantUserPass: '9ZPar',
  apiUser: 'QNB_API_KULLANICI',
  apiPass: 'FwCX2',
};
```

⚠️ **Önemli:** Production'da bu bilgiler environment variables'da saklanmalı!

### Test ve Production URL'leri

```typescript
// lib/config.ts

// 3D Secure URLs
export const QNB_3D_TEST_URL = 'https://vpostest.qnb.com.tr/Gateway/Default.aspx';
export const QNB_3D_PROD_URL = 'https://vpos.qnb.com.tr/Gateway/Default.aspx';

// QR Payment URLs (qr-form/route.ts içinde)
const QNB_QR_TEST_URL = 'https://vpostest.qnb.com.tr/Gateway/QR/QRHost.aspx';
const QNB_QR_PROD_URL = 'https://vpos.qnb.com.tr/Gateway/QR/QRHost.aspx';
```

## 🧪 Test Kartları

QNB test ortamı için kullanılabilir kart bilgileri:

- **Kart Numarası:** 4508034508034509
- **Son Kullanma Tarihi:** Gelecek herhangi bir tarih (örn: 12/25)
- **CVV:** 000
- **Kart Sahibi:** TEST USER

## 📝 Callback Response Kodları

### Başarılı İşlem
- `ProcReturnCode`: `00` - İşlem başarılı
- `AuthCode`: Yetki kodu (örn: S12345)

### Hata Kodları
- `M041`: Geçersiz kart numarası
- `V074`: QR işlem hatası
- Diğer kodlar için QNB dokümantasyonuna bakınız

## 🎨 UI Bileşenleri

### Ana Sayfa Yapısı

```tsx
// app/page.tsx
export default function Home() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 3D Secure Ödeme */}
      <PaymentForm />
      
      {/* QR Ödeme */}
      <QrPaymentForm />
    </div>
  );
}
```

### Başarı Sayfası

```tsx
// app/payment/success/page.tsx
const orderId = searchParams.get('orderId');
const authCode = searchParams.get('authCode');

// Başarılı ödeme detayları gösterilir
```

### Hata Sayfası

```tsx
// app/payment/error/page.tsx
const error = searchParams.get('error');
const code = searchParams.get('code');

// Hata mesajı ve kodu gösterilir
```

## 🛠️ Geliştirme

### Environment Variables (Önerilen)

Production için `.env.local` dosyası oluşturun:

```env
QNB_MERCHANT_CODE=your_merchant_code
QNB_MERCHANT_PASS=your_merchant_pass
QNB_USER_CODE=your_user_code
QNB_USER_PASS=your_user_pass
QNB_USE_PRODUCTION=false
```

### TypeScript Tipleri

```typescript
// lib/qnb-pos.ts
export interface Payment3DFormData {
  action: string;
  method: string;
  inputs: { name: string; value: string }[];
}

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
```

## 📚 Kaynaklar

- [QNB Finansbank Virtual POS Dokümantasyonu](https://www.qnbfinansbank.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 📄 Lisans

Bu proje eğitim amaçlıdır. Production kullanımı için QNB ile sözleşme yapılması gerekmektedir.

---

**Not:** Bu uygulama QNB Finansbank test ortamı için yapılandırılmıştır. Production ortamında kullanmak için credentials ve URL'lerin güncellenmesi gerekmektedir.
