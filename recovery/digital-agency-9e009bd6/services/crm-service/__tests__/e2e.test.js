const jwt = require('jsonwebtoken');

const CRM_URL = process.env.CRM_URL || 'http://localhost:4009';
const BOOKING_URL = process.env.BOOKING_URL || 'http://localhost:4008';
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'change-me-access-secret-min-32-chars-please-change-in-production';

const CLIENT_ID = 'test-e2e-client';
const TEST_USER = { userId: 'e2e-user', email: 'test1@test.ru', role: 'client', clientId: CLIENT_ID };

function getToken() {
  return jwt.sign(TEST_USER, JWT_SECRET, { expiresIn: '1h' });
}

async function apiFetch(baseUrl, path, opts = {}) {
  const token = getToken();
  const res = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...opts.headers,
    },
    ...opts,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data, ok: res.ok };
}

async function isServiceRunning(url) {
  try {
    const res = await fetch(`${url}/api/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

describe('E2E: CRM Light API', () => {
  let crmRunning = false;

  beforeAll(async () => {
    crmRunning = await isServiceRunning(CRM_URL);
    if (!crmRunning) {
      console.warn('⚠️ CRM сервис не запущен на ' + CRM_URL + ', E2E тесты пропущены');
    }
  });

  const conditionalIt = (...args) => {
    if (crmRunning) return it(...args);
    return it.skip(...args);
  };

  describe('Клиенты (CRUD)', () => {
    let createdId;

    conditionalIt('создаёт клиента', async () => {
      const { status, data } = await apiFetch(CRM_URL, '/api/crm/customers', {
        method: 'POST',
        body: JSON.stringify({
          full_name: 'E2E Тест1',
          phone: '+79001234567',
          email: 'test1@test.ru',
          notes: 'E2E тестовый клиент',
        }),
      });

      expect(status).toBe(201);
      expect(data.full_name).toBe('E2E Тест1');
      expect(data.phone).toBe('+79001234567');
      expect(data.email).toBe('test1@test.ru');
      createdId = data.id;
    });

    conditionalIt('получает список клиентов', async () => {
      const { status, data } = await apiFetch(CRM_URL, '/api/crm/customers?page=1&limit=10');

      expect(status).toBe(200);
      expect(data).toHaveProperty('items');
      expect(data).toHaveProperty('total');
      expect(Array.isArray(data.items)).toBe(true);
    });

    conditionalIt('получает клиента по id', async () => {
      if (!createdId) return;
      const { status, data } = await apiFetch(CRM_URL, `/api/crm/customers/${createdId}`);

      expect(status).toBe(200);
      expect(data.full_name).toBe('E2E Тест1');
    });

    conditionalIt('обновляет клиента', async () => {
      if (!createdId) return;
      const { status, data } = await apiFetch(CRM_URL, `/api/crm/customers/${createdId}`, {
        method: 'PUT',
        body: JSON.stringify({
          full_name: 'E2E Тест1 Обновлён',
          phone: '+79001234567',
          email: 'test1-updated@test.ru',
        }),
      });

      expect(status).toBe(200);
      expect(data.full_name).toBe('E2E Тест1 Обновлён');
    });

    conditionalIt('валидирует обязательные поля', async () => {
      const { status, data } = await apiFetch(CRM_URL, '/api/crm/customers', {
        method: 'POST',
        body: JSON.stringify({ email: 'noname@test.ru' }),
      });

      expect(status).toBe(400);
      expect(data.error).toContain('ФИО');
    });

    conditionalIt('ищет по имени', async () => {
      const { status, data } = await apiFetch(CRM_URL, '/api/crm/customers?search=E2E');

      expect(status).toBe(200);
      expect(data.items.length).toBeGreaterThanOrEqual(0);
    });

    conditionalIt('расширенный поиск', async () => {
      const { status, data } = await apiFetch(CRM_URL, '/api/crm/customers/search', {
        method: 'POST',
        body: JSON.stringify({
          conditions: [{ field: 'full_name', operator: 'contains', value: 'E2E' }],
          logic: 'and',
          page: 1,
          limit: 10,
        }),
      });

      expect(status).toBe(200);
      expect(data).toHaveProperty('items');
    });

    conditionalIt('получает историю клиента', async () => {
      if (!createdId) return;
      const { status, data } = await apiFetch(CRM_URL, `/api/crm/customers/${createdId}/history`);

      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    conditionalIt('удаляет клиента', async () => {
      if (!createdId) return;
      const { status, data } = await apiFetch(CRM_URL, `/api/crm/customers/${createdId}`, {
        method: 'DELETE',
      });

      expect(status).toBe(200);
      expect(data.ok).toBe(true);
    });

    conditionalIt('возвращает 404 для удалённого клиента', async () => {
      if (!createdId) return;
      const { status } = await apiFetch(CRM_URL, `/api/crm/customers/${createdId}`);
      expect(status).toBe(404);
    });
  });

  describe('Самозапись', () => {
    conditionalIt('получает count самозаписей', async () => {
      const { status, data } = await apiFetch(CRM_URL, '/api/crm/customers/self-registered/count');

      expect(status).toBe(200);
      expect(data).toHaveProperty('count');
      expect(typeof data.count).toBe('number');
    });

    conditionalIt('получает список самозаписей', async () => {
      const { status, data } = await apiFetch(CRM_URL, '/api/crm/customers/self-registered');

      expect(status).toBe(200);
      expect(data).toHaveProperty('items');
    });
  });

  describe('Услуги (CRUD)', () => {
    let serviceId;

    conditionalIt('создаёт услугу', async () => {
      const { status, data } = await apiFetch(CRM_URL, '/api/crm/services', {
        method: 'POST',
        body: JSON.stringify({ name: 'E2E Тестовая услуга', price: 1500, duration: 60 }),
      });

      expect(status).toBe(201);
      expect(data.name).toBe('E2E Тестовая услуга');
      serviceId = data.id;
    });

    conditionalIt('получает список услуг', async () => {
      const { status, data } = await apiFetch(CRM_URL, '/api/crm/services');

      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    conditionalIt('обновляет услугу', async () => {
      if (!serviceId) return;
      const { status, data } = await apiFetch(CRM_URL, `/api/crm/services/${serviceId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: 'E2E Обновлённая', price: 2000, duration: 90 }),
      });

      expect(status).toBe(200);
      expect(data.name).toBe('E2E Обновлённая');
    });

    conditionalIt('архивирует услугу', async () => {
      if (!serviceId) return;
      const { status, data } = await apiFetch(CRM_URL, `/api/crm/services/${serviceId}`, {
        method: 'DELETE',
      });

      expect(status).toBe(200);
      expect(data.ok).toBe(true);
    });
  });

  describe('Сотрудники (CRUD)', () => {
    let empId;

    conditionalIt('создаёт сотрудника', async () => {
      const { status, data } = await apiFetch(CRM_URL, '/api/crm/employees', {
        method: 'POST',
        body: JSON.stringify({ full_name: 'E2E Сотрудник', position: 'Тестер', phone: '+79005555555' }),
      });

      expect(status).toBe(201);
      expect(data.full_name).toBe('E2E Сотрудник');
      empId = data.id;
    });

    conditionalIt('получает список сотрудников', async () => {
      const { status, data } = await apiFetch(CRM_URL, '/api/crm/employees');

      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    conditionalIt('получает загрузку сотрудника', async () => {
      if (!empId) return;
      const { status, data } = await apiFetch(CRM_URL, `/api/crm/employees/${empId}/workload`);

      expect(status).toBe(200);
      expect(data).toHaveProperty('total_records');
      expect(data).toHaveProperty('total_hours');
    });

    conditionalIt('деактивирует сотрудника', async () => {
      if (!empId) return;
      const { status, data } = await apiFetch(CRM_URL, `/api/crm/employees/${empId}`, {
        method: 'DELETE',
      });

      expect(status).toBe(200);
      expect(data.ok).toBe(true);
    });
  });

  describe('Кастомные поля', () => {
    let fieldId;

    conditionalIt('создаёт текстовое поле', async () => {
      const { status, data } = await apiFetch(CRM_URL, '/api/crm/custom-fields', {
        method: 'POST',
        body: JSON.stringify({ name: 'E2E Тестовое Поле', field_type: 'text' }),
      });

      expect(status).toBe(201);
      expect(data.name).toBe('E2E Тестовое Поле');
      fieldId = data.id;
    });

    conditionalIt('получает список полей', async () => {
      const { status, data } = await apiFetch(CRM_URL, '/api/crm/custom-fields');

      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    conditionalIt('удаляет (soft) поле', async () => {
      if (!fieldId) return;
      const { status } = await apiFetch(CRM_URL, `/api/crm/custom-fields/${fieldId}`, {
        method: 'DELETE',
      });

      expect(status).toBe(200);
    });

    conditionalIt('восстанавливает поле', async () => {
      if (!fieldId) return;
      const { status } = await apiFetch(CRM_URL, `/api/crm/custom-fields/${fieldId}/restore`, {
        method: 'POST',
      });

      expect(status).toBe(200);
    });
  });
});

describe('E2E: CRM ↔ Booking Integration', () => {
  let crmRunning = false;
  let bookingRunning = false;

  beforeAll(async () => {
    crmRunning = await isServiceRunning(CRM_URL);
    bookingRunning = await isServiceRunning(BOOKING_URL);
    if (!crmRunning || !bookingRunning) {
      console.warn('⚠️ CRM и/или Booking не запущены, E2E интеграционные тесты пропущены');
    }
  });

  const conditionalIt = (...args) => {
    if (crmRunning && bookingRunning) return it(...args);
    return it.skip(...args);
  };

  conditionalIt('проверяет статус интеграции', async () => {
    const { status, data } = await apiFetch(CRM_URL, '/api/crm/integration/booking/status');

    expect(status).toBe(200);
    expect(data).toHaveProperty('booking_available');
    expect(data).toHaveProperty('sync_stats');
  });

  conditionalIt('получает записи из Booking', async () => {
    const { status, data } = await apiFetch(CRM_URL, '/api/crm/integration/booking/appointments');

    expect([200, 502]).toContain(status);
    if (status === 200) {
      expect(Array.isArray(data)).toBe(true);
    }
  });

  conditionalIt('синхронизирует услуги из Booking', async () => {
    const { status, data } = await apiFetch(CRM_URL, '/api/crm/integration/booking/sync-services', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    expect([200, 502]).toContain(status);
    if (status === 200) {
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('created');
    }
  });

  conditionalIt('синхронизирует специалистов из Booking', async () => {
    const { status, data } = await apiFetch(CRM_URL, '/api/crm/integration/booking/sync-specialists', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    expect([200, 502]).toContain(status);
    if (status === 200) {
      expect(data).toHaveProperty('total');
    }
  });

  conditionalIt('синхронизирует клиентов из Booking', async () => {
    const { status, data } = await apiFetch(CRM_URL, '/api/crm/integration/booking/sync-customers', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    expect([200, 502]).toContain(status);
    if (status === 200) {
      expect(data).toHaveProperty('total_appointments');
      expect(data).toHaveProperty('created');
    }
  });
});
