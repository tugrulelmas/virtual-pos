import PaymentForm from './components/PaymentForm';
import QrPaymentForm from './components/QrPaymentForm';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            QNB Virtual POS
          </h1>
          <p className="text-gray-600">
            Güvenli 3D Secure Ödeme ve QR Ödeme Sistemi
          </p>
        </div>

        {/* Payment Forms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card Payment */}
          <PaymentForm />

          {/* QR Payment */}
          <QrPaymentForm />
        </div>
      </div>
    </div>
  );
}
