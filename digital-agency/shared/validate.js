function validateFields(body, rules) {
  const errors = {};
  for (const [field, checks] of Object.entries(rules)) {
    const value = body[field];
    for (const check of checks) {
      const err = check(value, field);
      if (err) { errors[field] = err; break; }
    }
  }
  return Object.keys(errors).length ? errors : null;
}

const required = (v, f) => (v === undefined || v === null || v === '') ? `${f} is required` : null;
const isString = (v, f) => (v !== undefined && v !== null && typeof v !== 'string') ? `${f} must be a string` : null;
const isNumber = (v, f) => (v !== undefined && v !== null && typeof v !== 'number') ? `${f} must be a number` : null;
const isBoolean = (v, f) => (v !== undefined && v !== null && typeof v !== 'boolean') ? `${f} must be a boolean` : null;
const maxLen = (max) => (v, f) => (typeof v === 'string' && v.length > max) ? `${f} must be at most ${max} characters` : null;
const minLen = (min) => (v, f) => (typeof v === 'string' && v.length < min) ? `${f} must be at least ${min} characters` : null;
const isEmail = (v, f) => (typeof v === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) ? `${f} must be a valid email` : null;

function validateMiddleware(rules) {
  return (req, res, next) => {
    const errors = validateFields(req.body, rules);
    if (errors) return res.status(400).json({ error: 'Validation failed', fields: errors });
    next();
  };
}

module.exports = { validateFields, validateMiddleware, required, isString, isNumber, isBoolean, maxLen, minLen, isEmail };
