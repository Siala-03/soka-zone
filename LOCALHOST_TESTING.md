# Localhost Testing Guide for PesaPal Integration

## 🚀 Quick Start for Localhost Testing

### Step 1: Environment Setup
✅ **Already done**: Switched to sandbox mode in `.env`

### Step 2: Get Sandbox Credentials
1. Visit [PesaPal Developer Dashboard](https://www.pesapal.com/developers)
2. Sign up/Login to get sandbox credentials
3. Update `.env` with real sandbox keys:
```env
VITE_PESAPAL_ENV=sandbox
PESAPAL_ENV=sandbox
PESAPAL_CONSUMER_KEY=your_actual_sandbox_key
PESAPAL_CONSUMER_SECRET=your_actual_sandbox_secret
VITE_API_URL=http://localhost:3000
```

### Step 3: Start Development Server
```bash
npm run dev
```
Server runs on: http://localhost:5173

## 🧪 Testing Options

### Option A: Basic Testing (No Webhooks)
1. **Start the app**: `npm run dev`
2. **Navigate to booking page**
3. **Try payment initiation** - you'll see the PesaPal payment form
4. **Use test credentials**:
   - Phone: `254722110011` (success)
   - Phone: `254722220022` (timeout)
   - Phone: `254722330033` (failure)

### Option B: Full Testing with Webhooks (Recommended)

#### Manual ngrok Installation:
1. Download ngrok from https://ngrok.com/download
2. Extract to a folder (e.g., `C:\ngrok`)
3. Add to PATH or use full path

#### Start ngrok:
```bash
# If in PATH:
ngrok http 5173

# Or with full path:
C:\ngrok\ngrok.exe http 5173
```

#### Configure PesaPal Dashboard:
1. Login to [PesaPal Dashboard](https://www.pesapal.com/developers)
2. Go to Settings → API Credentials
3. Set callback URLs:
   - **Return URL**: `https://your-ngrok-url.ngrok.io/payment/callback`
   - **Notification URL**: `https://your-ngrok-url.ngrok.io/api/pesapal/notify`

## 🧪 Test Scenarios

### 1. Successful Payment Flow
1. Book a pitch (any time slot)
2. Enter details: John Doe, john@example.com, +250788123456
3. Select M-Pesa payment method
4. Accept terms & conditions
5. Click "Complete Payment"
6. Use test phone: `254722110011`
7. Complete payment on PesaPal
8. Should redirect back with success

### 2. Failed Payment Flow
1. Repeat steps 1-5 above
2. Use test phone: `254722330033`
3. Should show failure message

### 3. Timeout Simulation
1. Repeat steps 1-5 above
2. Use test phone: `254722220022`
3. Should show timeout/pending status

## 🔍 Debugging

### Check Browser Console
- Payment initiation requests
- API responses
- Error messages

### Check Network Tab
- POST requests to `/api/pesapal/submit`
- GET requests to `/api/pesapal/status`
- Response status codes
- Request/response payloads

### Test API Endpoints Directly
```bash
# Check the local webhook health route
curl http://localhost:3000/api/pesapal/notify

# Check local payment status route (replace ORDER_ID)
curl "http://localhost:3000/api/pesapal/status?orderTrackingId=ORDER_ID"
```

## 📱 Test Data Reference

### M-Pesa Test Numbers
- ✅ `254722110011` - Success
- ⏱️ `254722220022` - Timeout
- ❌ `254722330033` - Failure

### Card Test Numbers
- `4111111111111111` (Visa)
- `5555555555554444` (Mastercard)
- `6011111111111117` (Discover)
- Use any future expiry + any 3-digit CVC

## 🚨 Common Issues & Solutions

### 1. "Failed to authenticate with PesaPal"
- Check sandbox credentials in `.env`
- Verify `VITE_PESAPAL_ENV=sandbox`
- Verify `PESAPAL_ENV=sandbox`

### 2. "Payment initiation failed"
- Check network connectivity
- Verify API URLs are correct

### 3. Webhook not receiving notifications
- Ensure ngrok is running
- Check PesaPal dashboard callback URLs
- Verify notification endpoint exists

### 4. CORS errors
- Normal for localhost testing
- PesaPal handles this in sandbox

## ✅ Success Indicators

- ✅ Payment form loads without errors
- ✅ PesaPal iframe appears
- ✅ Test payments process successfully
- ✅ Status updates work
- ✅ No console errors for API calls

## 🔄 Next Steps After Testing

1. **Run unit tests**: `npm test`
2. **Test all payment methods**: M-Pesa, Cards, Bank
3. **Test edge cases**: Network failures, invalid data
4. **Add production credentials in Vercel** when ready to deploy

---

**Need help?** Check the [SANDBOX_TESTS_README.md](SANDBOX_TESTS_README.md) for detailed test documentation.