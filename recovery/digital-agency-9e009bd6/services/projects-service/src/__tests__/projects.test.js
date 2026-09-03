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

describe('projects-service', () => {
  it('GET /api/health returns ok', async () => {
    const res = await request('http://localhost:4004').get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.service).toBe('projects-service')
  })

  it('GET /api/projects without auth returns 401', async () => {
    const res = await request('http://localhost:4004').get('/api/projects')
    expect(res.status).toBe(401)
  })

  it('POST /api/projects without auth returns 401', async () => {
    const res = await request('http://localhost:4004')
      .post('/api/projects')
      .send({ title: 'Test' })
    expect(res.status).toBe(401)
  })
})