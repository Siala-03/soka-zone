import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PesaPalPayment } from './PesaPalPayment'

describe('PesaPalPayment Component', () => {
  const mockProps = {
    onBack: vi.fn()
  }

  it('renders the direct payment link', () => {
    render(<PesaPalPayment {...mockProps} />)

    const link = screen.getByRole('link', { name: 'Pay with PesaPal' })
    expect(link).toHaveAttribute('href', 'https://store.pesapal.com/sokazonepayment')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup()
    render(<PesaPalPayment {...mockProps} />)

    const backButton = screen.getByText('Back to details')
    await user.click(backButton)

    expect(mockProps.onBack).toHaveBeenCalled()
  })
})