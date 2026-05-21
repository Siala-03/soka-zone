# MTN MoMo Customer User Journey (Soka Zone)

## 1. Purpose
This document describes the end-to-end customer journey for Mobile Money (MTN MoMo Collection) payments on Soka Zone. It is intended to support production API issuance and operational review.

## 2. Business Context
Soka Zone allows customers to book football pitch time slots and pay digitally. MTN MoMo is used as a secure payment method to reduce cash handling and provide instant booking confirmation.

## 3. Primary Actors
- Customer: Person booking a pitch slot.
- Soka Zone Web App: Frontend booking experience.
- Soka Zone Backend API: Server-side payment orchestration.
- MTN MoMo Platform: Collection API for request-to-pay and status updates.
- Operations/Admin: Team that handles exceptions and reconciliation.

## 4. Preconditions
- Customer has selected date, time, and duration.
- Booking amount is calculated and shown before payment.
- Customer provides a valid Rwanda MSISDN (format: 2507XXXXXXXX).
- Backend has valid MTN credentials and secure environment variables.

## 5. Customer Journey (Happy Path)

### Step 1: Slot Selection
- Customer opens booking page.
- Customer selects date, start time, and duration.
- System displays payable amount and payment method option (MTN MoMo).

### Step 2: Payment Initiation
- Customer clicks Pay with MTN.
- Frontend sends payment request to backend with:
  - amount
  - currency
  - customer phone number
  - booking reference (external ID)
- Backend requests MTN access token, then creates request-to-pay.
- Backend returns reference ID to frontend.

### Step 3: Customer Authorization
- Customer receives MoMo payment prompt on phone (sandbox: simulated approval, production: real handset approval flow).
- Customer approves payment from the MTN MoMo channel.

### Step 4: Payment Verification
- Frontend/backend checks transaction status using reference ID.
- Status transitions from PENDING to SUCCESSFUL.

### Step 5: Booking Confirmation
- On SUCCESSFUL:
  - Booking is marked paid.
  - Booking is confirmed and inventory/slot is reserved.
  - Customer sees confirmation page/message with booking reference.
  - Optional SMS/email confirmation is sent.

## 6. Alternate and Exception Journeys

### A. Customer Rejects Payment
- MTN status becomes FAILED.
- Customer sees payment failed message.
- Customer can retry payment or choose support contact path.
- Booking remains unconfirmed/unpaid.

### B. Timeout / No Customer Action
- MTN status remains PENDING until timeout.
- System informs customer that payment is pending.
- Customer can retry status check or retry payment.
- Slot hold policy applies (temporary hold expiration).

### C. Invalid Phone Number
- Backend validates MSISDN before request-to-pay.
- Customer gets clear validation error and correction guidance.

### D. API/Network Error
- System returns friendly error and logs technical details.
- No booking confirmation occurs unless payment is verified successful.

## 7. Security and Compliance Controls
- MTN API secrets stored server-side only (never exposed to frontend).
- Access token retrieval and request-to-pay are server-to-server.
- Unique reference IDs used for idempotency and traceability.
- Payment status must be verified before booking confirmation.
- Transaction metadata stored for reconciliation and audit.

## 8. Operational Controls
- Daily reconciliation between successful bookings and MTN transaction IDs.
- Monitoring for failed and pending transactions.
- Retry strategy for transient errors.
- Customer support workflow for disputes and delayed confirmations.

## 9. Customer Experience Outcomes
- Fast digital checkout from booking page.
- Real-time payment status visibility.
- Immediate confirmation after successful payment.
- Reduced failed bookings and manual cash processing.

## 10. Production API Issuance Statement
Soka Zone will use MTN MoMo Collection API strictly for customer-initiated pitch booking payments. Every booking is confirmed only after successful payment verification. Failed or pending payments do not result in confirmed reservations. The implementation includes secure credential handling, transaction traceability, and reconciliation controls suitable for production operation.
