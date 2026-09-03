export function authHeaders() {
  const token = localStorage.getItem('bookingToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) {
    localStorage.removeItem('bookingToken');
    localStorage.removeItem('bookingUser');
    window.location.href = import.meta.env.BASE_URL + 'login';
    return null;
  }
  return res;
}
