# MTN MOMO Rwanda Payment Integration with PesaPal

## 📱 Overview

MTN MOMO is the most popular digital payment method in Rwanda. This guide explains how to integrate it with PesaPal for the SkoZone pitch booking system.

## 🔑 How It Works

### Payment Flow
1. **User selects MTN MoMo** at payment checkout
2. **Phone number validated** for Rwanda carrier (auto-detects MTN/Airtel)
3. **Payment request sent to PesaPal** with payment method `MOMO_INT`
4. **User redirected to PesaPal** payment page
5. **MTN MOMO prompt appears** on user's phone
6. **User confirms payment** on their phone via USSD or app
7. **Payment status updated** via webhook notification

## 🛠️ Current Implementation

Your system now includes:

### 1. **Payment Method Types** (`src/utils/pesapal.ts`)
```typescript
RWANDA_PAYMENT_METHODS = {
  MTN_MOMO: { code: 'MOMO_INT', label: 'MTN MoMo' },
  AIRTEL_MONEY: { code: 'AIRTEL', label: 'Airtel Money' },
  BANK_TRANSFER: { code: 'DIRECT_BANK_TRANSFER' },
  CARD: { code: 'CARD' }
}
```

### 2. **Phone Number Validation**
- **Validates Rwanda phone numbers** (+250 format)
- **Auto-detects carrier** (MTN, Airtel, Vodacom)
- **Formats for E.164 standard** (required by PesaPal)

### 3. **Smart Network Detection**
```
MTN prefixes: 78, 79
Airtel prefixes: 72, 73
Vodacom prefixes: 85
```

## 📋 Setup Steps

### Step 1: Get PesaPal Sandbox Credentials

