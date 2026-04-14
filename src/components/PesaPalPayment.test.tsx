import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PesaPalPayment } from './PesaPalPayment'
import { initiatePesaPalPayment } from '../utils/pesapal'

// Mock the pesapal utility
vi.mock('../utils/pesapal')
const mockedInitiatePayment = vi.mocked(initiatePesaPalPayment)

// Mock sessionStorage
const mockSessionStorage = {
  setItem: vi.fn(),
  getItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
})

describe('PesaPalPayment Component', () => {
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

  it('renders payment summary correctly', () => {
    render(<PesaPalPayment {...mockProps} />)

    expect(screen.getByText('Payment Summary')).toBeInTheDocument()
    expect(screen.getByText('Premium Pitch A')).toBeInTheDocument()
    expect(screen.getByText('2024-01-15 at 14:00')).toBeInTheDocument()
    expect(screen.getByText('2 hours')).toBeInTheDocument()
    expect(screen.getByText('RWF 20,000')).toBeInTheDocument()
  })

  it('displays current card-only checkout notice', () => {
    render(<PesaPalPayment {...mockProps} />)

    expect(screen.getByText('Current checkout availability')).toBeInTheDocument()
    expect(screen.getByText(/live checkout is card-only for now/i)).toBeInTheDocument()
  })

  it('requires terms acceptance to proceed with payment', async () => {
    const user = userEvent.setup()
    render(<PesaPalPayment {...mockProps} />)

    const paymentButton = screen.getByText('Continue to Card Payment - RWF 20,000')
    expect(paymentButton).toBeDisabled()

    // Check terms checkbox
    const termsCheckbox = screen.getByLabelText(/I agree to the terms and conditions/)
    await user.click(termsCheckbox)

    expect(paymentButton).not.toBeDisabled()
  })

  it('shows error when terms are not accepted', async () => {
    const user = userEvent.setup()
    render(<PesaPalPayment {...mockProps} />)

    const paymentButton = screen.getByText('Continue to Card Payment - RWF 20,000')
    await user.click(paymentButton)

    expect(screen.getByText('Please accept the terms and conditions')).toBeInTheDocument()
  })

  it('handles successful payment initiation', async () => {
    const user = userEvent.setup()

    mockedInitiatePayment.mockResolvedValueOnce({
      error: false,
      message: 'Payment initiated successfully',
      data: {
        order_tracking_id: '12345',
        merchant_reference: 'SKZONE-123-ABC',
        redirect_url: 'https://sandbox.pesapal.com/payment?order=12345'
      }
    })

    render(<PesaPalPayment {...mockProps} />)

    // Accept terms
    const termsCheckbox = screen.getByLabelText(/I agree to the terms and conditions/)
    await user.click(termsCheckbox)

    // Click payment button
    const paymentButton = screen.getByText('Continue to Card Payment - RWF 20,000')
    await user.click(paymentButton)

    // Wait for payment processing
    await waitFor(() => {
      expect(mockedInitiatePayment).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 20000,
          description: expect.stringContaining('Premium Pitch A'),
          email: 'john@example.com',
          phone: '+250788123456',
          first_name: 'John',
          last_name: 'Doe'
        })
      )
    })

    // Should show redirect panel
    await waitFor(() => {
      expect(screen.getByText('Continue to PesaPal')).toBeInTheDocument()
    })

    // Should store data in sessionStorage
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith('pesapal_merchant_ref', expect.any(String))
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith('pesapal_tracking_id', '12345')
  })

  it('handles payment initiation failure', async () => {
    const user = userEvent.setup()

    mockedInitiatePayment.mockResolvedValueOnce({
      error: true,
      message: 'Payment failed',
      errorCode: '1'
    })

    render(<PesaPalPayment {...mockProps} />)

    // Accept terms
    const termsCheckbox = screen.getByLabelText(/I agree to the terms and conditions/)
    await user.click(termsCheckbox)

    // Click payment button
    const paymentButton = screen.getByText('Continue to Card Payment - RWF 20,000')
    await user.click(paymentButton)

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Payment failed')).toBeInTheDocument()
    })
  })

  it('handles zero amount booking', async () => {
    const user = userEvent.setup()
    const zeroAmountProps = { ...mockProps, amount: 0 }

    render(<PesaPalPayment {...zeroAmountProps} />)

    // Accept terms
    const termsCheckbox = screen.getByLabelText(/I agree to the terms and conditions/)
    await user.click(termsCheckbox)

    // Click payment button
    const paymentButton = screen.getByText('Continue to Card Payment - RWF 0')
    await user.click(paymentButton)

    expect(screen.getByText('Please contact sales for bookings longer than 4 hours')).toBeInTheDocument()
  })

  it('shows loading state during payment processing', async () => {
    const user = userEvent.setup()

    // Mock a delayed response
    mockedInitiatePayment.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        error: false,
        message: 'Success',
        data: { order_tracking_id: '123', merchant_reference: 'ref', redirect_url: 'url' }
      }), 100))
    )

    render(<PesaPalPayment {...mockProps} />)

    // Accept terms
    const termsCheckbox = screen.getByLabelText(/I agree to the terms and conditions/)
    await user.click(termsCheckbox)

    // Click payment button
    const paymentButton = screen.getByText('Continue to Card Payment - RWF 20,000')
    await user.click(paymentButton)

    // Should show loading state
    expect(screen.getByText('Redirecting...')).toBeInTheDocument()
    expect(screen.getByText('Redirecting...').closest('button')).toBeDisabled()
  })

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup()
    render(<PesaPalPayment {...mockProps} />)

    const backButton = screen.getByText('Back to details')
    await user.click(backButton)

    expect(mockProps.onBack).toHaveBeenCalled()
  })

  it('displays booking contact section', () => {
    render(<PesaPalPayment {...mockProps} />)

    expect(screen.getByText('Booking Contact')).toBeInTheDocument()
    expect(screen.getByText(/Add the contact we should use for your booking/)).toBeInTheDocument()
  })

  it('shows redirect guidance copy before checkout', async () => {
    mockedInitiatePayment.mockResolvedValueOnce({
      error: false,
      message: 'Success',
      data: {
        order_tracking_id: '12345',
        merchant_reference: 'SKZONE-123-ABC',
        redirect_url: 'https://sandbox.pesapal.com/payment?order=12345'
      }
    })

    render(<PesaPalPayment {...mockProps} />)

    expect(screen.getByText('How payment works')).toBeInTheDocument()
    expect(screen.getByText(/hosted PesaPal card checkout/i)).toBeInTheDocument()
  })
})