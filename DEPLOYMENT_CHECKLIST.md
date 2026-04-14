# Deployment Readiness Checklist

## Critical Production Steps

### 1. Vercel Environment Variables
- [ ] Add `VITE_PESAPAL_ENV=production`
- [ ] Add `PESAPAL_ENV=production`
- [ ] Add `PESAPAL_CONSUMER_KEY` with your live PesaPal merchant key
- [ ] Add `PESAPAL_CONSUMER_SECRET` with your live PesaPal merchant secret
- [ ] Add `PUBLIC_SITE_URL=https://sokazone.rw`
- [ ] Add `PESAPAL_CALLBACK_URL=https://sokazone.rw/payment/callback`
- [ ] Add `PESAPAL_NOTIFICATION_URL=https://sokazone.rw/api/pesapal/notify`
- [ ] Add `PESAPAL_NOTIFICATION_ID` from the registered Pesapal live IPN URL
- [ ] Add the `VITE_FIREBASE_*` production values used by the client app
- [ ] Leave `VITE_API_URL` empty on Vercel unless the frontend calls a different API origin

### 2. PesaPal Dashboard Configuration
- [ ] Switch the merchant account to live mode with PesaPal
- [ ] Register `https://sokazone.rw/api/pesapal/notify` as the live IPN URL and copy the generated `notification_id`
- [ ] Store that generated value as `PESAPAL_NOTIFICATION_ID` in Vercel
- [ ] Ensure the app callback URL remains `https://sokazone.rw/payment/callback` in your request flow
- [ ] Confirm the live key and secret match the values entered in Vercel

### 3. Firebase Setup
- [ ] Confirm the production Firebase project is the one referenced by the `VITE_FIREBASE_*` values
- [ ] Ensure Firestore is enabled and the `bookings` collection can be written from the deployed app
- [ ] Verify Firestore security rules allow the expected booking flow

### 4. Vercel Deployment Checks
- [ ] Redeploy after saving the environment variables
- [ ] Confirm `GET https://sokazone.rw/api/pesapal/notify` returns the health response
- [ ] Confirm the Vercel deployment logs show the API routes building successfully
- [ ] Verify the app is using the custom domain, not only the preview `.vercel.app` URL

### 5. End-to-End Go-Live Test
- [ ] Start one real low-value MTN MoMo payment from the live site
- [ ] Confirm checkout opens the PesaPal live page
- [ ] Confirm the MTN prompt reaches the phone and payment completes
- [ ] Confirm payment status changes to `COMPLETED`
- [ ] Confirm the booking is saved in Firestore
- [ ] Confirm the webhook request appears in Vercel logs

## What Is Already Implemented

- [x] Frontend payment selection for MTN MoMo, Airtel Money, card, and bank transfer
- [x] Rwanda phone normalization and MTN MoMo method mapping via `MOMO_INT`
- [x] Server-side PesaPal submit and status routes for production-safe key handling
- [x] Webhook signature verification in the notify API route
- [x] Firebase booking save after verified payment

## Notes For Vercel

- Vercel automatically serves the files in `api/` as serverless functions, so no extra routing config is required for the PesaPal endpoints.
- Secrets belong only in the Vercel project environment settings, not in `.env.example` and not in any `VITE_` variables.
- If you later add a separate backend domain, set `VITE_API_URL` to that origin; otherwise keep it blank in production.

## Post-Launch Monitoring

- [ ] Watch Vercel function logs during the first live payments
- [ ] Watch Firestore for duplicate or failed booking writes
- [ ] Monitor callback and notify URLs after each deploy
- [ ] Rotate PesaPal credentials if they were ever exposed during testing