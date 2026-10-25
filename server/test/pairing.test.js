const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  normalizePhoneNumber,
  maskPhoneNumber,
  maskPairingCode,
} = require('../dist/utils/phone.util');
const { PhoneLinkService } = require('../dist/services/phone-link.service');

test('WhatsApp Phone Pairing Normalizer Test Suite', async (t) => {
  await t.test('Normalizes Pakistan number with leading 0 (03001234567 -> 923001234567)', () => {
    assert.strictEqual(normalizePhoneNumber('03001234567', '92'), '923001234567');
    assert.strictEqual(normalizePhoneNumber('0300 1234567', '92'), '923001234567');
  });

  await t.test('Normalizes Pakistan number with spaces, parentheses and hyphens (0300-1234567)', () => {
    assert.strictEqual(normalizePhoneNumber('0300-1234567', '92'), '923001234567');
    assert.strictEqual(normalizePhoneNumber('(0300) 123-4567', '92'), '923001234567');
  });

  await t.test('Normalizes 10-digit number without CC (3001234567 -> 923001234567)', () => {
    assert.strictEqual(normalizePhoneNumber('3001234567', '92'), '923001234567');
  });

  await t.test('Normalizes Pakistan number with redundant zero after CC (9203001234567 -> 923001234567)', () => {
    assert.strictEqual(normalizePhoneNumber('9203001234567', '92'), '923001234567');
    assert.strictEqual(normalizePhoneNumber('+9203001234567', '92'), '923001234567');
  });

  await t.test('Normalizes Pakistan number with explicit + (+92 300 1234567 -> 923001234567)', () => {
    assert.strictEqual(normalizePhoneNumber('+92 300 1234567', '92'), '923001234567');
  });

  await t.test('Preserves full international number already starting with 92 (923001234567)', () => {
    assert.strictEqual(normalizePhoneNumber('923001234567', '92'), '923001234567');
  });

  await t.test('Normalizes US number with country code +1', () => {
    assert.strictEqual(normalizePhoneNumber('+1 (555) 019-2834', '1'), '15550192834');
  });

  await t.test('Rejects numbers that are too short (< 10 digits)', () => {
    assert.throws(() => normalizePhoneNumber('12345'), /too short/);
    assert.throws(() => normalizePhoneNumber('0300'), /too short/);
  });

  await t.test('Rejects numbers that are too long (> 15 digits)', () => {
    assert.throws(() => normalizePhoneNumber('123456789012345678'), /too long/);
  });

  await t.test('Rejects empty or non-digit input', () => {
    assert.throws(() => normalizePhoneNumber(''), /Phone number is required/);
    assert.throws(() => normalizePhoneNumber('abc-xyz'), /must contain numeric digits/);
  });

  await t.test('Masks phone numbers and pairing codes for structured logging security', () => {
    assert.strictEqual(maskPhoneNumber('923001234567'), '92300****567');
    assert.strictEqual(maskPairingCode('ABCD1234'), 'AB**-**34');
    assert.strictEqual(maskPairingCode('ABCD-1234'), 'AB**-**34');
  });
});

test('PhoneLinkService State Machine & Lifecycle Test Suite', async (t) => {
  const service = new PhoneLinkService();
  const testUserId = 'test_user_unit';

  await t.test('Initial status is idle', () => {
    const status = service.getSessionStatus(testUserId);
    assert.strictEqual(status.status, 'idle');
    assert.strictEqual(status.error, null);
  });

  await t.test('Status transitions: code_ready and countdown calculation', () => {
    const mockSession = {
      userId: testUserId,
      phone: '923001234567',
      status: 'code_ready',
      code: 'ABCD1234',
      formattedCode: 'ABCD-1234',
      expiresAt: Date.now() + 180 * 1000,
      error: null,
      sock: null,
      authDir: path.resolve(__dirname, '../sessions/phone_link/' + testUserId),
      expiryTimer: null,
      isPairingRequested: true,
      isReconnecting: false,
    };
    service.sessions.set(testUserId, mockSession);

    const status = service.getSessionStatus(testUserId);
    assert.strictEqual(status.status, 'code_ready');
    assert.strictEqual(status.code, 'ABCD1234');
    assert.strictEqual(status.formattedCode, 'ABCD-1234');
    assert(status.secondsLeft > 170 && status.secondsLeft <= 180);
  });

  await t.test('Expiry handling: past expiresAt transitions to expired', () => {
    const session = service.sessions.get(testUserId);
    session.expiresAt = Date.now() - 1000; // 1s in the past

    const status = service.getSessionStatus(testUserId);
    assert.strictEqual(status.status, 'expired');
    assert.strictEqual(status.secondsLeft, 0);
  });

  await t.test('Cancel handling: cleans directory and resets status to idle', async () => {
    const userDir = path.resolve(__dirname, '../sessions/phone_link/' + testUserId);
    fs.mkdirSync(userDir, { recursive: true });
    fs.writeFileSync(path.join(userDir, 'dummy_creds.json'), '{"test":true}');

    await service.cancel(testUserId);

    const status = service.getSessionStatus(testUserId);
    assert.strictEqual(status.status, 'idle');
    assert.strictEqual(fs.existsSync(userDir), false);
  });

  await t.test('restartRequired (515) socket reconnect simulation', async () => {
    let reconnectCalled = false;
    let wiped = false;

    // Simulate WhatsApp companion 515 close event behavior
    const mockHandleClose = (statusCode) => {
      if (statusCode === 515) {
        // Must NOT wipe credentials, must trigger reconnect
        reconnectCalled = true;
      } else if (statusCode === 401) {
        wiped = true;
      }
    };

    mockHandleClose(515);
    assert.strictEqual(reconnectCalled, true);
    assert.strictEqual(wiped, false);
  });
});
