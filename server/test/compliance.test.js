const test = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');
const { authService } = require('../dist/services/auth.service');
const { schedulerService } = require('../dist/services/scheduler.service');
const { aiService } = require('../dist/services/ai.service');

test('Security: Master PIN PBKDF2 hash verification works with timingSafeEqual', () => {
  const pin = '54321';
  const { hash, salt } = authService.hashPin(pin);
  assert.ok(hash.length === 64, 'PBKDF2 hash should be 64 hex characters (32 bytes)');
  assert.ok(salt.length === 32, 'Salt should be 32 hex characters (16 bytes)');

  const isValid = authService.verifyPin(pin, hash, salt);
  assert.strictEqual(isValid, true, 'Valid PIN must match its hash and salt');

  const isInvalid = authService.verifyPin('99999', hash, salt);
  assert.strictEqual(isInvalid, false, 'Invalid PIN must be rejected');
});

test('Compliance: Emergency Queue Pause Circuit Breaker', () => {
  schedulerService.setPaused(true);
  assert.strictEqual(schedulerService.getIsPaused(), true, 'Queue must report paused state');

  schedulerService.setPaused(false);
  assert.strictEqual(schedulerService.getIsPaused(), false, 'Queue must resume active state');
});

test('AI Guardrails: Cache reuses identical prompt results and estimates tokens', async () => {
  const req = {
    prompt: 'Salary follow up test prompt',
    tone: 'professional',
    recipientRole: 'HR Manager',
  };

  const firstCall = await aiService.generateDraft('user-test-1', req);
  assert.ok(firstCall.draft.length > 0, 'Draft should return text');
  assert.strictEqual(firstCall.cached, false, 'First call should be fresh');

  const secondCall = await aiService.generateDraft('user-test-1', req);
  assert.strictEqual(secondCall.cached, true, 'Second identical call must be served from cache');
  assert.strictEqual(secondCall.draft, firstCall.draft, 'Cached draft must match initial draft');
});

test('AI Guardrails: Per-user rate limiting triggers after maximum capacity', async () => {
  const req = { prompt: 'Quick ping', tone: 'casual' };
  let rateLimited = false;

  try {
    for (let i = 0; i < 20; i++) {
      await aiService.generateDraft('rate-limit-test-user', req);
    }
  } catch (err) {
    rateLimited = err.message.includes('Rate limit');
  }

  assert.strictEqual(rateLimited, true, 'Calling 20 times in 1 minute must trigger rate limit guardrail');
});
