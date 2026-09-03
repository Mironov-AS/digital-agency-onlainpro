/**
 * Комплексное тестирование digital-agency
 * Запуск: node test-suite.js
 */
const http = require('http')

let passed = 0
let failed = 0
let cookie = ''

function req(opts, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null
    const options = {
      host: 'localhost',
      headers: { 'Content-Type': 'application/json', ...(cookie && { Cookie: cookie }), ...(data && { 'Content-Length': Buffer.byteLength(data) }) },
      ...opts,
    }
    const r = http.request(options, res => {
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => {
        let json
        try { json = JSON.parse(d) } catch { json = d }
        resolve({ status: res.statusCode, body: json, headers: res.headers })
      })
    })
    r.on('error', reject)
    if (data) r.write(data)
    r.end()
  })
}

function assert(name, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ ${name}`)
    passed++
  } else {
    console.log(`  ❌ ${name}${detail ? ' — ' + detail : ''}`)
    failed++
  }
}

async function run() {
  console.log('\n══════════════════════════════════════════════')
  console.log('  ТЕСТИРОВАНИЕ digital-agency')
  console.log('══════════════════════════════════════════════\n')

  // ── 1. ИНФРАСТРУКТУРА ──────────────────────────────────────────────
  console.log('▶ 1. Инфраструктура')

  let r = await req({ port: 4001, path: '/api/health' })
  assert('auth-service health', r.status === 200 && r.body.status === 'ok')

  r = await req({ port: 4002, path: '/api/health' })
  assert('catalog-service health', r.status === 200 && r.body.status === 'ok')

  r = await req({ port: 5200, path: '/' })
  assert('landing page (5200)', r.status === 200)

  r = await req({ port: 5201, path: '/app/' })
  assert('app dashboard (5201)', r.status === 200 || r.status === 302)

  // ── 2. АВТОРИЗАЦИЯ ────────────────────────────────────────────────
  console.log('\n▶ 2. Авторизация')

  // неверный пароль
  r = await req({ port: 4001, path: '/api/auth/login', method: 'POST' }, { email: 'admin@digital-agency.ru', password: 'wrong' })
  assert('логин с неверным паролем → 401', r.status === 401)

  // несуществующий пользователь
  r = await req({ port: 4001, path: '/api/auth/login', method: 'POST' }, { email: 'nobody@test.ru', password: 'pass' })
  assert('логин несуществующего → 401', r.status === 401)

  // верные credentials
  r = await req({ port: 4001, path: '/api/auth/login', method: 'POST' }, { email: 'admin@digital-agency.ru', password: 'Admin1234!' })
  assert('логин admin → 200', r.status === 200)
  assert('логин возвращает user.email', r.body.user?.email === 'admin@digital-agency.ru')
  assert('логин возвращает user.role=admin', r.body.user?.role === 'admin')
  const accessCookie = r.headers['set-cookie']?.find(c => c.startsWith('access_token='))
  const refreshCookie = r.headers['set-cookie']?.find(c => c.startsWith('refresh_token='))
  assert('set-cookie: access_token', !!accessCookie)
  assert('set-cookie: refresh_token', !!refreshCookie)
  assert('access_token httpOnly', accessCookie?.includes('HttpOnly'))
  cookie = accessCookie?.split(';')[0] + '; ' + refreshCookie?.split(';')[0]

  // /me с токеном
  r = await req({ port: 4001, path: '/api/auth/me' })
  assert('/api/auth/me → 200', r.status === 200)
  assert('/api/auth/me.email верный', r.body.email === 'admin@digital-agency.ru')

  // refresh token
  const refreshOnlyCookie = refreshCookie?.split(';')[0]
  const savedCookie = cookie
  cookie = refreshOnlyCookie  // только refresh_token
  r = await req({ port: 4001, path: '/api/auth/refresh', method: 'POST' })
  assert('refresh token → 200', r.status === 200)
  const newAccess = r.headers['set-cookie']?.find(c => c.startsWith('access_token='))
  assert('refresh выдаёт новый access_token', !!newAccess)
  cookie = savedCookie  // вернём оба

  // ── 3. CATALOG: КАТЕГОРИИ ─────────────────────────────────────────
  console.log('\n▶ 3. Catalog — категории')

  r = await req({ port: 4002, path: '/api/catalog/categories' })
  assert('GET categories → 200', r.status === 200)
  assert('categories — массив', Array.isArray(r.body))
  assert('seed: 3 дефолтных категории', r.body.length >= 3)
  assert('seed: есть websites', r.body.some(c => c.value === 'websites'))
  assert('seed: есть webapps', r.body.some(c => c.value === 'webapps'))
  assert('seed: есть automation', r.body.some(c => c.value === 'automation'))

  // POST без авторизации
  const noAuthCookie = cookie
  cookie = ''
  r = await req({ port: 4002, path: '/api/catalog/categories', method: 'POST' }, { value: 'test', label: 'Тест', color: '#ff0000' })
  assert('POST categories без auth → 401', r.status === 401)
  cookie = noAuthCookie

  // POST создать категорию
  r = await req({ port: 4002, path: '/api/catalog/categories', method: 'POST' }, { value: 'test-cat', label: 'Тестовая категория', color: '#ff0000', sort_order: 99 })
  assert('POST categories → 201', r.status === 201, JSON.stringify(r.body))
  assert('created category.value', r.body.value === 'test-cat')
  assert('created category.label', r.body.label === 'Тестовая категория')
  const newCatId = r.body.id

  // дублирующий slug
  r = await req({ port: 4002, path: '/api/catalog/categories', method: 'POST' }, { value: 'test-cat', label: 'Дубль', color: '#fff' })
  assert('POST duplicate slug → 409', r.status === 409)

  // PUT переименовать
  r = await req({ port: 4002, path: '/api/catalog/categories/' + newCatId, method: 'PUT' }, { label: 'Переименованная', color: '#00ff00', sort_order: 99 })
  assert('PUT category → 200', r.status === 200, JSON.stringify(r.body))
  assert('PUT category label изменился', r.body.label === 'Переименованная')

  // DELETE категорию (пустую)
  r = await req({ port: 4002, path: '/api/catalog/categories/' + newCatId, method: 'DELETE' })
  assert('DELETE empty category → 200', r.status === 200)

  // ── 4. CATALOG: УСЛУГИ ────────────────────────────────────────────
  console.log('\n▶ 4. Catalog — услуги')

  r = await req({ port: 4002, path: '/api/catalog/services' })
  assert('GET services (public) → 200', r.status === 200)
  assert('services — массив', Array.isArray(r.body))
  assert('seed: есть услуги', r.body.length > 0)
  assert('seed: только активные (active_only=1 по умолч)', r.body.every(s => s.is_active === 1))

  r = await req({ port: 4002, path: '/api/catalog/services?active_only=0' })
  assert('GET services?active_only=0 → 200', r.status === 200)
  assert('active_only=0 возвращает все', r.body.length > 0)
  const initialCount = r.body.length

  // POST создать услугу
  r = await req({ port: 4002, path: '/api/catalog/services', method: 'POST' }, {
    title: 'Тест услуга', description: 'Описание', price: 10000,
    price_type: 'from', price_label: 'от 10 000 ₽', category: 'websites',
    is_active: 1, sort_order: 99
  })
  assert('POST service → 201', r.status === 201, JSON.stringify(r.body))
  assert('created service.title', r.body.title === 'Тест услуга')
  const newSvcId = r.body.id

  // PUT обновить услугу
  r = await req({ port: 4002, path: '/api/catalog/services/' + newSvcId, method: 'PUT' }, { title: 'Тест обновлён', is_active: 0 })
  assert('PUT service → 200', r.status === 200)
  assert('PUT service title изменился', r.body.title === 'Тест обновлён')
  assert('PUT service is_active=0', r.body.is_active === 0)

  // GET single service
  r = await req({ port: 4002, path: '/api/catalog/services/' + newSvcId })
  assert('GET /services/:id → 200', r.status === 200)
  assert('GET /services/:id.title верный', r.body.title === 'Тест обновлён')

  // DELETE услугу с категорией которая ещё нужна
  const websitesCat = (await req({ port: 4002, path: '/api/catalog/categories' })).body.find(c => c.value === 'websites')
  r = await req({ port: 4002, path: '/api/catalog/categories/' + websitesCat.id, method: 'DELETE' })
  assert('DELETE category с услугами → 409', r.status === 409, r.body.error)

  // DELETE тестовую услугу
  r = await req({ port: 4002, path: '/api/catalog/services/' + newSvcId, method: 'DELETE' })
  assert('DELETE service → 200', r.status === 200)

  r = await req({ port: 4002, path: '/api/catalog/services/' + newSvcId })
  assert('GET deleted service → 404', r.status === 404)

  r = await req({ port: 4002, path: '/api/catalog/services?active_only=0' })
  assert('количество услуг вернулось к исходному', r.body.length === initialCount)

  // ── 5. БЕЗОПАСНОСТЬ ───────────────────────────────────────────────
  console.log('\n▶ 5. Безопасность')

  cookie = ''
  r = await req({ port: 4002, path: '/api/catalog/services', method: 'POST' }, { title: 'hack' })
  assert('POST service без auth → 401', r.status === 401)
  r = await req({ port: 4002, path: '/api/catalog/services/fake-id', method: 'DELETE' })
  assert('DELETE service без auth → 401', r.status === 401)
  r = await req({ port: 4002, path: '/api/catalog/categories', method: 'POST' }, { value: 'x', label: 'x' })
  assert('POST category без auth → 401', r.status === 401)

  // поддельный токен
  cookie = 'access_token=fake.token.here'
  r = await req({ port: 4002, path: '/api/catalog/services', method: 'POST' }, { title: 'hack' })
  assert('POST service с фейк-токеном → 401', r.status === 401)

  // ── 6. LOGOUT ─────────────────────────────────────────────────────
  console.log('\n▶ 6. Logout')
  r = await req({ port: 4001, path: '/api/auth/login', method: 'POST' }, { email: 'admin@digital-agency.ru', password: 'Admin1234!' })
  cookie = r.headers['set-cookie']?.find(c => c.startsWith('access_token=')).split(';')[0]
  r = await req({ port: 4001, path: '/api/auth/logout', method: 'POST' })
  assert('logout → 200', r.status === 200)
  const clearedCookie = r.headers['set-cookie']?.find(c => c.startsWith('access_token='))
  assert('logout очищает access_token cookie', clearedCookie?.includes('Expires=Thu, 01 Jan 1970') || clearedCookie?.includes('Max-Age=0'))

  // ── ИТОГ ──────────────────────────────────────────────────────────
  const total = passed + failed
  console.log('\n══════════════════════════════════════════════')
  console.log(`  ИТОГ: ${passed}/${total} тестов прошли`)
  if (failed > 0) console.log(`  ⚠️  Провалено: ${failed}`)
  console.log('══════════════════════════════════════════════\n')
  process.exit(failed > 0 ? 1 : 0)
}

run().catch(e => { console.error('Ошибка выполнения тестов:', e.message); process.exit(2) })
