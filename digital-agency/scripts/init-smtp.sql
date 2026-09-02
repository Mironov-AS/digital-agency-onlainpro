-- Initialize SMTP settings for Yandex
-- Run this after database is created

INSERT INTO admin.smtp_settings (id, host, port, username, password, from_email, from_name, use_ssl, is_enabled, updated_at)
VALUES (
  'default',
  'smtp.yandex.ru',
  465,
  'andrey.onlinepro@yandex.ru',
  'ddzbgdwdcpsjfswb',
  'andrey.onlinepro@yandex.ru',
  'Цифровое агентство ОнлайнПро',
  true,
  true,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  host = EXCLUDED.host,
  port = EXCLUDED.port,
  username = EXCLUDED.username,
  password = EXCLUDED.password,
  from_email = EXCLUDED.from_email,
  from_name = EXCLUDED.from_name,
  use_ssl = EXCLUDED.use_ssl,
  is_enabled = EXCLUDED.is_enabled,
  updated_at = NOW();
