/**
 * Normalizes user-entered phone number into standard international format digits (E.164 without leading plus).
 * Smartly handles Pakistan (+92) local prefixes:
 * - '03310390837' -> '923310390837'
 * - '3310390837' (with default CC +92) -> '923310390837'
 * - '+92 331-0390837' -> '923310390837'
 * - '+1 (555) 123-4567' -> '15551234567'
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

  // Case 1: Raw input started with explicit '+' (e.g. +92331..., +1555...)
  if (hadPlus) {
    return digits;
  }

  // Case 2: User started with '0' (e.g. 03310390837 in Pakistan or 07... in UK)
  if (digits.startsWith('0')) {
    const withoutZero = digits.replace(/^0+/, '');
    return `${cleanCc}${withoutZero}`;
  }

  // Case 3: Already starts with default country code (e.g. 92331...)
  if (digits.startsWith(cleanCc) && digits.length >= 10) {
    return digits;
  }

  // Case 4: 10-digit number without CC (e.g. 3310390837 for Pakistan or 5551234567 for US)
  if (digits.length === 10) {
    return `${cleanCc}${digits}`;
  }

  // If already full international number without plus (>= 11 digits)
  if (digits.length >= 11) {
    return digits;
  }

  // Fallback: attach CC
  return `${cleanCc}${digits}`;
}
