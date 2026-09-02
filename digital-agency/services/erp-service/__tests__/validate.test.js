const { sanitizeStr, sanitizeFields, clamp, checkLengths } = require('../server/middleware/validate');

describe('ERP Validate Middleware', () => {
  describe('sanitizeStr', () => {
    it('убирает HTML теги', () => {
      expect(sanitizeStr('<b>hello</b>')).toBe('hello');
      expect(sanitizeStr('<script>alert("xss")</script>')).toBe('alert("xss")');
    });

    it('убирает пробелы по краям', () => {
      expect(sanitizeStr('  hello  ')).toBe('hello');
    });

    it('возвращает не-строки как есть', () => {
      expect(sanitizeStr(123)).toBe(123);
      expect(sanitizeStr(null)).toBe(null);
      expect(sanitizeStr(undefined)).toBe(undefined);
    });

    it('обрабатывает пустую строку', () => {
      expect(sanitizeStr('')).toBe('');
    });
  });

  describe('sanitizeFields', () => {
    it('применяет sanitizeStr ко всем строковым полям', () => {
      const obj = { name: '<b>Test</b>', age: 25, city: '  Moscow  ' };
      sanitizeFields(obj);
      expect(obj.name).toBe('Test');
      expect(obj.age).toBe(25);
      expect(obj.city).toBe('Moscow');
    });
  });

  describe('clamp', () => {
    it('ограничивает значение диапазоном', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('возвращает null для undefined/null/NaN', () => {
      expect(clamp(undefined, 0, 10)).toBe(null);
      expect(clamp(null, 0, 10)).toBe(null);
      expect(clamp(NaN, 0, 10)).toBe(null);
    });
  });

  describe('checkLengths', () => {
    it('возвращает null если все поля в пределах нормы', () => {
      expect(checkLengths({ 'Имя': 'Test' }, 255)).toBe(null);
    });

    it('возвращает ошибку если поле превышает лимит', () => {
      const longStr = 'a'.repeat(256);
      const result = checkLengths({ 'Имя': longStr }, 255);
      expect(result).toContain('Имя');
      expect(result).toContain('255');
    });

    it('возвращает null для пустого объекта', () => {
      expect(checkLengths({}, 255)).toBe(null);
    });
  });
});
