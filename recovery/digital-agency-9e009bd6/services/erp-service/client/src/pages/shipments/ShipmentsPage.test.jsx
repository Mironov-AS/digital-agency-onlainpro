import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import ShipmentsPage from './ShipmentsPage';
import useAppStore from '../../store/appStore';

vi.mock('../../store/appStore');

const mockAddShipment = vi.fn().mockResolvedValue({});
const mockConfirmShipment = vi.fn().mockResolvedValue({});
const mockAddDriver = vi.fn().mockResolvedValue({});

const baseStore = {
  shipments: [],
  orders: [],
  contracts: [],
  counterparties: [],
  drivers: [],
  currentService: null,
  addShipment: mockAddShipment,
  confirmShipment: mockConfirmShipment,
  addDriver: mockAddDriver,
};

function renderPage(storeOverrides = {}) {
  const storeState = { ...baseStore, ...storeOverrides };
  useAppStore.mockImplementation((selector) => typeof selector === 'function' ? selector(storeState) : storeState);
  return render(
    <MemoryRouter>
      <ShipmentsPage />
    </MemoryRouter>
  );
}

describe('ShipmentsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders page title', () => {
    renderPage();
    expect(screen.getByText('Отгрузки')).toBeInTheDocument();
  });

  it('shows empty state when no shipments', () => {
    renderPage();
    expect(screen.getByText('Отгрузок пока нет')).toBeInTheDocument();
  });

  it('renders shipments list', () => {
    renderPage({
      shipments: [
        { id: 1, invoiceNumber: 'INV-001', amount: 50000, paidAmount: 0, status: 'shipped', date: '2026-04-01', paymentDueDate: '2026-05-01', counterpartyId: 1, orderId: 1 },
        { id: 2, invoiceNumber: 'INV-002', amount: 30000, paidAmount: 30000, status: 'shipped', date: '2026-04-02', paymentDueDate: '2026-05-02', counterpartyId: 2, orderId: 2 },
      ],
      counterparties: [
        { id: 1, name: 'ООО Тест' },
        { id: 2, name: 'ЗАО Пример' },
      ],
      orders: [
        { id: 1, number: 'ORD-001' },
        { id: 2, number: 'ORD-002' },
      ],
    });
    expect(screen.getByText('INV-001')).toBeInTheDocument();
    expect(screen.getByText('INV-002')).toBeInTheDocument();
  });

  it('shows KPI stat cards', () => {
    renderPage();
    expect(screen.getByText('Всего отгружено')).toBeInTheDocument();
    expect(screen.getByText('Ожидает оплаты')).toBeInTheDocument();
    expect(screen.getByText('Просрочено')).toBeInTheDocument();
  });

  it('shows overdue indicator for overdue payments', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    renderPage({
      shipments: [
        { id: 1, invoiceNumber: 'INV-001', amount: 50000, paidAmount: 0, status: 'shipped', date: '2026-04-01', paymentDueDate: yesterday, counterpartyId: 1, orderId: 1 },
      ],
      counterparties: [{ id: 1, name: 'ООО Тест' }],
      orders: [{ id: 1, number: 'ORD-001' }],
    });
    expect(screen.getByText('Просрочено')).toBeInTheDocument();
  });

  it('switches between list and calendar tabs', () => {
    renderPage();
    const calendarBtn = screen.getByText('Календарь отгрузок');
    fireEvent.click(calendarBtn);
    expect(screen.getByText('Календарь отгрузок')).toBeInTheDocument();
  });

  it('shows list tab by default', () => {
    renderPage();
    expect(screen.getByText('Список отгрузок')).toBeInTheDocument();
    expect(screen.getByText('Календарь отгрузок')).toBeInTheDocument();
  });
});
