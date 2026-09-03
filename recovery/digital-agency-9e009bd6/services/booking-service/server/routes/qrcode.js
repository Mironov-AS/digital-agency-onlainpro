const express = require('express');
const QRCode = require('qrcode');

const router = express.Router();

router.get('/', async (req, res) => {
  const { url } = req.query;
  if (!url || typeof url !== 'string' || url.length > 2048) {
    return res.status(400).json({ error: 'Некорректный url' });
  }
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: 400, margin: 2,
      color: { dark: '#0d9488', light: '#ffffff' }
    });
    res.json({ qrcode: dataUrl, url });
  } catch {
    res.status(500).json({ error: 'Ошибка генерации QR-кода' });
  }
});

router.get('/download', async (req, res) => {
  const { url } = req.query;
  if (!url || typeof url !== 'string' || url.length > 2048) {
    return res.status(400).json({ error: 'Некорректный url' });
  }
  try {
    const buffer = await QRCode.toBuffer(url, {
      width: 400, margin: 2,
      color: { dark: '#0d9488', light: '#ffffff' }
    });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'attachment; filename="booking-qr.png"');
    res.send(buffer);
  } catch {
    res.status(500).json({ error: 'Ошибка генерации QR-кода' });
  }
});

module.exports = router;
