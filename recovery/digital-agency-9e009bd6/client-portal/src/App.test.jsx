import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi, afterEach } from 'vitest'
import App from './App.jsx'

// Mock API calls
vi.mock('./api.js', () => ({
  apiFetch: vi.fn().mockRejectedValue(new Error('Unauthorized')),
}))

describe('client-portal', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders login page by default', async () => {
    render(<App />, { wrapper: BrowserRouter })
    await waitFor(() => {
      expect(screen.getByText(/Вход/i)).toBeTruthy()
    })
  })

  it('renders login form fields', async () => {
    render(<App />, { wrapper: BrowserRouter })
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Email/i)).toBeTruthy()
      expect(screen.getByPlaceholderText(/Пароль/i)).toBeTruthy()
    })
  })

  it('renders a visible link back to the landing page', async () => {
    render(<App />, { wrapper: BrowserRouter })
    const backLink = await screen.findByRole('link', { name: 'Вернуться на ОнлайнПро.РФ' })
    expect(backLink).toBeTruthy()
    expect(backLink.getAttribute('href')).toBe('/')
  })
})
