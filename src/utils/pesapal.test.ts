import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import {
  initiatePesaPalPayment,
  getPesaPalPaymentStatus,
  validatePesaPalCallback,
  generateMerchantReference,
  formatPhoneForPesaPal,
  PESAPAL_CONFIG_EXPORT,
  type PesaPalPaymentRequest
} from '../utils/pesapal'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

describe('PesaPal Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('client configuration', () => {
    it('should target the internal API base URL', () => {
      expect(PESAPAL_CONFIG_EXPORT.API_BASE_URL).toBe('http://localhost:3000')
      expect(PESAPAL_CONFIG_EXPORT.ENVIRONMENT).toBe('sandbox')
    })
  })

  describe('initiatePesaPalPayment', () => {
    it('should successfully initiate a payment', async () => {
      const mockTokenResponse = { data: { token: 'test_token' } }
      const mockPaymentResponse = {
        data: {
          order_tracking_id: '12345',
          merchant_reference: 'SKZONE-123-ABC',
          redirect_url: 'https://pay.pesapal.com/iframe/PESAPAL-12345',
          message: 'Payment request initiated successfully',
          error: false
        }
      }

      mockedAxios.post.mockResolvedValueOnce(mockPaymentResponse)

      const paymentRequest: PesaPalPaymentRequest = {
        id: 'test-id',
        reference: 'SKZONE-123-ABC',
        amount: 1000,
        description: 'Pitch booking payment',
        currency: 'RWF',
        email: 'test@example.com',
        phone: '+250788123456',
        first_name: 'John',
        last_name: 'Doe'
      }

      const result = await initiatePesaPalPayment(paymentRequest)

      expect(result.error).toBe(false)
      expect(result.message).toBe('Payment request initiated successfully')
      expect(result.data?.order_tracking_id).toBe('12345')
      expect(result.data?.merchant_reference).toBe('SKZONE-123-ABC')
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/pesapal/submit',
        expect.objectContaining({
          phone: '+250788123456',
          paymentMethod: undefined
        })
      )
    })

    it('should handle payment initiation failure', async () => {
      const mockPaymentResponse = {
        data: {
          error: true,
          message: 'Payment failed',
          errorCode: '1'
        }
      }

      mockedAxios.post.mockResolvedValueOnce(mockPaymentResponse)

      const paymentRequest: PesaPalPaymentRequest = {
        id: 'test-id',
        reference: 'SKZONE-123-ABC',
        amount: 1000,
        description: 'Pitch booking payment',
        currency: 'RWF',
        email: 'test@example.com',
        phone: '+250788123456',
        first_name: 'John',
        last_name: 'Doe'
      }

      const result = await initiatePesaPalPayment(paymentRequest)

      expect(result.error).toBe(true)
      expect(result.message).toContain('Payment failed')
    })
  })

  describe('getPesaPalPaymentStatus', () => {
    it('should successfully get payment status', async () => {
      const mockStatusResponse = {
        data: {
          order_id: '12345',
          order_status: 'COMPLETED',
          amount: 1000,
          payment_method: 'M-Pesa',
          created_date: '2024-01-01T10:00:00Z',
          payment_date: '2024-01-01T10:05:00Z',
          customer_email: 'test@example.com',
          customer_first_name: 'John',
          customer_last_name: 'Doe',
          merchant_reference: 'SKZONE-123-ABC'
        }
      }

      mockedAxios.get.mockResolvedValueOnce(mockStatusResponse)

      const status = await getPesaPalPaymentStatus('12345')

      expect(status.order_id).toBe('12345')
      expect(status.order_status).toBe('COMPLETED')
      expect(status.amount).toBe(1000)
      expect(status.payment_method).toBe('M-Pesa')
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/pesapal/status',
        expect.objectContaining({
          params: {
            orderTrackingId: '12345'
          }
        })
      )
    })

    it('should handle status check failure', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          data: {
            error: 'Network error'
          }
        }
      })

      await expect(getPesaPalPaymentStatus('12345')).rejects.toThrow('Network error')
    })
  })

  describe('validatePesaPalCallback', () => {
    it('should validate callback signature (sandbox mode)', () => {
      const callbackData = {
        pesapal_merchant_reference: 'SKZONE-123-ABC',
        pesapal_transaction_tracking_id: '12345',
        pesapal_transaction_status: 'COMPLETED'
      }
      const signature = 'test_signature'

      // In sandbox mode, validation always returns true
      const isValid = validatePesaPalCallback(callbackData, signature)

      expect(isValid).toBe(true)
    })
  })

  describe('generateMerchantReference', () => {
    it('should generate a unique merchant reference', () => {
      const reference = generateMerchantReference()

      expect(reference).toMatch(/^SKZONE-\d+-[A-Z0-9]+$/)
      expect(reference.length).toBeGreaterThan(10)
    })

    it('should generate different references on multiple calls', () => {
      const ref1 = generateMerchantReference()
      const ref2 = generateMerchantReference()

      expect(ref1).not.toBe(ref2)
    })
  })

  describe('formatPhoneForPesaPal', () => {
    it('should format Rwandan phone numbers correctly', () => {
      expect(formatPhoneForPesaPal('0788123456')).toBe('+250788123456')
      expect(formatPhoneForPesaPal('+250788123456')).toBe('+250788123456')
      expect(formatPhoneForPesaPal('250788123456')).toBe('+250788123456')
    })

    it('should handle different country codes', () => {
      expect(formatPhoneForPesaPal('0712345678', '+256')).toBe('+256712345678')
    })
  })

  describe('Sandbox Environment Configuration', () => {
    it('should preserve sandbox mode on the client while using internal APIs', () => {
      expect(PESAPAL_CONFIG_EXPORT.ENVIRONMENT).toBe('sandbox')
      expect(PESAPAL_CONFIG_EXPORT.API_BASE_URL).toBe('http://localhost:3000')
    })
  })
})