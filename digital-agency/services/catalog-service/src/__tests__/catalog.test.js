const request = require('supertest')
const { spawn } = require('child_process')
const path = require('path')

let server
let proc

beforeAll(async () => {
  proc = spawn('node', ['src/server.js'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, JWT_ACCESS_SECRET: 'test-secret', JWT_REFRESH_SECRET: 'test-refresh-secret' },
    stdio: ['pipe', 'pipe', 'pipe'],
  })
  await new Promise(r => setTimeout(r, 2000))
})

afterAll(() => {
  proc.kill()
})

describe('catalog-service', () => {
  it('GET /api/health returns ok', async () => {
    const res = await request('http://localhost:4002').get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.service).toBe('catalog-service')
  })

  it('GET /api/catalog/services returns array', async () => {
    const res = await request('http://localhost:4002').get('/api/catalog/services')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /api/catalog/services returns only active by default', async () => {
    const res = await request('http://localhost:4002').get('/api/catalog/services')
    expect(res.status).toBe(200)
    res.body.forEach(s => expect(s.is_active).toBeTruthy())
  })

  it('GET /api/catalog/services?active_only=0 returns all', async () => {
    const res = await request('http://localhost:4002').get('/api/catalog/services?active_only=0')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /api/catalog/categories returns array', async () => {
    const res = await request('http://localhost:4002').get('/api/catalog/categories')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('POST /api/catalog/services without auth returns 401', async () => {
    const res = await request('http://localhost:4002')
      .post('/api/catalog/services')
      .send({ title: 'Test' })
    expect(res.status).toBe(401)
  })
})