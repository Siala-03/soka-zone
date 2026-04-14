# PesaPal Setup

## Current State

The site currently uses a direct hosted Pesapal payment link:

`https://store.pesapal.com/sokazonepayment`

The app does not create tracked Pesapal orders from the frontend anymore. It simply sends the customer to the hosted payment page.

## User Flow

1. Customer selects a pitch slot in the booking page.
2. Customer clicks through to the payment step.
3. Customer clicks the hosted Pesapal link.
4. Customer fills payment details on Pesapal's page.

## What This Means

- Customer details are collected on the Pesapal hosted page, not in the app.
- The app does not automatically verify payment success.
- The app does not automatically save a confirmed booking after payment.

## Hosted Link

Use this exact link in the payment step:

`https://store.pesapal.com/sokazonepayment`

## Operational Note

If you need automatic payment verification, booking confirmation, webhook handling, or reference tracking again, you should move back to an API-based Pesapal integration instead of the static store link.
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
