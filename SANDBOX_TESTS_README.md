# PesaPal Sandbox Tests

This directory contains comprehensive sandbox tests for the PesaPal payment integration in the SkoZone pitch booking system.

## Test Structure

### Unit Tests
- **`src/utils/pesapal.test.ts`** - Tests for core PesaPal utility functions
- **`src/components/PesaPalPayment.test.tsx`** - Tests for the payment component
- **`api/pesapal/notify.test.ts`** - Tests for the webhook notification handler

### Integration Tests
- **`src/utils/pesapal.integration.test.ts`** - Full payment flow simulation tests

## Running the Tests

### Prerequisites
1. Install dependencies:
```bash
npm install
```

2. Ensure you're using the sandbox environment (configured in `.env.test`)

### Run All Tests
```bash
npm test
```

### Run Tests with UI
```bash
npm run test:ui
```

### Run Specific Test Files
```bash
# Run utility tests
npm test src/utils/pesapal.test.ts

# Run component tests
npm test src/components/PesaPalPayment.test.tsx

# Run integration tests
npm test src/utils/pesapal.integration.test.ts

# Run notification handler tests
npm test api/pesapal/notify.test.ts
```

## Sandbox Test Credentials

The tests are configured to use sandbox mode with test credentials:

### Environment Variables (`.env.test`)
```env
VITE_PESAPAL_ENV=sandbox
PESAPAL_ENV=sandbox
PESAPAL_CONSUMER_KEY=test_consumer_key
PESAPAL_CONSUMER_SECRET=test_consumer_secret
VITE_API_URL=http://localhost:3000
```

### Test Phone Numbers (M-Pesa)
- `254722110011` - Successful payment
- `254722220022` - Timeout
- `254722330033` - Failed payment

### Test Card Numbers
- `4111111111111111` - Visa (Successful)
- `5555555555554444` - Mastercard (Successful)
- `6011111111111117` - Discover (Successful)

*Use any future expiry date and any 3-digit CVC for testing*

## Test Coverage

The tests cover:

### Core Functionality
- ✅ Payment initiation requests
- ✅ Payment status checking
- ✅ Callback signature validation
- ✅ Merchant reference generation
- ✅ Phone number formatting
- ✅ Server-side route integration for live-safe credentials

### Component Behavior
- ✅ Payment form rendering
- ✅ Payment method selection
- ✅ Terms acceptance validation
- ✅ Error handling and display
- ✅ Loading states
- ✅ Success/failure scenarios

### API Integration
- ✅ Webhook notification handling
- ✅ Signature verification
- ✅ Status update processing

### Integration Flows
- ✅ Complete payment lifecycle
- ✅ Error scenarios (network failures, payment failures)
- ✅ Sandbox-specific behaviors

## Manual Testing

For manual testing with the actual PesaPal sandbox:

1. Start the development server:
```bash
npm run dev
```

2. Navigate to the booking page and attempt a payment

3. Use the test phone numbers/cards above

4. Monitor the browser console and network requests

5. Check the webhook endpoint (if running locally with ngrok)

## API Documentation Links

- [Authentication](https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/authentication)
- [API Reference](https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/api-reference)
- [Register IPN URL](https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/registeripnurl)
- [Get Registered IPN](https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/getregisteredipn)
- [Submit Order Request](https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/submitorderrequest)
- [Get Transaction Status](https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/gettransactionstatus)
- [Refund Request](https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/refund-request)
- [Integration Guide](https://developer.pesapal.com/integration)

## Troubleshooting

### Common Issues

1. **Tests failing due to network timeouts**
   - Ensure stable internet connection
   - Check if PesaPal sandbox is accessible

2. **Environment variable issues**
   - Verify `.env.test` file exists and is properly loaded
   - Check that `VITE_PESAPAL_ENV=sandbox`

3. **Component tests failing**
   - Ensure all React Testing Library dependencies are installed
   - Check that the component imports are correct

4. **TypeScript errors**
   - Run `npm run lint` to check for type issues
   - Ensure all test files have proper type annotations

### Debug Mode

Run tests in debug mode:
```bash
npm test -- --reporter=verbose
```

Or run a specific test with detailed output:
```bash
npm test src/utils/pesapal.test.ts -- --reporter=verbose
```

## Contributing

When adding new tests:

1. Follow the existing naming conventions
2. Include both positive and negative test cases
3. Mock external dependencies appropriately
4. Add descriptive test names and comments
5. Update this README if adding new test categories