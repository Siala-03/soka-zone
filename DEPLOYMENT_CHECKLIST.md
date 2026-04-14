# Deployment Readiness Checklist

## Current Payment Flow

- The booking page now opens a static Pesapal store link: `https://store.pesapal.com/sokazonepayment`
- Customer details are entered on the Pesapal hosted page, not inside the app.
- The app no longer performs in-app payment verification or automatic booking confirmation.

## Vercel Checks

- [ ] Confirm the live site is using the correct domain, such as `https://sokazone.rw`
- [ ] Redeploy after any content or pricing changes
- [ ] Verify the static Pesapal button opens `https://store.pesapal.com/sokazonepayment`
- [ ] Remove any unused live secrets from Vercel if the app no longer depends on them

## Pesapal Checks

- [ ] Confirm the hosted store link is active in the Pesapal dashboard
- [ ] Confirm the amount and payment details shown on the hosted page are correct
- [ ] Confirm card checkout completes successfully from the live site

## Booking Operations

- [ ] Decide how bookings are confirmed after payment, since the app no longer verifies payments automatically
- [ ] If manual confirmation is required, make sure staff know how to match Pesapal receipts to bookings
- [ ] If automated confirmation is needed later, restore a tracked API-based payment flow instead of the static link

## Post-Launch Monitoring

- [ ] Watch for user drop-off between the booking page and the hosted Pesapal page
- [ ] Monitor support requests related to payment confirmation
- [ ] Rotate any credentials that may have been exposed during testing