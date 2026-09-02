(function() {
  'use strict';
  var script = document.currentScript;
  if (!script) return;
  var CLIENT_ID = script.getAttribute('data-client-id');
  var API_BASE = script.getAttribute('data-api-url') || script.src.replace(/\/api\/booking\/widget\.js.*$/, '');
  var API = API_BASE + '/api/booking/public/' + encodeURIComponent(CLIENT_ID);
  var ACCENT = '#0d9488';
  var PREFIX = 'obw';

  if (!CLIENT_ID) { console.warn('Booking widget: data-client-id is required'); return; }

  var css = '\
@keyframes ' + PREFIX + '-pulse{0%,100%{box-shadow:0 4px 16px rgba(13,148,136,.35)}50%{box-shadow:0 4px 24px rgba(13,148,136,.6),0 0 0 8px rgba(13,148,136,.1)}}\
@keyframes ' + PREFIX + '-fadein{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}\
.' + PREFIX + '-fab{position:fixed;bottom:24px;right:24px;height:52px;border-radius:26px;background:linear-gradient(135deg,' + ACCENT + ' 0%,#0f766e 100%);color:#fff;border:none;cursor:pointer;box-shadow:0 4px 16px rgba(13,148,136,.35);z-index:999990;display:flex;align-items:center;gap:8px;padding:0 20px 0 16px;font-family:system-ui,-apple-system,sans-serif;font-size:15px;font-weight:600;letter-spacing:.01em;transition:transform .2s,box-shadow .2s;animation:' + PREFIX + '-pulse 2.5s ease-in-out infinite,' + PREFIX + '-fadein .4s ease-out}\
.' + PREFIX + '-fab:hover{transform:scale(1.05);box-shadow:0 6px 24px rgba(13,148,136,.5);animation:none}\
.' + PREFIX + '-fab:active{transform:scale(.97)}\
.' + PREFIX + '-fab svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}\
.' + PREFIX + '-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:999991;display:flex;align-items:flex-end;justify-content:flex-end;padding:16px;opacity:0;pointer-events:none;transition:opacity .25s}\
.' + PREFIX + '-overlay.open{opacity:1;pointer-events:auto}\
.' + PREFIX + '-panel{width:380px;max-width:calc(100vw - 32px);max-height:calc(100vh - 32px);background:#fff;border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,.2);display:flex;flex-direction:column;overflow:hidden;transform:translateY(24px);transition:transform .25s}\
.' + PREFIX + '-overlay.open .' + PREFIX + '-panel{transform:translateY(0)}\
.' + PREFIX + '-head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;background:' + ACCENT + ';color:#fff}\
.' + PREFIX + '-head h3{margin:0;font-size:16px;font-weight:600}\
.' + PREFIX + '-close{background:none;border:none;color:#fff;cursor:pointer;padding:4px;opacity:.8;font-size:20px;line-height:1}\
.' + PREFIX + '-close:hover{opacity:1}\
.' + PREFIX + '-body{flex:1;overflow-y:auto;padding:20px}\
.' + PREFIX + '-step{display:none}.' + PREFIX + '-step.active{display:block}\
.' + PREFIX + '-label{display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:4px}\
.' + PREFIX + '-input{width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;box-sizing:border-box;outline:none;transition:border-color .15s}\
.' + PREFIX + '-input:focus{border-color:' + ACCENT + '}\
.' + PREFIX + '-svc-list{list-style:none;padding:0;margin:0}\
.' + PREFIX + '-svc-item{padding:12px;border:2px solid #e5e7eb;border-radius:10px;margin-bottom:8px;cursor:pointer;transition:border-color .15s,background .15s}\
.' + PREFIX + '-svc-item:hover{border-color:' + ACCENT + '}\
.' + PREFIX + '-svc-item.sel{border-color:' + ACCENT + ';background:#f0fdfa}\
.' + PREFIX + '-svc-name{font-weight:600;font-size:14px;color:#111827}\
.' + PREFIX + '-svc-meta{font-size:12px;color:#6b7280;margin-top:2px}\
.' + PREFIX + '-slots{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}\
.' + PREFIX + '-slot{padding:8px 4px;text-align:center;border:1px solid #d1d5db;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;transition:all .15s}\
.' + PREFIX + '-slot:hover{border-color:' + ACCENT + ';color:' + ACCENT + '}\
.' + PREFIX + '-slot.sel{background:' + ACCENT + ';color:#fff;border-color:' + ACCENT + '}\
.' + PREFIX + '-btn{width:100%;padding:12px;border:none;border-radius:10px;background:' + ACCENT + ';color:#fff;font-size:15px;font-weight:600;cursor:pointer;margin-top:16px;transition:opacity .15s}\
.' + PREFIX + '-btn:hover{opacity:.9}\
.' + PREFIX + '-btn:disabled{opacity:.5;cursor:not-allowed}\
.' + PREFIX + '-msg{text-align:center;padding:24px 0}\
.' + PREFIX + '-msg svg{width:48px;height:48px;stroke:' + ACCENT + ';fill:none;margin:0 auto 12px;display:block}\
.' + PREFIX + '-msg h4{margin:0 0 8px;font-size:16px;color:#111827}\
.' + PREFIX + '-msg p{margin:0;font-size:14px;color:#6b7280}\
.' + PREFIX + '-err{background:#fef2f2;color:#dc2626;padding:8px 12px;border-radius:8px;font-size:13px;margin-top:8px}\
.' + PREFIX + '-field{margin-bottom:12px}\
.' + PREFIX + '-empty{text-align:center;padding:24px;color:#9ca3af;font-size:14px}\
.' + PREFIX + '-loading{text-align:center;padding:20px;color:#9ca3af}\
@media(max-width:480px){.' + PREFIX + '-panel{width:100%;max-width:100%;border-radius:16px 16px 0 0}.' + PREFIX + '-overlay{padding:0;align-items:flex-end}.' + PREFIX + '-fab{bottom:16px;right:16px}}\
';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var state = { step: 0, services: [], service: null, date: '', slots: [], slot: '', name: '', phone: '', comment: '', loading: false, error: '', done: false, result: null };

  var fab = document.createElement('button');
  fab.className = PREFIX + '-fab';
  fab.setAttribute('aria-label', 'Записаться');
  fab.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg><span>Записаться</span>';
  document.body.appendChild(fab);

  var overlay = document.createElement('div');
  overlay.className = PREFIX + '-overlay';
  overlay.innerHTML = '<div class="' + PREFIX + '-panel">' +
    '<div class="' + PREFIX + '-head"><h3>Запись на приём</h3><button class="' + PREFIX + '-close" aria-label="Закрыть">&times;</button></div>' +
    '<div class="' + PREFIX + '-body" id="' + PREFIX + '-content"></div>' +
    '</div>';
  document.body.appendChild(overlay);

  var content = document.getElementById(PREFIX + '-content');

  fab.addEventListener('click', function() { openWidget(); });
  overlay.addEventListener('click', function(e) { if (e.target === overlay) closeWidget(); });
  overlay.querySelector('.' + PREFIX + '-close').addEventListener('click', closeWidget);

  function openWidget() {
    state = { step: 0, services: [], service: null, date: '', slots: [], slot: '', name: '', phone: '', comment: '', loading: false, error: '', done: false, result: null };
    overlay.classList.add('open');
    fab.style.display = 'none';
    loadServices();
  }

  function closeWidget() {
    overlay.classList.remove('open');
    fab.style.display = 'flex';
  }

  function render() {
    if (state.done) { renderDone(); return; }
    if (state.step === 0) renderStep0();
    else if (state.step === 1) renderStep1();
    else if (state.step === 2) renderStep2();
  }

  function renderStep0() {
    if (state.loading) { content.innerHTML = '<div class="' + PREFIX + '-loading">Загрузка услуг...</div>'; return; }
    if (!state.services.length) { content.innerHTML = '<div class="' + PREFIX + '-empty">Нет доступных услуг</div>'; return; }
    var html = '<ul class="' + PREFIX + '-svc-list">';
    state.services.forEach(function(s, i) {
      var sel = state.service && state.service.id === s.id ? ' sel' : '';
      var dur = s.duration >= 60 ? Math.floor(s.duration/60) + ' ч' + (s.duration%60 ? ' ' + s.duration%60 + ' мин' : '') : s.duration + ' мин';
      var price = s.price > 0 ? Number(s.price).toLocaleString('ru-RU') + ' ₽' : '';
      html += '<li class="' + PREFIX + '-svc-item' + sel + '" data-idx="' + i + '">';
      html += '<div class="' + PREFIX + '-svc-name">' + esc(s.name) + '</div>';
      html += '<div class="' + PREFIX + '-svc-meta">' + dur + (price ? ' · ' + price : '') + '</div>';
      if (s.description) html += '<div class="' + PREFIX + '-svc-meta">' + esc(s.description) + '</div>';
      html += '</li>';
    });
    html += '</ul>';
    html += '<button class="' + PREFIX + '-btn"' + (!state.service ? ' disabled' : '') + ' id="' + PREFIX + '-next0">Далее</button>';
    content.innerHTML = html;

    content.querySelectorAll('.' + PREFIX + '-svc-item').forEach(function(el) {
      el.addEventListener('click', function() {
        state.service = state.services[parseInt(el.dataset.idx)];
        render();
      });
    });
    var btn = document.getElementById(PREFIX + '-next0');
    if (btn) btn.addEventListener('click', function() { if (state.service) { state.step = 1; state.date = todayStr(); loadSlots(); } });
  }

  function renderStep1() {
    var html = '<div class="' + PREFIX + '-field">';
    html += '<label class="' + PREFIX + '-label">Выбранная услуга</label>';
    html += '<div style="font-weight:600;color:#111827;margin-bottom:12px">' + esc(state.service.name) + '</div>';
    html += '</div>';
    html += '<div class="' + PREFIX + '-field">';
    html += '<label class="' + PREFIX + '-label">Дата</label>';
    html += '<input type="date" class="' + PREFIX + '-input" id="' + PREFIX + '-date" value="' + state.date + '" min="' + todayStr() + '">';
    html += '</div>';
    if (state.loading) { html += '<div class="' + PREFIX + '-loading">Загрузка слотов...</div>'; }
    else if (!state.slots.length) { html += '<div class="' + PREFIX + '-empty">Нет свободного времени на эту дату</div>'; }
    else {
      html += '<label class="' + PREFIX + '-label">Свободное время</label>';
      html += '<div class="' + PREFIX + '-slots">';
      state.slots.forEach(function(s) {
        var sel = state.slot === s ? ' sel' : '';
        html += '<div class="' + PREFIX + '-slot' + sel + '" data-time="' + s + '">' + s + '</div>';
      });
      html += '</div>';
    }
    html += '<div style="display:flex;gap:8px;margin-top:16px">';
    html += '<button class="' + PREFIX + '-btn" style="background:#6b7280" id="' + PREFIX + '-back1">Назад</button>';
    html += '<button class="' + PREFIX + '-btn"' + (!state.slot ? ' disabled' : '') + ' id="' + PREFIX + '-next1">Далее</button>';
    html += '</div>';
    if (state.error) html += '<div class="' + PREFIX + '-err">' + esc(state.error) + '</div>';
    content.innerHTML = html;

    document.getElementById(PREFIX + '-date').addEventListener('change', function(e) { state.date = e.target.value; state.slot = ''; loadSlots(); });
    content.querySelectorAll('.' + PREFIX + '-slot').forEach(function(el) {
      el.addEventListener('click', function() { state.slot = el.dataset.time; render(); });
    });
    document.getElementById(PREFIX + '-back1').addEventListener('click', function() { state.step = 0; render(); });
    var next = document.getElementById(PREFIX + '-next1');
    if (next) next.addEventListener('click', function() { if (state.slot) { state.step = 2; render(); } });
  }

  function renderStep2() {
    var dateFormatted = formatDate(state.date);
    var html = '<div style="background:#f0fdfa;padding:12px;border-radius:10px;margin-bottom:16px;font-size:13px">';
    html += '<strong>' + esc(state.service.name) + '</strong><br>' + dateFormatted + ' в ' + state.slot;
    html += '</div>';
    html += '<div class="' + PREFIX + '-field"><label class="' + PREFIX + '-label">Ваше имя *</label><input class="' + PREFIX + '-input" id="' + PREFIX + '-name" value="' + esc(state.name) + '" placeholder="Иван Иванов" autocomplete="off"></div>';
    html += '<div class="' + PREFIX + '-field"><label class="' + PREFIX + '-label">Телефон</label><input class="' + PREFIX + '-input" id="' + PREFIX + '-phone" value="' + esc(state.phone) + '" placeholder="+7 999 123 45 67" autocomplete="off"></div>';
    html += '<div class="' + PREFIX + '-field"><label class="' + PREFIX + '-label">Комментарий</label><textarea class="' + PREFIX + '-input" id="' + PREFIX + '-comment" rows="2" placeholder="Дополнительная информация">' + esc(state.comment) + '</textarea></div>';
    html += '<div style="display:flex;gap:8px">';
    html += '<button class="' + PREFIX + '-btn" style="background:#6b7280" id="' + PREFIX + '-back2">Назад</button>';
    html += '<button class="' + PREFIX + '-btn"' + (state.loading ? ' disabled' : '') + ' id="' + PREFIX + '-submit">' + (state.loading ? 'Отправка...' : 'Записаться') + '</button>';
    html += '</div>';
    if (state.error) html += '<div class="' + PREFIX + '-err">' + esc(state.error) + '</div>';
    content.innerHTML = html;

    document.getElementById(PREFIX + '-name').addEventListener('input', function(e) { state.name = e.target.value; });
    document.getElementById(PREFIX + '-phone').addEventListener('input', function(e) { state.phone = e.target.value; });
    document.getElementById(PREFIX + '-comment').addEventListener('input', function(e) { state.comment = e.target.value; });
    document.getElementById(PREFIX + '-back2').addEventListener('click', function() { state.step = 1; render(); });
    document.getElementById(PREFIX + '-submit').addEventListener('click', submitBooking);
  }

  function renderDone() {
    var r = state.result;
    content.innerHTML = '<div class="' + PREFIX + '-msg">' +
      '<svg viewBox="0 0 24 24" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' +
      '<h4>Вы записаны!</h4>' +
      '<p>' + esc(r.service_name) + '<br>' + formatDate(r.appointment_date) + ' в ' + r.appointment_time.slice(0,5) + '</p>' +
      '</div>' +
      '<button class="' + PREFIX + '-btn" id="' + PREFIX + '-done">Закрыть</button>';
    document.getElementById(PREFIX + '-done').addEventListener('click', closeWidget);
  }

  function loadServices() {
    state.loading = true; render();
    fetch(API + '/services')
      .then(function(r) { return r.json(); })
      .then(function(data) { state.services = data; state.loading = false; render(); })
      .catch(function() { state.services = []; state.loading = false; render(); });
  }

  function loadSlots() {
    state.loading = true; state.error = ''; render();
    fetch(API + '/slots?date=' + state.date + '&service_id=' + state.service.id)
      .then(function(r) { return r.json(); })
      .then(function(data) { state.slots = data.slots || []; state.loading = false; render(); })
      .catch(function() { state.slots = []; state.loading = false; state.error = 'Не удалось загрузить слоты'; render(); });
  }

  function submitBooking() {
    if (!state.name.trim()) { state.error = 'Введите имя'; render(); return; }
    state.loading = true; state.error = ''; render();
    fetch(API + '/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: state.service.id,
        appointment_date: state.date,
        appointment_time: state.slot,
        customer_name: state.name.trim(),
        phone: state.phone.trim(),
        comment: state.comment.trim()
      })
    })
    .then(function(r) { return r.json().then(function(d) { return { ok: r.ok, data: d }; }); })
    .then(function(res) {
      state.loading = false;
      if (!res.ok) { state.error = res.data.error || 'Ошибка записи'; render(); return; }
      state.done = true; state.result = res.data; render();
    })
    .catch(function() { state.loading = false; state.error = 'Ошибка соединения'; render(); });
  }

  function todayStr() { return new Date().toISOString().slice(0, 10); }
  function formatDate(d) {
    var months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
    var parts = d.split('-');
    return parseInt(parts[2]) + ' ' + months[parseInt(parts[1])-1] + ' ' + parts[0];
  }
  function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
})();
