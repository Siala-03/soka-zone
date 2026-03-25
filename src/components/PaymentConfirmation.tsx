import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader, Download, Share2 } from 'lucide-react';
import { getPesaPalPaymentStatus } from '../utils/pesapal';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

interface PaymentConfirmationProps {
  trackingId: string;
  merchantReference: string;
  amount: number;
  bookingData?: {
    date: string;
    time: string;
    duration: number;
    pitch: string;
    name: string;
    phone: string;
    email: string;
  };
  onNewBooking?: () => void;
}

export function PaymentConfirmation({ trackingId, merchantReference, amount, bookingData, onNewBooking }: PaymentConfirmationProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookingSaved, setBookingSaved] = useState(false);

  // Save booking to Firebase
  const saveBooking = async (bookingData: any) => {
    try {
      await addDoc(collection(db, 'bookings'), {
        ...bookingData,
        status: 'confirmed',
        paymentRef: merchantReference,
        pesapalTrackingId: trackingId,
        amount: amount,
        currency: 'RWF',
        paymentStatus: 'completed',
        createdAt: new Date(),
      });
      setBookingSaved(true);
      console.log('Booking saved successfully');
    } catch (error) {
      console.error('Error saving booking:', error);
      // Don't fail the payment confirmation if booking save fails
    }
  };

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const details = await getPesaPalPaymentStatus(trackingId);
        setTransactionDetails(details);

        if (details.order_status === 'COMPLETED') {
          setStatus('success');
          // Save booking if payment is successful and we have booking data
          if (bookingData && !bookingSaved) {
            saveBooking(bookingData);
          }
        } else if (details.order_status === 'FAILED') {
          setStatus('failed');
          setError(details.status_description || 'Payment failed');
        } else {
          setStatus('pending');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to check payment status';
        setError(errorMessage);
        setStatus('failed');
      }
    };

    checkPaymentStatus();
    
    // Poll for status updates every 3 seconds for 2 minutes
    const interval = setInterval(checkPaymentStatus, 3000);
    const timeout = setTimeout(() => clearInterval(interval), 120000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [trackingId]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="w-12 h-12 text-green-600 animate-spin mb-4" />
        <p className="text-gray-600 font-semibold">Verifying your payment...</p>
        <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse"></div>
            <div className="relative flex items-center justify-center w-16 h-16">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 text-lg">Your booking has been confirmed</p>
        </div>

        {/* Booking Details */}
        <div className="bg-green-50 rounded-xl p-6 border border-green-200 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
            <p className="font-bold text-gray-900 text-lg">{merchantReference}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
            <p className="font-mono text-gray-900 text-sm break-all">{trackingId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
            <p className="font-bold text-green-600 text-2xl">RWF {amount.toLocaleString()}</p>
          </div>
          {transactionDetails?.payment_date && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Payment Date</p>
              <p className="text-gray-900">{new Date(transactionDetails.payment_date).toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* What's Next */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="font-bold text-gray-900 mb-3">What's Next?</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
              <span className="text-gray-700">Check your email for a confirmation message with booking details</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
              <span className="text-gray-700">Save your booking reference for check-in</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
              <span className="text-gray-700">Arrive 15 minutes early on your scheduled date</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Print Receipt
          </button>
          <button
            onClick={() => {
              // Share booking reference
              if (navigator.share) {
                navigator.share({
                  title: 'Booking Confirmation',
                  text: `My booking reference: ${merchantReference}`,
                });
              }
            }}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </div>

        {/* New Booking Button */}
        {onNewBooking && (
          <button
            onClick={onNewBooking}
            className="w-full bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 font-bold py-3 px-6 rounded-lg transition-all duration-300"
          >
            Make Another Booking
          </button>
        )}
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <AlertCircle className="w-16 h-16 text-red-600" />
        </div>

        {/* Error Message */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h2>
          <p className="text-gray-600">{error || 'Your payment could not be processed'}</p>
        </div>

        {/* Error Details */}
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <h3 className="font-bold text-gray-900 mb-2">Error Details</h3>
          <p className="text-red-700 text-sm mb-4">
            {error || 'Please check your payment details and try again'}
          </p>
          <div className="text-sm text-gray-600">
            <p>Reference: {merchantReference}</p>
            <p className="font-mono text-xs mt-2 break-all">ID: {trackingId}</p>
          </div>
        </div>

        {/* Retry Instructions */}
        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <h3 className="font-bold text-gray-900 mb-2">What to do next?</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Check that your phone number or card details are correct</li>
            <li>• Ensure you have sufficient funds in your M-Pesa or bank account</li>
            <li>• Try the payment again</li>
            <li>• Contact support if the problem persists</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/contact'}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
          >
            Contact Support
          </button>
        </div>
      </div>
    );
  }

  // Pending status
  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Loader className="w-12 h-12 text-yellow-600 animate-spin" />
      </div>
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Pending</h2>
        <p className="text-gray-600">Your payment is being processed. Please wait...</p>
      </div>
      <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
        <p className="text-yellow-800 text-sm">
          This page will update automatically as soon as we confirm your payment. Do not refresh or close this page.
        </p>
        <p className="text-yellow-700 text-sm mt-3">
          Reference: <strong>{merchantReference}</strong>
        </p>
      </div>
    </div>
  );
}
