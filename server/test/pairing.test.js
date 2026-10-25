const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizePhoneNumber } = require('../dist/utils/phone.util');

test('WhatsApp Phone Pairing Normalizer Test Suite', async (t) => {
  await t.test('Normalizes Pakistan number with leading 0 (0331...)', () => {
    const result = normalizePhoneNumber('03310390837', '92');
    assert.strictEqual(result, '923310390837');
  });

  await t.test('Normalizes Pakistan number with spaces and hyphens (0331-0390837)', () => {
    const result = normalizePhoneNumber('0331-0390837', '92');
    assert.strictEqual(result, '923310390837');
  });

  await t.test('Normalizes 10-digit number without CC (3310390837)', () => {
    const result = normalizePhoneNumber('3310390837', '92');
    assert.strictEqual(result, '923310390837');
  });

  await t.test('Normalizes Pakistan number with explicit international format (+92 331 0390837)', () => {
    const result = normalizePhoneNumber('+92 331 0390837', '92');
    assert.strictEqual(result, '923310390837');
  });

  await t.test('Preserves full international number already starting with 92 (923310390837)', () => {
    const result = normalizePhoneNumber('923310390837', '92');
    assert.strictEqual(result, '923310390837');
  });

  await t.test('Normalizes US number with country code +1', () => {
    const result = normalizePhoneNumber('+1 (555) 019-2834', '1');
    assert.strictEqual(result, '15550192834');
  });

  await t.test('Rejects empty or non-digit input', () => {
    assert.throws(() => normalizePhoneNumber(''), /Phone number is required/);
    assert.throws(() => normalizePhoneNumber('abc'), /Phone number must contain numeric digits/);
  });
});
