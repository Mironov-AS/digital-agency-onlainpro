import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import OrdersList from './OrdersList';
import useAppStore from '../../store/appStore';

vi.mock('../../store/appStore');

const SALES_SERVICE_ID = 'sales';
const WAREHOUSE_SERVICE_ID = 'warehouse';

const baseStore = {
  orders: [],
  contracts: [],
  counterparties: [],
  nomenclature: [],
  currentService: SALES_SERVICE_ID,
  addOrder: vi.fn().mockResolvedValue({}),
  updateOrder: vi.fn().mockResolvedValue({}),
  deleteOrder: vi.fn().mockResolvedValue(undefined),
};

function renderPage(storeOverrides = {}) {
  const storeState = { ...baseStore, ...storeOverrides };
  useAppStore.mockImplementation((selector) => typeof selector === 'function' ? selector(storeState) : storeState);
  return render(
    <MemoryRouter>
      <OrdersList />
    </MemoryRouter>
  );
}

describe('OrdersList', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders page title', () => {
    renderPage();
    expect(screen.getByText('Заказы')).toBeInTheDocument();
  });

  it('shows add button for sales service', () => {
    renderPage();
    expect(screen.getByText('Новый заказ')).toBeInTheDocument();
  });

  it('shows empty state when no orders', () => {
    renderPage();
    expect(screen.getByText('Нет данных')).toBeInTheDocument();
  });

  it('renders orders list', () => {
    renderPage({
      orders: [
        { id: 1, number: 'ORD-001', status: 'planned', totalAmount: 50000, date: '2026-04-01', priority: 'medium', specification: [] },
        { id: 2, number: 'ORD-002', status: 'completed', totalAmount: 120000, date: '2026-04-02', priority: 'high', specification: [] },
      ],
    });
    expect(screen.getByText('ORD-001')).toBeInTheDocument();
    expect(screen.getByText('ORD-002')).toBeInTheDocument();
  });

  it('displays status badges', () => {
    renderPage({
      orders: [
        { id: 1, number: 'ORD-001', status: 'planned', totalAmount: 0, date: '2026-04-01', priority: 'medium', specification: [] },
      ],
    });
    expect(screen.getAllByText('Запланирован').length).toBeGreaterThanOrEqual(1);
  });

  it('displays priority badges', () => {
    renderPage({
      orders: [
        { id: 1, number: 'ORD-001', status: 'planned', totalAmount: 0, date: '2026-04-01', priority: 'high', specification: [] },
      ],
    });
    expect(screen.getAllByText('Высокий').length).toBeGreaterThanOrEqual(1);
  });

  it('formats total amount', () => {
    renderPage({
      orders: [
        { id: 1, number: 'ORD-001', status: 'planned', totalAmount: 150000, date: '2026-04-01', priority: 'medium', specification: [] },
      ],
    });
    expect(screen.getByText(/150/)).toBeInTheDocument();
  });

  it('opens new order modal on button click', () => {
    renderPage();
    fireEvent.click(screen.getByText('Новый заказ'));
    expect(screen.getByText('Новый заказ', { selector: 'h2' })).toBeInTheDocument();
  });

  it('filters orders by search', () => {
    renderPage({
      orders: [
        { id: 1, number: 'ORD-001', status: 'planned', totalAmount: 0, date: '2026-04-01', priority: 'medium', specification: [] },
        { id: 2, number: 'ORD-002', status: 'completed', totalAmount: 0, date: '2026-04-02', priority: 'low', specification: [] },
      ],
    });
    const searchInput = screen.getByPlaceholderText(/Поиск/i);
    fireEvent.change(searchInput, { target: { value: 'ORD-001' } });
    expect(screen.getByText('ORD-001')).toBeInTheDocument();
  });

  it('shows filter controls', () => {
    renderPage();
    expect(screen.getByText(/Все статусы/i)).toBeInTheDocument();
  });
});
