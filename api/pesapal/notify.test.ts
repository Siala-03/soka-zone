import { describe, it, expect, vi, beforeEach } from 'vitest'
import crypto from 'crypto'
import notifyHandler from '../../api/pesapal/notify'

// Mock crypto
vi.mock('crypto')

describe('PesaPal Notification Handler', () => {
  const mockSecret = 'test_consumer_secret'

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock process.env
    process.env.PESAPAL_CONSUMER_SECRET = mockSecret
  })

  describe('GET requests', () => {
    it('should respond with status message for GET requests', async () => {
      const mockReq = {
        method: 'GET',
        body: null
      }
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn()
      }

      await notifyHandler(mockReq as any, mockRes as any)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.send).toHaveBeenCalledWith('PesaPal notify endpoint is running')
    })
  })

  describe('Invalid methods', () => {
    it('should reject non-POST methods', async () => {
      const mockReq = {
        method: 'PUT',
        body: null
      }
      const mockRes = {
        setHeader: vi.fn().mockReturnThis(),
        status: vi.fn().mockReturnThis(),
        send: vi.fn()
      }

      await notifyHandler(mockReq as any, mockRes as any)

      expect(mockRes.setHeader).toHaveBeenCalledWith('Allow', 'POST')
      expect(mockRes.status).toHaveBeenCalledWith(405)
      expect(mockRes.send).toHaveBeenCalledWith('Method Not Allowed')
    })
  })

  describe('Signature verification', () => {
    it('should reject requests without consumer secret', async () => {
      delete process.env.PESAPAL_CONSUMER_SECRET

      const mockReq = {
        method: 'POST',
        body: { test: 'data' }
      }
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      }

      await notifyHandler(mockReq as any, mockRes as any)

      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Server misconfigured' })
    })

    it('should reject requests with empty body', async () => {
      const mockReq = {
        method: 'POST',
        body: null
      }
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      }

      await notifyHandler(mockReq as any, mockRes as any)

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Empty request body' })
    })

    it('should reject requests with invalid signature', async () => {
      const mockCreateHmac = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnThis(),
        digest: vi.fn().mockReturnValue('invalid_signature')
      })

      vi.mocked(crypto.createHmac).mockReturnValue(mockCreateHmac as any)

      const mockReq = {
        method: 'POST',
        body: {
          pesapal_merchant_reference: 'SKZONE-123-ABC',
          pesapal_transaction_tracking_id: '12345',
          pesapal_transaction_status: 'COMPLETED',
          pesapal_signature: 'valid_signature'
        }
      }
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      }

      await notifyHandler(mockReq as any, mockRes as any)

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid signature' })
    })

    it('should accept requests with valid signature', async () => {
      const expectedSignature = 'valid_signature_base64'
      const mockCreateHmac = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnThis(),
        digest: vi.fn().mockReturnValue(Buffer.from(expectedSignature, 'base64'))
      })

      vi.mocked(crypto.createHmac).mockReturnValue(mockCreateHmac as any)

      const mockReq = {
        method: 'POST',
        body: {
          pesapal_merchant_reference: 'SKZONE-123-ABC',
          pesapal_transaction_tracking_id: '12345',
          pesapal_transaction_status: 'COMPLETED',
          pesapal_signature: expectedSignature
        }
      }
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      }

      await notifyHandler(mockReq as any, mockRes as any)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Notification received',
        status: 'COMPLETED'
      })
    })
  })

  describe('Notification processing', () => {
    it('should process COMPLETED payment notifications', async () => {
      const expectedSignature = 'valid_signature_base64'
      const mockCreateHmac = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnThis(),
        digest: vi.fn().mockReturnValue(Buffer.from(expectedSignature, 'base64'))
      })

      vi.mocked(crypto.createHmac).mockReturnValue(mockCreateHmac as any)

      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

      const mockReq = {
        method: 'POST',
        body: {
          pesapal_merchant_reference: 'SKZONE-123-ABC',
          pesapal_transaction_tracking_id: '12345',
          pesapal_transaction_status: 'COMPLETED',
          pesapal_signature: expectedSignature
        }
      }
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      }

      await notifyHandler(mockReq as any, mockRes as any)

      expect(consoleSpy).toHaveBeenCalledWith('PesaPal notification received', {
        merchantRef: 'SKZONE-123-ABC',
        trackingId: '12345',
        status: 'COMPLETED'
      })

      consoleSpy.mockRestore()
    })

    it('should process FAILED payment notifications', async () => {
      const expectedSignature = 'valid_signature_base64'
      const mockCreateHmac = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnThis(),
        digest: vi.fn().mockReturnValue(Buffer.from(expectedSignature, 'base64'))
      })

      vi.mocked(crypto.createHmac).mockReturnValue(mockCreateHmac as any)

      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

      const mockReq = {
        method: 'POST',
        body: {
          pesapal_merchant_reference: 'SKZONE-123-ABC',
          pesapal_transaction_tracking_id: '12345',
          pesapal_transaction_status: 'FAILED',
          pesapal_signature: expectedSignature
        }
      }
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      }

      await notifyHandler(mockReq as any, mockRes as any)

      expect(consoleSpy).toHaveBeenCalledWith('PesaPal notification received', {
        merchantRef: 'SKZONE-123-ABC',
        trackingId: '12345',
        status: 'FAILED'
      })

      consoleSpy.mockRestore()
    })
  })

  describe('Signature verification function', () => {
    it('should reject incomplete payload', () => {
      const result = verifySignature({}, mockSecret)
      expect(result).toBe(false)
    })

    it('should verify correct signature', () => {
      const payload = {
        pesapal_merchant_reference: 'ref',
        pesapal_transaction_tracking_id: 'id',
        pesapal_transaction_status: 'status',
        pesapal_signature: 'signature'
      }

      const mockCreateHmac = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnThis(),
        digest: vi.fn().mockReturnValue(Buffer.from('signature', 'base64'))
      })

      vi.mocked(crypto.createHmac).mockReturnValue(mockCreateHmac as any)

      const result = verifySignature(payload, mockSecret)
      expect(result).toBe(true)
    })
  })
})

// Helper function for testing (duplicated from the handler for testing)
function verifySignature(body: any, secret: string): boolean {
  if (!body || !body.pesapal_merchant_reference || !body.pesapal_transaction_tracking_id || !body.pesapal_transaction_status || !body.pesapal_signature) {
    return false;
  }

  const payload = `${body.pesapal_merchant_reference}${body.pesapal_transaction_tracking_id}${body.pesapal_transaction_status}`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expected = hmac.digest('base64');

  return expected === body.pesapal_signature;
}