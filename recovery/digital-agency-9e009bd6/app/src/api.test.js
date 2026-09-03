import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiFetch, clearAccessToken, saveAccessToken } from './api.js'

describe('apiFetch', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    clearAccessToken()
  })

  it('sends saved access token as an Authorization fallback', async () => {
    saveAccessToken('access-token')
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    })

    await apiFetch('/api/projects')

    expect(fetchMock).toHaveBeenCalledWith('/api/projects', expect.objectContaining({
      credentials: 'include',
      headers: expect.objectContaining({
        Authorization: 'Bearer access-token',
      }),
    }))
  })

  it('refreshes an expired cookie token, saves the new access token, and retries', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ error: 'Token expired' }) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ accessToken: 'fresh-token' }) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ([{ id: 'project-1' }]) })

    const data = await apiFetch('/api/projects')

    expect(data).toEqual([{ id: 'project-1' }])
    expect(fetchMock).toHaveBeenNthCalledWith(3, '/api/projects', expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: 'Bearer fresh-token',
      }),
    }))
  })
})
