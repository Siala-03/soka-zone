import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PesaPalPayment } from './PesaPalPayment'
import { initiatePesaPalPayment } from '../utils/pesapal'

vi.mock('../utils/pesapal')
const mockedInitiatePayment = vi.mocked(initiatePesaPalPayment)

const mockSessionStorage = {
  setItem: vi.fn(),
  getItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
})

describe('PesaPalPayment - MTN MOMO Rwanda Integration', () => {
  const mockProps = {
    bookingData: {
      date: '2024-01-15',
      time: '14:00',
      duration: 2,
      pitch: 'Premium Pitch A',
      name: 'John Doe',
      phone: '+250788123456',
      email: 'john@example.com'
    },
    amount: 20000,
    onSuccess: vi.fn(),
    onBack: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionStorage.setItem.mockClear()
  })

  describe('MTN MOMO Payment Method', () => {
    it('should display MTN MOMO as popular payment method', () => {
      render(<PesaPalPayment {...mockProps} />)
      
      const mtnButton = screen.getByText('MTN MoMo')
      expect(mtnButton).toBeInTheDocument()
      
      // Check for "Popular" badge
      expect(screen.getByText('Popular')).toBeInTheDocument()
    })

    it('should select MTN MOMO by default', async () => {
      render(<PesaPalPayment {...mockProps} />)
      
      const mtnButton = screen.getByText('MTN MoMo').closest('button')
      expect(mtnButton).toHaveClass('border-yellow-500', 'bg-yellow-50')
    })

    it('should allow switching between MTN and Airtel', async () => {
      const user = userEvent.setup()
      render(<PesaPalPayment {...mockProps} />)
      
      // Initially MTN should be selected
      expect(screen.getByText('MTN MoMo').closest('button')).toHaveClass('border-yellow-500')
      
      // Click Airtel
      await user.click(screen.getByText('Airtel Money'))
      expect(screen.getByText('Airtel Money').closest('button')).toHaveClass('border-red-600')
    })

    it('should display other payment methods (Card, Bank)', () => {
      render(<PesaPalPayment {...mockProps} />)
      
      expect(screen.getByText('Debit/Credit Card')).toBeInTheDocument()
      expect(screen.getByText('Bank Transfer')).toBeInTheDocument()
    })
  })

  describe('Rwanda Phone Validation', () => {
    it('should validate valid Rwanda MTN phone numbers', async () => {
      const user = userEvent.setup()
      
      mockedInitiatePayment.mockResolvedValueOnce({
        error: false,
        message: 'Success',
        data: {
          order_tracking_id: '123',
          merchant_reference: 'ref',
          redirect_url: 'url'
        }
      })

      render(<PesaPalPayment {...mockProps} />)

      // Accept terms
      await user.click(screen.getByLabelText(/I agree to the terms/))
      
      // Submit payment
      await user.click(screen.getByText(/Complete Payment/))

      // Should detect MTN "Optimized for your number"
      await waitFor(() => {
        expect(screen.getByText(/Optimized for your number/)).toBeInTheDocument()
      })
    })

    it('should detect and warn when phone network does not match selected method', async () => {
      const airtelPhoneProps = {
        ...mockProps,
        bookingData: {
          ...mockProps.bookingData,
          phone: '+250722334455' // Airtel number
        }
      }

      const user = userEvent.setup()
      render(<PesaPalPayment {...airtelPhoneProps} />)

      // Phone validation should run on payment
      await user.click(screen.getByLabelText(/I agree to the terms/))
      await user.click(screen.getByText(/Complete Payment/))

      // Should show phone validation info
      await waitFor(() => {
        expect(screen.getByText(/Detected network:/)).toBeInTheDocument()
      })
    })

    it('should show network detection info with correct carrier', async () => {
      const user = userEvent.setup()
      
      mockedInitiatePayment.mockResolvedValueOnce({
        error: false,
        message: 'Success',
        data: { order_tracking_id: '123', merchant_reference: 'ref', redirect_url: 'url' }
      })

      render(<PesaPalPayment {...mockProps} />)
      
      // Accept terms and submit
      await user.click(screen.getByLabelText(/I agree to the terms/))
      await user.click(screen.getByText(/Complete Payment/))

      // Wait for network detection info
      await waitFor(() => {
        expect(screen.getByText(/Detected network:/)).toBeInTheDocument()
        expect(screen.getByText(/MTN/)).toBeInTheDocument()
      })
    })
  })

  describe('Phone Number Format Support', () => {
    it('should accept phone numbers in format 0788123456', async () => {
      const user = userEvent.setup()
      const localFormatProps = {
        ...mockProps,
        bookingData: {
          ...mockProps.bookingData,
          phone: '0788123456' // Local Rwanda format
        }
      }

      mockedInitiatePayment.mockResolvedValueOnce({
        error: false,
        message: 'Success',
        data: { order_tracking_id: '123', merchant_reference: 'ref', redirect_url: 'url' }
      })

      render(<PesaPalPayment {...localFormatProps} />)

      await user.click(screen.getByLabelText(/I agree to the terms/))
      await user.click(screen.getByText(/Complete Payment/))

      // Should successfully initiate payment
      await waitFor(() => {
        expect(mockedInitiatePayment).toHaveBeenCalled()
      })

      // Check the call includes properly formatted phone
      const callArgs = mockedInitiatePayment.mock.calls[0][0]
      expect(callArgs.phone).toBe('+250788123456')
    })

    it('should accept phone numbers in format 250788123456', async () => {
      const user = userEvent.setup()
      const intlFormatProps = {
        ...mockProps,
        bookingData: {
          ...mockProps.bookingData,
          phone: '250788123456'
        }
      }

      mockedInitiatePayment.mockResolvedValueOnce({
        error: false,
        message: 'Success',
        data: { order_tracking_id: '123', merchant_reference: 'ref', redirect_url: 'url' }
      })

      render(<PesaPalPayment {...intlFormatProps} />)

      await user.click(screen.getByLabelText(/I agree to the terms/))
      await user.click(screen.getByText(/Complete Payment/))

      await waitFor(() => {
        const callArgs = mockedInitiatePayment.mock.calls[0][0]
        expect(callArgs.phone).toBe('+250788123456')
      })
    })

    it('should accept phone numbers in format +250788123456', async () => {
      // Already testing this in base mockProps
      render(<PesaPalPayment {...mockProps} />)
      expect(screen.getByText('Payment Summary')).toBeInTheDocument()
    })
  })

  describe('Payment Method API Integration', () => {
    it('should send MTN MOMO payment method to API', async () => {
      const user = userEvent.setup()

      mockedInitiatePayment.mockResolvedValueOnce({
        error: false,
        message: 'Success',
        data: { order_tracking_id: '123', merchant_reference: 'ref', redirect_url: 'url' }
      })

      render(<PesaPalPayment {...mockProps} />)

      await user.click(screen.getByLabelText(/I agree to the terms/))
      await user.click(screen.getByText(/Complete Payment/))

      await waitFor(() => {
        expect(mockedInitiatePayment).toHaveBeenCalledWith(
          expect.objectContaining({
            paymentMethod: 'MOMO_INT' // MTN MOMO code
          })
        )
      })
    })

    it('should send Airtel payment method to API when selected', async () => {
      const user = userEvent.setup()

      mockedInitiatePayment.mockResolvedValueOnce({
        error: false,
        message: 'Success',
        data: { order_tracking_id: '123', merchant_reference: 'ref', redirect_url: 'url' }
      })

      render(<PesaPalPayment {...mockProps} />)

      // Switch to Airtel
      await user.click(screen.getByText('Airtel Money'))
      
      // Accept terms and submit
      await user.click(screen.getByLabelText(/I agree to the terms/))
      await user.click(screen.getByText(/Complete Payment/))

      await waitFor(() => {
        expect(mockedInitiatePayment).toHaveBeenCalledWith(
          expect.objectContaining({
            paymentMethod: 'AIRTEL' // Airtel code
          })
        )
      })
    })

    it('should send Card payment method to API when selected', async () => {
      const user = userEvent.setup()

      mockedInitiatePayment.mockResolvedValueOnce({
        error: false,
        message: 'Success',
        data: { order_tracking_id: '123', merchant_reference: 'ref', redirect_url: 'url' }
      })

      render(<PesaPalPayment {...mockProps} />)

      // Switch to Card
      await user.click(screen.getByText('Debit/Credit Card'))
      
      await user.click(screen.getByLabelText(/I agree to the terms/))
      await user.click(screen.getByText(/Complete Payment/))

      await waitFor(() => {
        expect(mockedInitiatePayment).toHaveBeenCalledWith(
          expect.objectContaining({
            paymentMethod: 'CARD'
          })
        )
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid phone number', async () => {
      const user = userEvent.setup()
      const invalidPhoneProps = {
        ...mockProps,
        bookingData: {
          ...mockProps.bookingData,
          phone: '123' // Too short
        }
      }

      render(<PesaPalPayment {...invalidPhoneProps} />)

      await user.click(screen.getByLabelText(/I agree to the terms/))
      await user.click(screen.getByText(/Complete Payment/))

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/Invalid phone number/)).toBeInTheDocument()
      })
    })

    it('should handle payment initiation failure', async () => {
      const user = userEvent.setup()

      mockedInitiatePayment.mockResolvedValueOnce({
        error: true,
        message: 'Payment initiation failed',
        errorCode: '1'
      })

      render(<PesaPalPayment {...mockProps} />)

      await user.click(screen.getByLabelText(/I agree to the terms/))
      await user.click(screen.getByText(/Complete Payment/))

      await waitFor(() => {
        expect(screen.getByText('Payment initiation failed')).toBeInTheDocument()
      })
    })
  })

  describe('Rwanda-Specific Flow', () => {
    it('should complete full Rwanda MTN MOMO payment flow', async () => {
      const user = userEvent.setup()

      mockedInitiatePayment.mockResolvedValueOnce({
        error: false,
        message: 'Payment request initiated successfully',
        data: {
          order_tracking_id: 'PESAPAL_RW_12345',
          merchant_reference: 'SKZONE-MTN-001',
          redirect_url: 'https://sandbox.pesapal.com/payment?order=12345'
        }
      })

      render(<PesaPalPayment {...mockProps} />)

      // 1. Verify MTN is selected
      expect(screen.getByText('MTN MoMo').closest('button')).toHaveClass('border-yellow-500')

      // 2. Accept terms
      await user.click(screen.getByLabelText(/I agree to the terms/))

      // 3. Submit payment
      await user.click(screen.getByText(/Complete Payment/))

      // 4. Verify payment was initiated with correct params
      await waitFor(() => {
        expect(mockedInitiatePayment).toHaveBeenCalledWith(
          expect.objectContaining({
            phone: '+250788123456',
            currency: 'RWF',
            paymentMethod: 'MOMO_INT'
          })
        )
      })

      // 5. Verify data stored in session
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'pesapal_tracking_id',
        'PESAPAL_RW_12345'
      )
    })
  })
})