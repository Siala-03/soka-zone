import '@testing-library/jest-dom'

// Mock environment variables for testing
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:5173'
  },
  writable: true
})

// Mock import.meta.env
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_PESAPAL_ENV: 'sandbox',
    VITE_API_URL: 'http://localhost:3000'
  },
  writable: true
})