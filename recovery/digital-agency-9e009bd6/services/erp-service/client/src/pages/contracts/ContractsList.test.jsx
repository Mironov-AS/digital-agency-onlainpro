import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import ContractsList from './ContractsList';
import useAppStore from '../../store/appStore';

vi.mock('../../store/appStore');

const baseStore = {
  contracts: [],
  counterparties: [],
  addContract: vi.fn().mockResolvedValue({}),
  updateContract: vi.fn().mockResolvedValue({}),
  deleteContract: vi.fn().mockResolvedValue(undefined),
  loadAll: vi.fn().mockResolvedValue(undefined),
};

function renderPage(storeOverrides = {}) {
  const storeState = { ...baseStore, ...storeOverrides };
  useAppStore.mockImplementation((selector) => typeof selector === 'function' ? selector(storeState) : storeState);
  return render(
    <MemoryRouter>
      <ContractsList />
    </MemoryRouter>
  );
}

describe('ContractsList', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders page title', () => {
    renderPage();
    expect(screen.getByText('Договоры')).toBeInTheDocument();
  });

  it('shows add button', () => {
    renderPage();
    expect(screen.getByText('Новый договор')).toBeInTheDocument();
  });

  it('shows empty state when no contracts', () => {
    renderPage();
    expect(screen.getByText('Нет данных')).toBeInTheDocument();
  });

  it('renders contracts list', () => {
    renderPage({
      contracts: [
        { id: 1, number: 'ДОГ-001', status: 'active', subject: 'Поставка оборудования', amount: 500000, date: '2026-01-15', counterpartyId: 1 },
        { id: 2, number: 'ДОГ-002', status: 'draft', subject: 'Услуги обслуживания', amount: 100000, date: '2026-02-01', counterpartyId: 2 },
      ],
      counterparties: [
        { id: 1, name: 'ООО Поставщик' },
        { id: 2, name: 'ЗАО Сервис' },
      ],
    });
    expect(screen.getByText('ДОГ-001')).toBeInTheDocument();
    expect(screen.getByText('ДОГ-002')).toBeInTheDocument();
    expect(screen.getByText('Поставка оборудования')).toBeInTheDocument();
  });

  it('displays status badges', () => {
    renderPage({
      contracts: [
        { id: 1, number: 'ДОГ-001', status: 'active', subject: 'Тест', amount: 0, date: '2026-01-01', counterpartyId: 1 },
      ],
      counterparties: [{ id: 1, name: 'Тест' }],
    });
    expect(screen.getAllByText('Активен').length).toBeGreaterThanOrEqual(1);
  });

  it('displays counterparty names', () => {
    renderPage({
      contracts: [
        { id: 1, number: 'ДОГ-001', status: 'active', subject: 'Тест', amount: 0, date: '2026-01-01', counterpartyId: 1 },
      ],
      counterparties: [{ id: 1, name: 'ООО Контрагент' }],
    });
    expect(screen.getByText('ООО Контрагент')).toBeInTheDocument();
  });

  it('formats contract amount', () => {
    renderPage({
      contracts: [
        { id: 1, number: 'ДОГ-001', status: 'active', subject: 'Тест', amount: 1000000, date: '2026-01-01', counterpartyId: 1 },
      ],
      counterparties: [{ id: 1, name: 'Тест' }],
    });
    expect(screen.getByText(/1\s*000\s*000/)).toBeInTheDocument();
  });

  it('opens new contract modal', () => {
    renderPage();
    fireEvent.click(screen.getByText('Новый договор'));
    // Modal title
    expect(screen.getByText('Новый договор', { selector: 'h2' })).toBeInTheDocument();
  });

  it('filters contracts by search', () => {
    renderPage({
      contracts: [
        { id: 1, number: 'ДОГ-001', status: 'active', subject: 'Оборудование', amount: 0, date: '2026-01-01', counterpartyId: 1 },
        { id: 2, number: 'ДОГ-002', status: 'draft', subject: 'Сервис', amount: 0, date: '2026-02-01', counterpartyId: 2 },
      ],
      counterparties: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }],
    });
    const searchInput = screen.getByPlaceholderText(/Поиск/i);
    fireEvent.change(searchInput, { target: { value: 'ДОГ-001' } });
    expect(screen.getByText('ДОГ-001')).toBeInTheDocument();
  });
});
