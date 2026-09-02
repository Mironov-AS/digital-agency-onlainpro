const { resolveStoreClientId, requireStoreClientId } = require('./tenant');

describe('store tenant isolation', () => {
  test('client users are scoped by clientId and cannot override tenant from request data', () => {
    const req = {
      user: { role: 'client', userId: 'user-a', clientId: 'client-a' },
      query: { client_id: 'client-b' },
      body: { client_id: 'client-c' },
    };

    expect(resolveStoreClientId(req)).toBe('client-a');
  });

  test('client users without clientId are isolated by their own user id', () => {
    const req = {
      user: { role: 'client', userId: 'user-a' },
      query: { client_id: 'client-b' },
      body: { client_id: 'client-c' },
    };

    expect(resolveStoreClientId(req)).toBe('user-a');
  });

  test('admin users can choose a tenant explicitly for support operations', () => {
    const req = {
      user: { role: 'admin', userId: 'admin-a' },
      query: { client_id: 'client-b' },
      body: { client_id: 'client-c' },
    };

    expect(resolveStoreClientId(req)).toBe('client-b');
  });

  test('requests without any tenant identity are rejected', () => {
    expect(() => requireStoreClientId({ user: { role: 'client' } })).toThrow('Не удалось определить клиента магазина');
  });
});
