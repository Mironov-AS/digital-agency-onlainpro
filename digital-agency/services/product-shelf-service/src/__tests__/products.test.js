const request = require('supertest')
const { spawn } = require('child_process')
const path = require('path')

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

describe('product-shelf-service', () => {
  it('GET /api/health returns ok', async () => {
    const res = await request('http://localhost:4006').get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.service).toBe('product-shelf-service')
  })

  it('GET /api/product-shelf/products returns array (public)', async () => {
    const res = await request('http://localhost:4006').get('/api/product-shelf/products')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('POST /api/product-shelf/products without auth returns 401', async () => {
    const res = await request('http://localhost:4006')
      .post('/api/product-shelf/products')
      .send({ name: 'Test' })
    expect(res.status).toBe(401)
  })
})