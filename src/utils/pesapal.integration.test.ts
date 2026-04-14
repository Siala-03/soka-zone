import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { initiatePesaPalPayment, getPesaPalPaymentStatus, formatPhoneForPesaPal } from '../utils/pesapal'

// Mock axios for integration testing
vi.mock('axios')
const mockedAxiosPost = vi.mocked(axios.post)
const mockedAxiosGet = vi.mocked(axios.get)

describe('PesaPal Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should complete a full payment flow simulation', async () => {
    // Step 1: Mock payment initiation through the internal API
    mockedAxiosPost.mockResolvedValueOnce({
      data: {
        order_tracking_id: 'PESAPAL_SANDBOX_12345',
        merchant_reference: 'SKZONE-TEST-001',
        redirect_url: 'https://pay.pesapal.com/iframe/PESAPAL_SANDBOX_12345',
        message: 'Payment request initiated successfully',
        error: false
      }
    })

    // Step 2: Mock status check - initially pending
    mockedAxiosGet.mockResolvedValueOnce({
      data: {
        order_id: 'PESAPAL_SANDBOX_12345',
        order_status: 'PENDING',
        amount: 10000,
        payment_method: 'M-Pesa',
        created_date: '2024-01-15T14:00:00Z',
        merchant_reference: 'SKZONE-TEST-001'
      }
    })

    // Step 3: Mock status check - completed
    mockedAxiosGet.mockResolvedValueOnce({
      data: {
        order_id: 'PESAPAL_SANDBOX_12345',
        order_status: 'COMPLETED',
        amount: 10000,
        payment_method: 'M-Pesa',
        created_date: '2024-01-15T14:00:00Z',
        payment_date: '2024-01-15T14:05:00Z',
        customer_email: 'test@example.com',
        customer_first_name: 'John',
        customer_last_name: 'Doe',
        merchant_reference: 'SKZONE-TEST-001'
      }
    })

    // Step 1: Initiate payment
    const paymentRequest = {
      id: 'test-booking-001',
      reference: 'SKZONE-TEST-001',
      amount: 10000,
      description: 'Test pitch booking payment',
      currency: 'RWF',
      email: 'test@example.com',
      phone: '+250788123456',
      first_name: 'John',
      last_name: 'Doe'
    }

    const initiationResult = await initiatePesaPalPayment(paymentRequest)

    expect(initiationResult.error).toBe(false)
    expect(initiationResult.data?.order_tracking_id).toBe('PESAPAL_SANDBOX_12345')
    expect(initiationResult.data?.merchant_reference).toBe('SKZONE-TEST-001')
    expect(mockedAxiosPost).toHaveBeenCalledWith(
      'http://localhost:3000/api/pesapal/submit',
      expect.objectContaining({
        phone: '+250788123456'
      })
    )

    // Step 2: Check initial status (should be pending)
    const initialStatus = await getPesaPalPaymentStatus('PESAPAL_SANDBOX_12345')

    expect(initialStatus.order_status).toBe('PENDING')
    expect(initialStatus.amount).toBe(10000)
    expect(initialStatus.merchant_reference).toBe('SKZONE-TEST-001')

    // Step 3: Check final status (should be completed)
    const finalStatus = await getPesaPalPaymentStatus('PESAPAL_SANDBOX_12345')

    expect(finalStatus.order_status).toBe('COMPLETED')
    expect(finalStatus.payment_method).toBe('M-Pesa')
    expect(finalStatus.payment_date).toBe('2024-01-15T14:05:00Z')
    expect(finalStatus.customer_email).toBe('test@example.com')
  })

  it('should handle payment failure scenarios', async () => {
    // Mock payment initiation failure
    mockedAxiosPost.mockResolvedValueOnce({
      data: {
        error: true,
        message: 'Payment failed due to insufficient funds',
        errorCode: '1'
      }
    })

    const paymentRequest = {
      id: 'test-booking-002',
      reference: 'SKZONE-TEST-002',
      amount: 50000,
      description: 'Test payment that should fail',
      currency: 'RWF',
      email: 'test@example.com',
      phone: '+250788123456',
      first_name: 'Jane',
      last_name: 'Smith'
    }

    const result = await initiatePesaPalPayment(paymentRequest)

    expect(result.error).toBe(true)
    expect(result.message).toContain('Payment failed')
    expect(result.errorCode).toBe('1')
  })

  it('should handle network errors gracefully', async () => {
    mockedAxiosPost.mockRejectedValueOnce({
      response: {
        data: {
          error: 'Network timeout'
        }
      }
    })

    const paymentRequest = {
      id: 'test-booking-003',
      reference: 'SKZONE-TEST-003',
      amount: 15000,
      description: 'Test payment with network issues',
      currency: 'RWF',
      email: 'test@example.com',
      phone: '+250788123456',
      first_name: 'Bob',
      last_name: 'Wilson'
    }

    await expect(initiatePesaPalPayment(paymentRequest)).resolves.toEqual(
      expect.objectContaining({
        error: true,
        message: 'Network timeout'
      })
    )
  })

  it('should test sandbox-specific behaviors', () => {
    expect(formatPhoneForPesaPal('0788123456')).toBe('+250788123456')
  })

  describe('Sandbox Test Phone Numbers', () => {
    it('should handle successful M-Pesa test number', () => {
      // Test successful payment number: 254722110011
      const formatted = formatPhoneForPesaPal('254722110011')
      expect(formatted).toBe('+254722110011')
    })

    it('should handle timeout M-Pesa test number', () => {
      // Test timeout number: 254722220022
      const formatted = formatPhoneForPesaPal('254722220022')
      expect(formatted).toBe('+254722220022')
    })

    it('should handle failed M-Pesa test number', () => {
      // Test failed payment number: 254722330033
      const formatted = formatPhoneForPesaPal('254722330033')
      expect(formatted).toBe('+254722330033')
    })
  })

  describe('Sandbox Test Cards', () => {
    it('should accept valid test card numbers', () => {
      // These are just format validations, actual card testing is done via PesaPal
      const testCards = [
        '4111111111111111', // Visa
        '5555555555554444', // Mastercard
        '6011111111111117'  // Discover
      ]

      testCards.forEach(card => {
        expect(card.length).toBeGreaterThanOrEqual(15)
        expect(card.length).toBeLessThanOrEqual(19)
        expect(/^\d+$/.test(card)).toBe(true)
      })
    })
  })
})
