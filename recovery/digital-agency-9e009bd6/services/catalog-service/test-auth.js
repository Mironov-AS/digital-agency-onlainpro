require('dotenv').config()
const jwt = require('jsonwebtoken')
const http = require('http')

console.log('JWT_ACCESS_SECRET:', process.env.JWT_ACCESS_SECRET)

const ld = JSON.stringify({ email: 'admin@digital-agency.ru', password: 'Admin1234!' })
http.request({ host: 'localhost', port: 4001, path: '/api/auth/login', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': ld.length }
}, res => {
  let d = ''; res.on('data', c => d += c)
  res.on('end', () => {
    const cookieHdr = res.headers['set-cookie']?.find(c => c.startsWith('access_token='))
    const token = cookieHdr?.split(';')[0]?.replace('access_token=', '')
    console.log('Token:', token?.substring(0, 40) + '...')
    try {
      const p = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
      console.log('Verify OK:', p.email, p.role)
    } catch (e) { console.log('Verify FAIL:', e.message) }
  })
}).end(ld)
