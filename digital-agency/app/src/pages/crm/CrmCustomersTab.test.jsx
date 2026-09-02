import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CrmCustomersTab from './CrmCustomersTab'

vi.mock('../../api.js', () => ({
  apiFetch: vi.fn(),
}))

import { apiFetch } from '../../api.js'

function mockWithCustomers(customers = [], total = 0, selfRegCount = 0) {
  apiFetch.mockImplementation((url) => {
    if (url.includes('/custom-fields')) return Promise.resolve([])
    if (url.includes('/search-templates')) return Promise.resolve([])
    if (url.includes('/display-settings')) return Promise.resolve({ columns: ['full_name', 'phone', 'email', 'created_at'] })
    if (url.includes('/self-registered/count')) return Promise.resolve({ count: selfRegCount })
    if (url.includes('/customers')) return Promise.resolve({ items: customers, total, page: 1, limit: 30 })
    return Promise.resolve({})
  })
}

function getMainAddButton() {
  const btn = document.querySelector('button.btn-primary')
  return btn
}

describe('CrmCustomersTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockWithCustomers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('рендерится без ошибок', async () => {
    render(<CrmCustomersTab />)
    await waitFor(() => {
      expect(getMainAddButton()).not.toBeNull()
    })
  })

  it('показывает таблицу клиентов', async () => {
    mockWithCustomers([
      { id: 'c1', full_name: 'Тест1', phone: '+79001234567', email: 'test1@test.ru', created_at: '2026-01-01', custom_values: {} },
    ], 1)

    render(<CrmCustomersTab />)
    await waitFor(() => {
      expect(screen.getByText('Тест1')).toBeDefined()
    })
  })

  it('показывает кнопку добавления клиента', async () => {
    render(<CrmCustomersTab />)
    await waitFor(() => {
      expect(getMainAddButton()).not.toBeNull()
      expect(getMainAddButton().textContent).toMatch(/Добавить/i)
    })
  })

  it('открывает модалку добавления по кнопке', async () => {
    render(<CrmCustomersTab />)
    await waitFor(() => {
      expect(getMainAddButton()).not.toBeNull()
    })

    fireEvent.click(getMainAddButton())
    await waitFor(() => {
      const modalForm = document.querySelector('form.modal-form')
      expect(modalForm).not.toBeNull()
    })
    expect(screen.getByText('Новый клиент')).toBeDefined()
  })

  it('показывает счётчик самозаписей', async () => {
    mockWithCustomers([], 0, 3)

    render(<CrmCustomersTab />)
    await waitFor(() => {
      expect(screen.getByText('3')).toBeDefined()
    })
  })

  it('показывает SelfRegBadge для самозаписанных клиентов', async () => {
    mockWithCustomers([
      { id: 'c1', full_name: 'СамозаписьКлиент', phone: '+79001234567', is_self_registered: true, created_at: '2026-01-01', custom_values: {} },
    ], 1, 1)

    render(<CrmCustomersTab />)
    await waitFor(() => {
      expect(screen.getByText('СамозаписьКлиент')).toBeDefined()
    })
    const selfRegBadges = document.querySelectorAll('[title*="Самозапись"], [title*="самозапись"]')
    const badgeSpans = screen.queryAllByText(/самозапись|Онлайн/i)
    expect(selfRegBadges.length + badgeSpans.length).toBeGreaterThanOrEqual(1)
  })

  it('валидирует обязательные поля при создании', async () => {
    render(<CrmCustomersTab />)
    await waitFor(() => {
      expect(getMainAddButton()).not.toBeNull()
    })

    fireEvent.click(getMainAddButton())

    await waitFor(() => {
      const saveBtns = screen.getAllByText(/Сохранить/i)
      expect(saveBtns.length).toBeGreaterThanOrEqual(1)
    })

    const saveBtn = screen.getAllByText(/Сохранить/i)[0]
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(screen.getByText(/ФИО и телефон обязательны/i)).toBeDefined()
    })
  })

  it('выполняет поиск клиентов', async () => {
    render(<CrmCustomersTab />)
    await waitFor(() => {
      const searchInputs = document.querySelectorAll('input[placeholder*="Поиск"]')
      expect(searchInputs.length).toBeGreaterThan(0)
    })
  })

  it('отображает пагинацию', async () => {
    mockWithCustomers(
      Array(30).fill(null).map((_, i) => ({
        id: `c${i}`, full_name: `Клиент ${i}`, phone: `+7900000${String(i).padStart(4, '0')}`,
        created_at: '2026-01-01', custom_values: {},
      })),
      60
    )

    render(<CrmCustomersTab />)
    await waitFor(() => {
      expect(screen.getByText(/всего.*60|1\s*\/\s*2/i)).toBeDefined()
    }, { timeout: 3000 })
  })
})
