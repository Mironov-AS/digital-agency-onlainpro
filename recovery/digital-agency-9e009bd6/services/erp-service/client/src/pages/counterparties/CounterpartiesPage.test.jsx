import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import CounterpartiesPage from './CounterpartiesPage';
import useAppStore from '../../store/appStore';

vi.mock('../../store/appStore');

const mockAddCounterparty = vi.fn().mockResolvedValue({});
const mockUpdateCounterparty = vi.fn().mockResolvedValue({});
const mockDeleteCounterparty = vi.fn().mockResolvedValue(undefined);

const baseStore = {
  counterparties: [],
  addCounterparty: mockAddCounterparty,
  updateCounterparty: mockUpdateCounterparty,
  deleteCounterparty: mockDeleteCounterparty,
};

function renderPage(storeOverrides = {}) {
  const storeState = { ...baseStore, ...storeOverrides };
  useAppStore.mockImplementation((selector) => typeof selector === 'function' ? selector(storeState) : storeState);
  return render(
    <MemoryRouter>
      <CounterpartiesPage />
    </MemoryRouter>
  );
}

describe('CounterpartiesPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders page title', () => {
    renderPage();
    expect(screen.getByText('Контрагенты')).toBeInTheDocument();
  });

  it('shows add button', () => {
    renderPage();
    expect(screen.getByText('Добавить контрагента')).toBeInTheDocument();
  });

  it('shows empty state when no counterparties', () => {
    renderPage();
    expect(screen.getByText('Контрагентов пока нет')).toBeInTheDocument();
  });

  it('renders counterparties list', () => {
    renderPage({
      counterparties: [
        { id: 1, name: 'ООО Рога и Копыта', inn: '1234567890', priority: 'high', phone: '+79991234567', email: 'test@test.ru', address: 'Москва' },
        { id: 2, name: 'ЗАО Пример', inn: '9876543210', priority: 'medium', phone: '', email: '', address: '' },
      ],
    });
    expect(screen.getByText('ООО Рога и Копыта')).toBeInTheDocument();
    expect(screen.getByText('ЗАО Пример')).toBeInTheDocument();
  });

  it('shows priority badges', () => {
    renderPage({
      counterparties: [
        { id: 1, name: 'Высокий приоритет', priority: 'high', inn: '', phone: '', email: '', address: '' },
        { id: 2, name: 'Средний приоритет', priority: 'medium', inn: '', phone: '', email: '', address: '' },
        { id: 3, name: 'Низкий приоритет', priority: 'low', inn: '', phone: '', email: '', address: '' },
      ],
    });
    // Multiple elements may have these texts (badge + filter dropdown option), so use getAllByText
    expect(screen.getAllByText('Высокий').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Средний').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Низкий').length).toBeGreaterThanOrEqual(1);
  });

  it('opens add modal on button click', async () => {
    renderPage();
    fireEvent.click(screen.getByText('Добавить контрагента'));
    expect(screen.getByText('Новый контрагент')).toBeInTheDocument();
  });

  it('validates required name field', async () => {
    renderPage();
    fireEvent.click(screen.getByText('Добавить контрагента'));
    const saveBtn = screen.getByText('Создать');
    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(screen.getByText('Название обязательно')).toBeInTheDocument();
    });
  });

  it('validates INN format', async () => {
    renderPage();
    fireEvent.click(screen.getByText('Добавить контрагента'));
    const innInput = screen.getByPlaceholderText('7701234567');
    fireEvent.change(innInput, { target: { value: '123' } });
    const saveBtn = screen.getByText('Создать');
    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(screen.getByText(/ИНН должен содержать/)).toBeInTheDocument();
    });
  });

  it('searches counterparties', () => {
    renderPage({
      counterparties: [
        { id: 1, name: 'ООО Рога', priority: 'medium', inn: '', phone: '', email: '', address: '' },
        { id: 2, name: 'ЗАО Пример', priority: 'medium', inn: '', phone: '', email: '', address: '' },
      ],
    });
    const searchInput = screen.getByPlaceholderText(/Поиск/);
    fireEvent.change(searchInput, { target: { value: 'Рога' } });
    expect(screen.getByText('ООО Рога')).toBeInTheDocument();
    expect(screen.queryByText('ЗАО Пример')).not.toBeInTheDocument();
  });

  it('shows edit and delete buttons for each counterparty', () => {
    renderPage({
      counterparties: [
        { id: 1, name: 'ООО Тест', priority: 'medium', inn: '', phone: '', email: '', address: '' },
      ],
    });
    expect(screen.getByTitle('Редактировать')).toBeInTheDocument();
    expect(screen.getByTitle('Удалить')).toBeInTheDocument();
  });
});
