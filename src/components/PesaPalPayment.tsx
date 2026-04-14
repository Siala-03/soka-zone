import { ArrowLeft } from 'lucide-react';

const PESAPAL_PAYMENT_LINK = 'https://store.pesapal.com/sokazonepayment';

interface PesaPalPaymentProps {
  onBack: () => void;
}

export function PesaPalPayment({ onBack }: PesaPalPaymentProps) {
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center text-green-600 hover:text-green-700 font-semibold"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to details
      </button>

      <a
        href={PESAPAL_PAYMENT_LINK}
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-full items-center justify-center rounded-3xl bg-green-600 px-6 py-4 text-white font-semibold shadow-lg transition hover:bg-green-700"
      >
        Pay with PesaPal
      </a>
    </div>
  );
}
