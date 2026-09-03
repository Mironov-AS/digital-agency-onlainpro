let refreshing = null
const ACCESS_TOKEN_KEY = 'store_access_token'

export function saveAccessToken(token) {
  if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

function requestHeaders(headers = {}) {
  const nextHeaders = { 'Content-Type': 'application/json', ...headers }
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  if (token && !nextHeaders.Authorization && !nextHeaders.authorization) {
    nextHeaders.Authorization = `Bearer ${token}`
  }
  return nextHeaders
}

function uploadHeaders(headers = {}) {
  const nextHeaders = { ...headers }
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  if (token && !nextHeaders.Authorization && !nextHeaders.authorization) {
    nextHeaders.Authorization = `Bearer ${token}`
  }
  return nextHeaders
}

async function parseJsonError(res) {
  return res.json().catch(() => ({ error: res.statusText }))
}

export async function apiFetch(path, opts = {}) {
  const res = await fetch(path, {
    ...opts,
    credentials: 'include',
    headers: requestHeaders(opts.headers),
  })

  if (res.status === 401) {
    if (!refreshing) {
      refreshing = fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
        .finally(() => { refreshing = null })
    }
    const refreshRes = await refreshing
    if (!refreshRes.ok) {
      clearAccessToken()
      throw { error: 'Unauthorized', status: 401 }
    }
    const refreshData = await refreshRes.json().catch(() => null)
    saveAccessToken(refreshData?.accessToken)
    const retry = await fetch(path, {
      ...opts,
      credentials: 'include',
      headers: requestHeaders(opts.headers),
    })
    if (!retry.ok) throw await parseJsonError(retry)
    return retry.json()
  }

  if (!res.ok) throw await parseJsonError(res)
  return res.json()
}

export async function apiUpload(path, formData, opts = {}) {
  const res = await fetch(path, {
    ...opts,
    method: opts.method || 'POST',
    credentials: 'include',
    body: formData,
    headers: uploadHeaders(opts.headers),
  })

  if (res.status === 401) {
    if (!refreshing) {
      refreshing = fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
        .finally(() => { refreshing = null })
    }
    const refreshRes = await refreshing
    if (!refreshRes.ok) {
      clearAccessToken()
      throw { error: 'Unauthorized', status: 401 }
    }
    const refreshData = await refreshRes.json().catch(() => null)
    saveAccessToken(refreshData?.accessToken)
    const retry = await fetch(path, {
      ...opts,
      method: opts.method || 'POST',
      credentials: 'include',
      body: formData,
      headers: uploadHeaders(opts.headers),
    })
    if (!retry.ok) throw await parseJsonError(retry)
    return retry.json()
  }

  if (!res.ok) throw await parseJsonError(res)
  return res.json()
}
