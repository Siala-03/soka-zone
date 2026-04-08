import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader, RefreshCw, AlertCircle } from 'lucide-react';
import { getPesaPalPaymentStatus, PesaPalTransactionStatus } from '../utils/pesapal';

interface PaymentVerificationProps {
  orderTrackingId: string;
  merchantReference: string;
  amount: number;
  bookingData: {
    date: string;
    time: string;
    duration: number;
    pitch: string;
    name: string;
    phone: string;
    email: string;
  };
  onSuccess: (status: PesaPalTransactionStatus) => void;
  onRetry: () => void;
}

export function PaymentVerification({
  orderTrackingId,
  merchantReference,
  amount,
  bookingData,
  onSuccess,
  onRetry
}: PaymentVerificationProps) {
  const [status, setStatus] = useState<PesaPalTransactionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoChecking, setAutoChecking] = useState(true);

  // Auto-check payment status every 10 seconds for 2 minutes
  useEffect(() => {
    if (!autoChecking || status?.order_status === 'COMPLETED') return;

    const checkStatus = async () => {
      try {
        const paymentStatus = await getPesaPalPaymentStatus(orderTrackingId);
        setStatus(paymentStatus);

        if (paymentStatus.order_status === 'COMPLETED') {
          setAutoChecking(false);
          onSuccess(paymentStatus);
        } else if (paymentStatus.order_status === 'FAILED') {
          setAutoChecking(false);
          setError('Payment failed. Please try again.');
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
        // Don't show error for auto-checks, only manual checks
      }
    };

    // Initial check
    checkStatus();

    // Set up interval for auto-checking (every 10 seconds for 2 minutes)
    const interval = setInterval(checkStatus, 10000);
    const timeout = setTimeout(() => {
      setAutoChecking(false);
    }, 120000); // 2 minutes

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [orderTrackingId, autoChecking, status?.order_status, onSuccess]);

  const handleManualCheck = async () => {
    setLoading(true);
    setError(null);

    try {
      const paymentStatus = await getPesaPalPaymentStatus(orderTrackingId);
      setStatus(paymentStatus);

      if (paymentStatus.order_status === 'COMPLETED') {
        onSuccess(paymentStatus);
      } else if (paymentStatus.order_status === 'FAILED') {
        setError('Payment failed. Please try again.');
      } else {
        setError('Payment is still processing. Please wait or try again.');
      }
    } catch (err) {
      setError('Failed to check payment status. Please try again.');
      console.error('Error checking payment status:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!status) return <Loader className="w-8 h-8 animate-spin text-blue-600" />;

    switch (status.order_status) {
      case 'COMPLETED':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'FAILED':
        return <XCircle className="w-8 h-8 text-red-600" />;
      default:
        return <AlertCircle className="w-8 h-8 text-yellow-600" />;
    }
  };

  const getStatusMessage = () => {
    if (!status) return 'Checking payment status...';

    switch (status.order_status) {
      case 'COMPLETED':
        return 'Payment completed successfully!';
      case 'FAILED':
        return 'Payment failed';
      case 'PENDING':
        return 'Payment is being processed...';
      default:
        return 'Payment status unknown';
    }
  };

  const getStatusColor = () => {
    if (!status) return 'text-blue-600';

    switch (status.order_status) {
      case 'COMPLETED':
        return 'text-green-600';
      case 'FAILED':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          {getStatusIcon()}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification</h2>
        <p className={`text-lg font-semibold ${getStatusColor()}`}>
          {getStatusMessage()}
        </p>
        {autoChecking && status?.order_status !== 'COMPLETED' && (
          <p className="text-sm text-gray-600 mt-2">
            Automatically checking payment status every 10 seconds...
          </p>
        )}
      </div>

      {/* Payment Details */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4">Payment Details</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Reference:</span>
            <span className="font-mono text-sm">{merchantReference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tracking ID:</span>
            <span className="font-mono text-sm">{orderTrackingId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-bold text-green-600">RWF {amount.toLocaleString()}</span>
          </div>
          {status?.payment_method && (
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-semibold">{status.payment_method}</span>
            </div>
          )}
        </div>
      </div>

      {/* Booking Summary */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4">Booking Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Pitch:</span>
            <span className="font-semibold">{bookingData.pitch}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date & Time:</span>
            <span className="font-semibold">{bookingData.date} at {bookingData.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Duration:</span>
            <span className="font-semibold">{bookingData.duration} hours</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Customer:</span>
            <span className="font-semibold">{bookingData.name}</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900 text-sm">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleManualCheck}
          disabled={loading || status?.order_status === 'COMPLETED'}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <RefreshCw className="w-5 h-5" />
          )}
          {loading ? 'Checking...' : 'Check Status'}
        </button>

        {status?.order_status === 'FAILED' && (
          <button
            onClick={onRetry}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-800 text-sm text-center">
          If you've completed payment on PesaPal, click "Check Status" to verify.
          You can also wait for automatic verification.
        </p>
      </div>
    </div>
  );
}