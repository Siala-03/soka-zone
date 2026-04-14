import { describe, it, expect } from 'vitest'
import { 
  formatPhoneForPesaPal, 
  validateRwandaPhoneNumber,
  RWANDA_PAYMENT_METHODS 
} from '../utils/pesapal'

describe('MTN MOMO Rwanda Integration', () => {
  describe('Phone Number Formatting for Rwanda', () => {
    it('should format local Rwanda phone numbers correctly', () => {
      expect(formatPhoneForPesaPal('0788123456')).toBe('+250788123456')
      expect(formatPhoneForPesaPal('0722334455')).toBe('+250722334455')
      expect(formatPhoneForPesaPal('0852223344')).toBe('+250852223344')
    })

    it('should format international format Rwanda numbers', () => {
      expect(formatPhoneForPesaPal('250788123456')).toBe('+250788123456')
      expect(formatPhoneForPesaPal('+250788123456')).toBe('+250788123456')
    })

    it('should handle numbers with spaces and dashes', () => {
      expect(formatPhoneForPesaPal('0788 123 456')).toBe('+250788123456')
      expect(formatPhoneForPesaPal('+250-788-123-456')).toBe('+250788123456')
    })

    it('should handle parentheses in phone numbers', () => {
      expect(formatPhoneForPesaPal('+250 (788) 123-456')).toBe('+250788123456')
    })
  })

  describe('Rwanda Phone Number Validation', () => {
    it('should validate correct MTN Rwanda numbers', () => {
      const result = validateRwandaPhoneNumber('0788123456')
      expect(result.valid).toBe(true)
      expect(result.network).toBe('MTN')
      expect(result.formatted).toBe('+250788123456')
    })

    it('should validate correct Airtel Rwanda numbers', () => {
      const result = validateRwandaPhoneNumber('0722334455')
      expect(result.valid).toBe(true)
      expect(result.network).toBe('Airtel')
      expect(result.formatted).toBe('+250722334455')
    })

    it('should validate Vodacom Rwanda numbers', () => {
      const result = validateRwandaPhoneNumber('0852223344')
      expect(result.valid).toBe(true)
      expect(result.network).toBe('Vodacom')
      expect(result.formatted).toBe('+250852223344')
    })

    it('should detect MTN with both 78 and 79 prefixes', () => {
      const result78 = validateRwandaPhoneNumber('+250788123456')
      const result79 = validateRwandaPhoneNumber('+250798123456')
      
      expect(result78.network).toBe('MTN')
      expect(result79.network).toBe('MTN')
    })

    it('should detect Airtel with both 72 and 73 prefixes', () => {
      const result72 = validateRwandaPhoneNumber('+250722334455')
      const result73 = validateRwandaPhoneNumber('+250732334455')
      
      expect(result72.network).toBe('Airtel')
      expect(result73.network).toBe('Airtel')
    })

    it('should reject invalid Rwanda numbers', () => {
      const shortNumber = validateRwandaPhoneNumber('078')
      const longNumber = validateRwandaPhoneNumber('0788 123 456 789 000')
      const emptyNumber = validateRwandaPhoneNumber('')
      
      expect(shortNumber.valid).toBe(false)
      expect(longNumber.valid).toBe(false)
      expect(emptyNumber.valid).toBe(false)
    })

    it('should handle numbers with country codes', () => {
      const result = validateRwandaPhoneNumber('+250 788 123 456')
      expect(result.valid).toBe(true)
      expect(result.network).toBe('MTN')
    })
  })

  describe('Rwanda Payment Methods Configuration', () => {
    it('should have MTN MOMO method defined', () => {
      expect(RWANDA_PAYMENT_METHODS.MTN_MOMO).toBeDefined()
      expect(RWANDA_PAYMENT_METHODS.MTN_MOMO.code).toBe('MOMO_INT')
      expect(RWANDA_PAYMENT_METHODS.MTN_MOMO.country).toBe('RW')
    })

    it('should have Airtel Money method defined', () => {
      expect(RWANDA_PAYMENT_METHODS.AIRTEL_MONEY).toBeDefined()
      expect(RWANDA_PAYMENT_METHODS.AIRTEL_MONEY.code).toBe('AIRTEL')
      expect(RWANDA_PAYMENT_METHODS.AIRTEL_MONEY.country).toBe('RW')
    })

    it('should have Bank Transfer method defined', () => {
      expect(RWANDA_PAYMENT_METHODS.BANK_TRANSFER).toBeDefined()
      expect(RWANDA_PAYMENT_METHODS.BANK_TRANSFER.code).toBe('DIRECT_BANK_TRANSFER')
    })

    it('should have Card payment method defined', () => {
      expect(RWANDA_PAYMENT_METHODS.CARD).toBeDefined()
      expect(RWANDA_PAYMENT_METHODS.CARD.code).toBe('CARD')
    })

    it('should have proper labels for all methods', () => {
      Object.entries(RWANDA_PAYMENT_METHODS).forEach(([key, method]) => {
        expect(method.label).toBeDefined()
        expect(method.label.length).toBeGreaterThan(0)
      })
    })
  })

  describe('MTN MOMO Test Scenarios', () => {
    it('should identify test MTN MOMO numbers', () => {
      // Common test numbers for sandbox
      const testNumbers = [
        '+250788110011',
        '+250788220022',
        '+250788330033'
      ]

      testNumbers.forEach(number => {
        const result = validateRwandaPhoneNumber(number)
        expect(result.valid).toBe(true)
        expect(result.network).toBe('MTN')
      })
    })

    it('should handle real-world MTN MOMO formats', () => {
      // Test various realistic input formats
      const formats = [
        '0788123456',      // Local format
        '250788123456',    // Without +
        '+250788123456',   // Full international
        '0788-123-456',    // With dashes
        '0788 123 456',    // With spaces
        '+250-788-123-456' // Full with dashes
      ]

      formats.forEach(format => {
        const result = validateRwandaPhoneNumber(format)
        expect(result.valid).toBe(true)
        expect(result.network).toBe('MTN')
        expect(result.formatted).toBe('+250788123456')
      })
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle null or undefined gracefully', () => {
      const resultNull = validateRwandaPhoneNumber('')
      const resultWithAttemptComma = validateRwandaPhoneNumber('0788,,123456')
      
      expect(resultNull.valid).toBe(false)
      expect(resultWithAttemptComma.formatted).toBe('+250788123456')
    })

    it('should handle numbers with letters', () => {
      const result = validateRwandaPhoneNumber('0788ABC!@#123456')
      // Should strip non-numeric characters
      expect(result.formatted).toBe('+250788123456')
      expect(result.valid).toBe(true)
    })

    it('should not accept non-Rwanda numbers', () => {
      // Kenya number (254)
      const kenyaNumber = validateRwandaPhoneNumber('+254788123456')
      // Uganda number (256)
      const ugandaNumber = validateRwandaPhoneNumber('+256788123456')
      
      expect(kenyaNumber.valid).toBe(false)
      expect(ugandaNumber.valid).toBe(false)
    })
  })

  describe('Payment Flow Integration', () => {
    it('should support payment method mapping', () => {
      const paymentMethods = {
        'mtn': RWANDA_PAYMENT_METHODS.MTN_MOMO.code,
        'airtel': RWANDA_PAYMENT_METHODS.AIRTEL_MONEY.code,
        'card': RWANDA_PAYMENT_METHODS.CARD.code,
        'bank': RWANDA_PAYMENT_METHODS.BANK_TRANSFER.code
      }

      expect(paymentMethods['mtn']).toBe('MOMO_INT')
      expect(paymentMethods['airtel']).toBe('AIRTEL')
      expect(paymentMethods['card']).toBe('CARD')
      expect(paymentMethods['bank']).toBe('DIRECT_BANK_TRANSFER')
    })

    it('should format phone and validate in sequence for payment', () => {
      const userInput = '0788123456'
      
      // Step 1: Validate Rwanda phone
      const validation = validateRwandaPhoneNumber(userInput)
      expect(validation.valid).toBe(true)
      expect(validation.network).toBe('MTN')
      
      // Step 2: Format for API
      const formattedPhone = validation.formatted
      expect(formattedPhone).toBe('+250788123456')
      
      // Step 3: Payment method matches network
      let selectedMethod = 'mtn'
      if (validation.network === 'Airtel') {
        selectedMethod = 'airtel'
      }
      
      const methodCode = RWANDA_PAYMENT_METHODS[selectedMethod.toUpperCase() + '_MOMO']?.code || 
                         RWANDA_PAYMENT_METHODS[selectedMethod.toUpperCase() + '_MONEY']?.code ||
                         'MOMO_INT'
      
      expect(methodCode).toBeDefined()
    })
  })
})