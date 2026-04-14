# PesaPal Integration Setup Guide

## Overview
This guide walks you through setting up PesaPal payment integration for the SkoZone pitch booking system.

## Components Created

### 1. **Utilities** (`src/utils/`)
- **`pesapal.ts`** - Core PesaPal API integration with functions for:
  - Token authentication
  - Payment initiation
  - Payment status checking
  - Callback validation
  - Phone number formatting

- **`pricing.ts`** - Pitch pricing configuration for different pitch types
- **`types.ts`** - TypeScript types for payment-related data

### 2. **Components** (`src/components/`)
- **`PesaPalPayment.tsx`** - Payment form component with:
  - Payment method selection (M-Pesa, Card, Bank)
  - Payment summary display
  - Security information
  - Terms & conditions acceptance
  - Integration with PesaPal API

- **`PaymentConfirmation.tsx`** - Payment status confirmation component with:
  - Real-time payment status checking
  - Success/failure/pending states
  - Transaction details display
  - Print receipt and share functionality

### 3. **Pages** (`src/pages/`)
- **`BookPage.tsx`** - Updated with multi-step booking flow:
  - Step 1: Calendar & time selection
  - Step 2: User details form
  - Step 3: Payment processing
  - Step 4: Confirmation

## Setup Instructions

### Step 1: Install Dependencies
```bash
npm install
```

Added dependency:
- `axios` - For HTTP requests to PesaPal API

### Step 2: Create Environment Variables
Create a `.env` file in the root directory for local testing:

```env
# Client-side configuration
VITE_PESAPAL_ENV=sandbox
VITE_API_URL=http://localhost:3000

# Server-side PesaPal configuration
PESAPAL_ENV=sandbox
PESAPAL_CONSUMER_KEY=your_consumer_key_here
PESAPAL_CONSUMER_SECRET=your_consumer_secret_here
PUBLIC_SITE_URL=http://localhost:5173
PESAPAL_CALLBACK_URL=http://localhost:5173/payment/callback
PESAPAL_NOTIFICATION_URL=http://localhost:3000/api/pesapal/notify
PESAPAL_NOTIFICATION_ID=your_registered_ipn_id_here
```