1. Visit [PesaPal Developer Portal](https://www.pesapal.com/developers)
2. Create merchant account
3. Navigate to **Settings → API Credentials**
4. Copy **Consumer Key** and **Consumer Secret**
5. Update your deployment environment:
```env
PESAPAL_ENV=sandbox
PESAPAL_CONSUMER_KEY=your_key
PESAPAL_CONSUMER_SECRET=your_secret
PUBLIC_SITE_URL=https://yourdomain.com
VITE_PESAPAL_ENV=sandbox
```

### Step 2: Register IPN Webhook URL

1. Go to **Settings → Register IPN URL**
2. Add URL: `https://yourdomain.com/api/pesapal/notify`
3. For local testing with ngrok:
   ```bash
   ngrok http 5173
   ```
   Then use: `https://your-ngrok-url.ngrok.io/api/pesapal/notify`

### Step 3: Register Callback URLs

1. Go to **Settings → API Credentials**
2. Set **Return URL**: `https://yourdomain.com/payment/success`
3. Set **Notification URL**: `https://yourdomain.com/api/pesapal/notify`
4. Mirror those values in `PESAPAL_CALLBACK_URL` and `PESAPAL_NOTIFICATION_URL`

## 🧪 Testing MTN MOMO

### Sandbox Test Numbers

**MTN MOMO Test Numbers:**
- `+250788123456` - Add to system as test account
- `+250779654321` - Alternative test number

**Important:** Sandbox mode automatically handles these numbers. Actual transactions won't occur.

### Test Flow

1. Start development server:
```bash
npm run dev
```

2. Navigate to booking page
3. Enter test MTN number (e.g., `0788123456`)
4. Verify **"Optimized for your number"** message appears
5. Select **MTN MoMo** payment method
6. Accept terms and click **Complete Payment**
7. You'll be redirected to PesaPal sandbox
8. Complete test payment

## 🔍 Key Features Implemented

### ✅ Phone Validation
```typescript
// Auto-validates Rwanda phone numbers
const validation = validateRwandaPhoneNumber('+250788123456');
// Returns: { valid: true, formatted: '+250788123456', network: 'MTN' }
```

### ✅ Payment Method Routing
```typescript
const paymentRequest = {
  // ... other fields
  paymentMethod: 'MOMO_INT', // Routes to MTN MOMO on PesaPal
};
```

### ✅ Network Detection UI
- Shows **"Popular"** badge on MTN
- Shows **"Optimized for your number"** when carrier matches
- Warns if phone doesn't match selected method

### ✅ Secure Formatting
- Handles all Rwanda phone formats:
  - `0788123456` → `+250788123456`
  - `788123456` → `+250788123456`
  - `250788123456` → `+250788123456`
  - `+250788123456` → `+250788123456`

## 📨 Webhook Notifications

When a payment completes, PesaPal sends a POST request to your webhook:

```javascript
// Notification received at: /api/pesapal/notify

{
  pesapal_merchant_reference: 'SKZONE-123-ABC',
  pesapal_transaction_tracking_id: '12345',
  pesapal_transaction_status: 'COMPLETED',
  pesapal_signature: 'base64_signature'
}
```

Your API handler (`api/pesapal/notify.ts`):
- ✅ Verifies signature
- ✅ Processes payment status
- ✅ Updates booking status

## 🚀 Going Live to Production

### Step 1: Get Live Credentials
1. Contact PesaPal support to activate live credentials
2. Update your production environment variables:
```env
PESAPAL_ENV=production
PESAPAL_CONSUMER_KEY=your_live_key
PESAPAL_CONSUMER_SECRET=your_live_secret
PUBLIC_SITE_URL=https://yourdomain.com
PESAPAL_CALLBACK_URL=https://yourdomain.com/payment/callback
PESAPAL_NOTIFICATION_URL=https://yourdomain.com/api/pesapal/notify
VITE_PESAPAL_ENV=production
```

### Step 2: Update Callback URLs
1. Update in PesaPal Dashboard to production domain
2. Ensure webhook endpoint is publicly accessible
3. Test end-to-end with small amount
4. Do not expose live PesaPal keys through `VITE_` variables; the app now sends payment requests through server-side `/api/pesapal/*` routes.

### Step 3: Update Currency & Limits
```typescript
// Verify currency settings
currency: 'RWF'  // Rwandan Franc
amount: 5000     // Minimum suggested amount
```

## 🐛 Troubleshooting

### Issue: "Invalid phone number format"
**Solution:** Ensure entered number starts with:
- `0` (local format) - will be converted
- `250` or `+250` (international format)
- Valid Rwanda number (length 10 digits after country code)

### Issue: "Network detection showing wrong carrier"
**Solution:** Double-check phone number prefix:
- MTN: 078, 079
- Airtel: 072, 073
- Vodacom: 085

### Issue: "Payment initiation failed"
**Possible causes:**
- Invalid credentials in `.env`
- PesaPal sandbox account not activated
- Invalid callback URLs registered
- Phone number not in E.164 format

**Solution:**
1. Verify `.env` values
2. Check network requests in browser DevTools
3. Review PesaPal API response errors

### Issue: "Webhook not receiving notifications"
**Solution:**
1. Ensure ngrok is running (for local testing)
2. Verify callback URL in PesaPal dashboard
3. Check network logs for POST requests
4. Verify signature validation in `api/pesapal/notify.ts`

## 📊 Testing All Payment Methods

Update `src/components/PesaPalPayment.tsx` to test different methods:

```typescript
// Available payment methods
const paymentMethods = {
  'mtn': 'MOMO_INT',        // MTN MOMO
  'airtel': 'AIRTEL',       // Airtel Money
  'card': 'CARD',           // Credit/Debit Card
  'bank': 'DIRECT_BANK_TRANSFER'  // Bank Transfer
};
```

## 📚 API Documentation

### Payment Initiation
- [Submit Order Request](https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/submitorderrequest)
- Endpoints: `/api/merchants/submit`
- Method: POST
- Required: `payment_method` parameter for method-specific routing

### Status Checking
- [Get Transaction Status](https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/gettransactionstatus)
- Endpoints: `/api/merchants/transaction/status`
- Method: GET

### Webhook Registration
- [Register IPN URL](https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/registeripnurl)
- Dashboard: Settings → Register IPN URL

## ✅ Verification Checklist

- [ ] PesaPal sandbox credentials obtained
- [ ] `.env` file updated with credentials
- [ ] Phone validation working (tested with various formats)
- [ ] MTN carrier auto-detection working
- [ ] Payment method selection working
- [ ] UI shows "Optimized for your number"
- [ ] Can initiate sandbox payments
- [ ] Payment flow completes successfully
- [ ] Webhook URL registered in dashboard
- [ ] Notifications being received (check logs)

## 🔗 Useful Links

- [PesaPal Developer Portal](https://www.pesapal.com/developers)
- [Rwanda Phone Number Format Guide](https://en.wikipedia.org/wiki/Telephone_numbers_in_Rwanda)
- [MTN Rwanda MOMO Info](https://mtn.rw)
- [Airtel Rwanda Money Info](https://airtel.rw)

---

**For additional help**, check the `LOCALHOST_TESTING.md` and `SANDBOX_TESTS_README.md` files.