import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('../../api.js', () => ({
  apiFetch: vi.fn(),
}))

import { apiFetch } from '../../api.js'

function setupDefaultMocks() {
  apiFetch.mockImplementation((url) => {
    if (url.includes('/custom-fields')) return Promise.resolve([
      { id: 'f1', name: 'ИНН', field_type: 'text', is_required: false, is_visible: true, options: [] },
      { id: 'f2', name: 'Статус', field_type: 'list', is_required: false, is_visible: true, options: ['VIP', 'Обычный'] },
      { id: 'f3', name: 'Дата рождения', field_type: 'date', is_required: false, is_visible: true, options: [] },
      { id: 'f4', name: 'Скидка', field_type: 'number', is_required: false, is_visible: true, options: [] },
      { id: 'f5', name: 'Email доп', field_type: 'email', is_required: false, is_visible: true, options: [] },
    ])
    if (url.includes('/search-templates')) return Promise.resolve([])
    if (url.includes('/display-settings')) return Promise.resolve({ columns: ['full_name', 'phone', 'email', 'created_at'] })
    if (url.includes('/self-registered/count')) return Promise.resolve({ count: 0 })
    if (url.includes('/customers')) return Promise.resolve({ items: [], total: 0, page: 1, limit: 30 })
    return Promise.resolve({})
  })
}

function getAddButton() {
  const btns = screen.getAllByText(/Добавить/i)
  return btns.find(b => b.closest('.btn-primary')) || btns[0]
}

describe('AutoComplete="off" coverage — CRM Customers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupDefaultMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('все input, select и textarea в модалке добавления имеют autoComplete="off"', async () => {
    const CrmCustomersTab = (await import('./CrmCustomersTab')).default
    render(<CrmCustomersTab />)

    await waitFor(() => {
      expect(screen.getAllByText(/Добавить/i).length).toBeGreaterThanOrEqual(1)
    })

    fireEvent.click(getAddButton())

    await waitFor(() => {
      const form = document.querySelector('form.modal-form')
      expect(form).not.toBeNull()
    })

    const form = document.querySelector('form.modal-form')

    const inputs = form.querySelectorAll('input:not([type="checkbox"])')
    inputs.forEach((input) => {
      const ac = input.getAttribute('autoComplete') || input.getAttribute('autocomplete')
      expect(
        ac === 'off' || ac === 'new-password',
        `Input name="${input.name || input.placeholder || input.type}" missing autoComplete="off". Got: ${ac}`,
      ).toBe(true)
    })

    const textareas = form.querySelectorAll('textarea')
    textareas.forEach((ta) => {
      const ac = ta.getAttribute('autoComplete') || ta.getAttribute('autocomplete')
      expect(
        ac === 'off',
        `Textarea missing autoComplete="off". Got: ${ac}`,
      ).toBe(true)
    })

    const selects = form.querySelectorAll('select')
    selects.forEach((sel) => {
      const ac = sel.getAttribute('autoComplete') || sel.getAttribute('autocomplete')
      expect(
        ac === 'off',
        `Select missing autoComplete="off". Got: ${ac}`,
      ).toBe(true)
    })
  })

  it('форма добавления имеет autoComplete="off"', async () => {
    const CrmCustomersTab = (await import('./CrmCustomersTab')).default
    render(<CrmCustomersTab />)

    await waitFor(() => {
      expect(screen.getAllByText(/Добавить/i).length).toBeGreaterThanOrEqual(1)
    })

    fireEvent.click(getAddButton())

    await waitFor(() => {
      const form = document.querySelector('form.modal-form')
      expect(form).not.toBeNull()
      const ac = form.getAttribute('autoComplete') || form.getAttribute('autocomplete')
      expect(ac).toBe('off')
    })
  })

  it('поле поиска имеет autoComplete="off"', async () => {
    const CrmCustomersTab = (await import('./CrmCustomersTab')).default
    render(<CrmCustomersTab />)

    await waitFor(() => {
      const searchInputs = document.querySelectorAll('input[placeholder*="Поиск"], input[placeholder*="поиск"]')
      searchInputs.forEach((input) => {
        const ac = input.getAttribute('autoComplete') || input.getAttribute('autocomplete')
        expect(
          ac === 'off',
          `Search input missing autoComplete="off". Got: ${ac}`,
        ).toBe(true)
      })
    })
  })

  it('renderCustomFieldInput: все типы полей имеют autoComplete="off"', async () => {
    const CrmCustomersTab = (await import('./CrmCustomersTab')).default
    render(<CrmCustomersTab />)

    await waitFor(() => {
      expect(screen.getAllByText(/Добавить/i).length).toBeGreaterThanOrEqual(1)
    })

    fireEvent.click(getAddButton())

    await waitFor(() => {
      const form = document.querySelector('form.modal-form')
      expect(form).not.toBeNull()

      const allFormInputs = form.querySelectorAll('input:not([type="checkbox"]), select, textarea')
      allFormInputs.forEach((el) => {
        const ac = el.getAttribute('autoComplete') || el.getAttribute('autocomplete')
        expect(
          ac === 'off' || ac === 'new-password',
          `Form element <${el.tagName} type="${el.type}" placeholder="${el.placeholder}"> missing autoComplete. Got: ${ac}`,
        ).toBe(true)
      })
    })
  })
})