### Step 3: Get PesaPal Credentials
1. Visit [PesaPal Developer Dashboard](https://www.pesapal.com/developers)
2. Create a merchant account or sign in
3. Navigate to Settings → API Credentials
4. Copy your Consumer Key and Consumer Secret
5. Add them to the server-side `PESAPAL_*` variables in your `.env` file

### Step 4: Configure Callback URLs
In your PesaPal Dashboard:
1. Go to the IPN or notification URL registration screen
2. Register your notification URL:
  - **Notification URL**: `https://yourdomain.com/api/pesapal/notify`
3. Copy the generated `notification_id`
4. Save that value as `PESAPAL_NOTIFICATION_ID` in your environment

Your app return URL is not added on that screen. It is sent by the application as `callback_url` on each submit-order request.

For local development, you can use ngrok to expose your local server:
```bash
ngrok http 5173
```

Then use the ngrok URL in your PesaPal dashboard.

### Step 5: Testing (Sandbox Mode)
PesaPal provides test credentials in sandbox mode. Use these to test:

**Test M-Pesa Numbers:**
- `254722110011` - Successful payment
- `254722220022` - Timeout
- `254722330033` - Failed payment

**Test Card Numbers:**
- `4111111111111111` - Visa (Successful)
- `5555555555554444` - Mastercard (Successful)
- `6011111111111117` - Discover (Successful)

Use any future date for expiry and any 3-digit CVC.

## Payment Flow

```
1. User selects date/time/pitch → BookPage (calendar view)
2. User enters details → BookPage (details form)
3. System calculates total amount
4. User reviews and initiates payment → PesaPalPayment component
5. PesaPal redirects to payment gateway
6. After payment, PesaPal redirects back with tracking ID
7. System verifies payment status → PaymentConfirmation component
8. Booking is confirmed and saved to Firebase
```

## Pricing Configuration

Edit `src/utils/pricing.ts` to update prices:

```typescript
export const PITCH_PRICING = {
  Standard: {
    base: 35000, // Price per hour in RWF (70,000 RWF for 2 hours)
    description: '5-a-side pitch',
  },
  Premium: {
    base: 3000,
    description: 'Full-size pitch',
  },
  Championship: {
    base: 4000,
    description: 'Professional-grade pitch',
  },
};
```

## Security Considerations

### Frontend (Current Implementation)
- ✅ Payment information never stored locally
- ✅ Tokens generated server-side (in production)
- ✅ HTTPS required for PesaPal redirect
- ✅ User sees only merchant reference, not sensitive data

### Backend (Recommended for Production)
Before going to production, implement:

1. **Database Storage** - Store bookings and payment status in production database
2. **Webhook Handling** - Extend the notify handler to update Firestore directly if needed
3. **Error Logging** - Log all payment transactions for audits
4. **Operational Alerts** - Add alerts or monitoring on failed webhook deliveries

## Usage Example

### Initiating a Payment
```javascript
import { initiatePesaPalPayment, generateMerchantReference } from './utils/pesapal';

const merchantRef = generateMerchantReference();
const response = await initiatePesaPalPayment({
  id: 'booking-123',
  reference: merchantRef,
  amount: 4000,
  description: 'Pitch Booking',
  currency: 'RWF',
  email: 'user@example.com',
  phone: '+254722110011',
  first_name: 'John',
  last_name: 'Doe',
});

if (!response.error) {
  window.location.href = response.data?.redirect_url;
}
```

### Checking Payment Status
```javascript
import { getPesaPalPaymentStatus } from './utils/pesapal';

const status = await getPesaPalPaymentStatus('order_tracking_id');
console.log(status.order_status); // 'COMPLETED', 'FAILED', or 'PENDING'
```

## Troubleshooting

### "Failed to authenticate with PesaPal"
- Check your Consumer Key and Consumer Secret
- Ensure they match your PesaPal dashboard credentials
- Verify environment variables are loaded

### "Payment initiation failed"
- Check internet connection
- Verify PesaPal API is not down
- Check if all required fields are provided

### "Order not found" 
- Payment may still be processing (wait 30 seconds)
- Order tracking ID may be invalid
- PesaPal transaction not found

### Local Testing Issues
- Use ngrok to expose your local server
- Update callback URLs in PesaPal dashboard
- Check browser console for errors

## Deployment

### Vercel
1. Add these environment variables in the Vercel project settings:
  - `VITE_PESAPAL_ENV=production`
  - `PESAPAL_ENV=production`
  - `PESAPAL_CONSUMER_KEY`
  - `PESAPAL_CONSUMER_SECRET`
  - `PUBLIC_SITE_URL=https://sokazone.rw`
  - `PESAPAL_CALLBACK_URL=https://sokazone.rw/payment/callback`
  - `PESAPAL_NOTIFICATION_URL=https://sokazone.rw/api/pesapal/notify`
  - `VITE_FIREBASE_*` values
2. Leave `VITE_API_URL` empty unless the API runs on a separate domain.
3. Update PesaPal callback URLs to your production domain:
  - `https://sokazone.rw/payment/callback`
  - `https://sokazone.rw/api/pesapal/notify`
4. Deploy and validate `GET https://sokazone.rw/api/pesapal/notify` returns the health string.
5. Use Vercel function logs to confirm that `/api/pesapal/submit`, `/api/pesapal/status`, and `/api/pesapal/notify` are executing correctly.

### Vercel serverless function
- File added: `api/pesapal/notify.ts`
- It validates incoming webhook signature with `PESAPAL_CONSUMER_SECRET`
- Logs the transaction status and returns `200`
- In production, extend to save to Firestore or your own database by reference ID

### Docker
```dockerfile
ENV PESAPAL_CONSUMER_KEY=your_key
ENV PESAPAL_CONSUMER_SECRET=your_secret
ENV VITE_PESAPAL_ENV=production
ENV PESAPAL_ENV=production
```

## Next Steps

1. Get PesaPal credentials from their dashboard
2. Add them to server-side env variables
3. Configure callback URLs in PesaPal and Vercel
4. Test with sandbox credentials locally
5. Deploy to Vercel production
6. Run a live low-value MTN MoMo payment test

## Support

For PesaPal API documentation: https://developer.pesapal.com

## File Structure
```
src/
├── components/
│   ├── PesaPalPayment.tsx
│   └── PaymentConfirmation.tsx
├── pages/
│   └── BookPage.tsx (updated)
└── utils/
    ├── pesapal.ts
    ├── pricing.ts
    └── types.ts
```
