const { Router } = require('express');
const { requireAuth } = require('../../../../shared/middleware/auth');
const { db } = require('../db');

const router = Router();

function getClientId(req) {
  if (req.user.role === 'admin') return req.query.client_id || '';
  return req.user.clientId || '';
}

router.get('/employees', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'Параметры from и to обязательны' });
    }

    const rows = await db.prepare(`
      SELECT
        wr.employee_id,
        e.full_name   AS employee_name,
        e.position    AS employee_position,
        wr.service_id,
        s.name        AS service_name,
        wr.customer_id,
        c.full_name   AS customer_name,
        wr.performed_at,
        wr.duration,
        wr.price,
        wr.comment
      FROM work_records wr
      LEFT JOIN employees e ON e.id = wr.employee_id
      LEFT JOIN services  s ON s.id = wr.service_id
      LEFT JOIN customers c ON c.id = wr.customer_id
      WHERE wr.client_id = ?
        AND wr.performed_at >= ?::DATE
        AND wr.performed_at < (?::DATE + INTERVAL '1 day')
      ORDER BY e.full_name, wr.performed_at
    `).all(clientId, from, to);

    const employeeMap = {};
    let grandTotal = 0;
    let grandDuration = 0;
    let grandCount = 0;

    for (const r of rows) {
      const empId = r.employee_id || '__none__';
      if (!employeeMap[empId]) {
        employeeMap[empId] = {
          employee_id: r.employee_id,
          employee_name: r.employee_name || 'Без сотрудника',
          employee_position: r.employee_position || '',
          total_price: 0,
          total_duration: 0,
          work_count: 0,
          services: {},
          customers: {},
          records: [],
        };
      }
      const emp = employeeMap[empId];
      const price = Number(r.price) || 0;
      const duration = Number(r.duration) || 0;

      emp.total_price += price;
      emp.total_duration += duration;
      emp.work_count += 1;
      grandTotal += price;
      grandDuration += duration;
      grandCount += 1;

      const svcId = r.service_id || '__none__';
      if (!emp.services[svcId]) {
        emp.services[svcId] = { name: r.service_name || 'Без услуги', total: 0, count: 0, duration: 0 };
      }
      emp.services[svcId].total += price;
      emp.services[svcId].count += 1;
      emp.services[svcId].duration += duration;

      const custId = r.customer_id || '__none__';
      if (!emp.customers[custId]) {
        emp.customers[custId] = { name: r.customer_name || 'Без клиента', total: 0, count: 0 };
      }
      emp.customers[custId].total += price;
      emp.customers[custId].count += 1;

      emp.records.push({
        performed_at: r.performed_at,
        service_name: r.service_name || '',
        customer_name: r.customer_name || '',
        duration,
        price,
        comment: r.comment || '',
      });
    }

    const employees = Object.values(employeeMap)
      .map(e => ({
        ...e,
        services: Object.values(e.services).sort((a, b) => b.total - a.total),
        customers: Object.values(e.customers).sort((a, b) => b.total - a.total),
      }))
      .sort((a, b) => b.total_price - a.total_price);

    res.json({
      period: { from, to },
      grand_total: grandTotal,
      grand_duration: grandDuration,
      grand_count: grandCount,
      employees,
    });
  } catch (err) {
    console.error('[crm] statistics/employees error', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/sales', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { from, to, customer_id, item_id } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'Параметры from и to обязательны' });
    }

    let where = `
      WHERE o.client_id = ?
        AND o.created_at >= ?::DATE
        AND o.created_at < (?::DATE + INTERVAL '1 day')
    `;
    const params = [clientId, from, to];

    if (customer_id) {
      where += ' AND o.customer_id = ?';
      params.push(customer_id);
    }
    if (item_id) {
      where += ' AND oi.sales_item_id = ?';
      params.push(item_id);
    }

    const rows = await db.prepare(`
      SELECT
        o.id AS order_id,
        o.title AS order_title,
        o.status,
        o.created_at,
        o.closed_at,
        o.outcome,
        o.customer_id,
        c.full_name AS customer_name,
        oi.sales_item_id,
        oi.name AS item_name,
        oi.quantity,
        oi.price,
        (oi.quantity * oi.price) AS line_total
      FROM orders o
      LEFT JOIN customers c ON c.id = o.customer_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      ${where}
      ORDER BY o.created_at DESC, o.title, oi.created_at
    `).all(...params);

    const orderMap = {};
    const customerMap = {};
    const itemMap = {};
    let grandTotal = 0;

    for (const r of rows) {
      const lineTotal = Number(r.line_total) || 0;
      grandTotal += lineTotal;

      if (!orderMap[r.order_id]) {
        orderMap[r.order_id] = {
          id: r.order_id,
          title: r.order_title,
          status: r.status,
          created_at: r.created_at,
          closed_at: r.closed_at,
          outcome: r.outcome || '',
          customer_id: r.customer_id,
          customer_name: r.customer_name || 'Без клиента',
          total: 0,
          items: [],
        };
      }
      orderMap[r.order_id].total += lineTotal;
      if (r.item_name) {
        orderMap[r.order_id].items.push({
          sales_item_id: r.sales_item_id,
          name: r.item_name,
          quantity: Number(r.quantity) || 0,
          price: Number(r.price) || 0,
          total: lineTotal,
        });
      }

      const customerKey = r.customer_id || '__none__';
      if (!customerMap[customerKey]) {
        customerMap[customerKey] = { customer_id: r.customer_id, name: r.customer_name || 'Без клиента', total: 0, orders: new Set() };
      }
      customerMap[customerKey].total += lineTotal;
      customerMap[customerKey].orders.add(r.order_id);

      const itemKey = r.sales_item_id || r.item_name || '__none__';
      if (r.item_name && !itemMap[itemKey]) {
        itemMap[itemKey] = { sales_item_id: r.sales_item_id, name: r.item_name, quantity: 0, total: 0, orders: new Set() };
      }
      if (r.item_name) {
        itemMap[itemKey].quantity += Number(r.quantity) || 0;
        itemMap[itemKey].total += lineTotal;
        itemMap[itemKey].orders.add(r.order_id);
      }
    }

    res.json({
      period: { from, to },
      grand_total: grandTotal,
      order_count: Object.keys(orderMap).length,
      by_customers: Object.values(customerMap)
        .map(c => ({ ...c, order_count: c.orders.size, orders: undefined }))
        .sort((a, b) => b.total - a.total),
      by_items: Object.values(itemMap)
        .map(i => ({ ...i, order_count: i.orders.size, orders: undefined }))
        .sort((a, b) => b.total - a.total),
      orders: Object.values(orderMap).sort((a, b) => b.total - a.total),
    });
  } catch (err) {
    console.error('[crm] statistics/sales error', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
