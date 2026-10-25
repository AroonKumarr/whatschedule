/**
 * Normalizes user-entered phone number into standard international format digits (E.164 without leading plus).
 * Smartly handles Pakistan (+92) local prefixes:
 * - '0300 1234567' -> '923001234567'
 * - '03001234567' -> '923001234567'
 * - '3001234567' (with default CC 92) -> '923001234567'
 * - '+92 300-1234567' -> '923001234567'
 * - '+1 (555) 123-4567' -> '15551234567'
 * - '9203001234567' -> '923001234567'
 */
export function normalizePhoneNumber(rawInput: string, defaultCountryCode: string = '92'): string {
  if (!rawInput || typeof rawInput !== 'string') {
    throw new Error('Phone number is required.');
  }

  let trimmed = rawInput.trim();
  const hadPlus = trimmed.startsWith('+');
  let digits = trimmed.replace(/\D/g, '');
  const cleanCc = defaultCountryCode.replace(/\D/g, '') || '92';

  if (!digits) {
    throw new Error('Phone number must contain numeric digits.');
  }

  let normalized: string;

  if (hadPlus) {
    if (digits.startsWith(`${cleanCc}0`)) {
      normalized = cleanCc + digits.substring(cleanCc.length + 1);
    } else {
      normalized = digits;
    }
  } else if (digits.startsWith('0')) {
    const withoutZero = digits.replace(/^0+/, '');
    normalized = `${cleanCc}${withoutZero}`;
  } else if (digits.startsWith(`${cleanCc}0`)) {
    normalized = cleanCc + digits.substring(cleanCc.length + 1);
  } else if (digits.startsWith(cleanCc) && digits.length >= 10) {
    normalized = digits;
  } else if (digits.length === 10) {
    normalized = `${cleanCc}${digits}`;
  } else if (digits.length >= 11) {
    normalized = digits;
  } else {
    normalized = `${cleanCc}${digits}`;
  }

  // E.164 boundary check: standard international numbers are 10 to 15 digits
  if (normalized.length < 10) {
    throw new Error(`Phone number "${rawInput}" is too short (${normalized.length} digits). Must be at least 10 digits.`);
  }

  if (normalized.length > 15) {
    throw new Error(`Phone number "${rawInput}" is too long (${normalized.length} digits). Cannot exceed 15 digits.`);
  }

  return normalized;
}

/**
 * Masks phone number for security logging (e.g., "92331****837")
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return '***';
  const clean = phone.replace(/\D/g, '');
  if (clean.length <= 6) return '******';
  const start = clean.slice(0, 5);
  const end = clean.slice(-3);
  return `${start}****${end}`;
}

/**
 * Masks pairing code for security logging (e.g., "AB**-**78")
 */
export function maskPairingCode(code: string): string {
  if (!code) return '****';
  const clean = code.replace(/[^A-Za-z0-9]/g, '');
  if (clean.length < 4) return '****';
  return `${clean.slice(0, 2)}**-**${clean.slice(-2)}`;
}
