import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { vi, afterEach } from 'vitest'
import App from './App.jsx'

// Mock API calls
vi.mock('./services/api', () => ({
  getMe: vi.fn().mockRejectedValue(new Error('Unauthorized')),
  login: vi.fn(),
  logout: vi.fn(),
  getProducts: vi.fn().mockResolvedValue({ data: [] }),
}))

describe('app', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders login page by default', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText(/Вход в систему/i)).toBeTruthy()
    })
  })

  it('renders login form fields', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Email/i)).toBeTruthy()
      expect(screen.getByPlaceholderText(/••••••••/i)).toBeTruthy()
    })
  })

  it('renders logo and brand name', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText(/Цифровое агентство ОнлайнПро.РФ/i)).toBeTruthy()
    })
  })
})