const test = require('node:test');
const assert = require('node:assert');
const { classifyError } = require('../dist/services/scheduler.service');

test('Error Classifier identifies offline network / Wi-Fi issues', () => {
  const err1 = new Error('getaddrinfo ENOTFOUND web.whatsapp.com');
  const classified1 = classifyError(err1);
  assert.strictEqual(classified1.reason, 'No Internet Connection');
  assert.strictEqual(classified1.isRetryable, true);
  assert.match(classified1.userAdvice, /Wi-Fi/i);

  const err2 = new Error('connect ECONNREFUSED 127.0.0.1:443');
  const classified2 = classifyError(err2);
  assert.strictEqual(classified2.reason, 'No Internet Connection');
  assert.strictEqual(classified2.isRetryable, true);
});

test('Error Classifier identifies WhatsApp session disconnects', () => {
  const err = new Error('WhatsApp is not connected. Please scan the QR code first.');
  const classified = classifyError(err);
  assert.strictEqual(classified.reason, 'WhatsApp Session Offline');
  assert.strictEqual(classified.isRetryable, true);
  assert.match(classified.userAdvice, /QR code/i);
});

test('Error Classifier identifies network timeouts and marks them retryable', () => {
  const err = new Error('Request timed out after 30000ms');
  const classified = classifyError(err);
  assert.strictEqual(classified.reason, 'Network Timeout');
  assert.strictEqual(classified.isRetryable, true);
});

test('Error Classifier blocks non-retryable invalid numbers', () => {
  const err = new Error('item-not-found: Phone number is not registered on WhatsApp');
  const classified = classifyError(err);
  assert.strictEqual(classified.reason, 'Invalid Contact Number');
  assert.strictEqual(classified.isRetryable, false);
});

test('Error Classifier identifies compliance opt-outs and prohibits retries', () => {
  const err = new Error('Dispatch blocked: Recipient has opted out of communications');
  const classified = classifyError(err);
  assert.strictEqual(classified.reason, 'Blocked by Recipient Opt-Out');
  assert.strictEqual(classified.isRetryable, false);
});
