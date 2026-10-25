import crypto from 'crypto';
import { prisma } from '../database/prisma';

class AuthService {
  private secretKey: string;

  constructor() {
    this.secretKey = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hashes a 4-6 digit master PIN with a unique cryptographic salt using PBKDF2
   */
  public hashPin(pin: string): { hash: string; salt: string } {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(pin, salt, 100000, 32, 'sha256').toString('hex');
    return { hash, salt };
  }

  public verifyPin(pin: string, storedHash: string, storedSalt: string): boolean {
    const hashToVerify = crypto.pbkdf2Sync(pin, storedSalt, 100000, 32, 'sha256').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(storedHash, 'hex'), Buffer.from(hashToVerify, 'hex'));
  }

  /**
   * Checks if the user has already configured a Master PIN
   */
  public async isPinConfigured(): Promise<boolean> {
    const config = await prisma.appConfig.findUnique({ where: { key: 'master_pin_hash' } });
    return !!config;
  }

  /**
   * Sets or updates the Master PIN
   */
  public async setPin(pin: string): Promise<void> {
    if (pin.length < 4 || pin.length > 8) {
      throw new Error('PIN must be between 4 and 8 digits');
    }
    const { hash, salt } = this.hashPin(pin);

    await prisma.appConfig.upsert({
      where: { key: 'master_pin_hash' },
      create: { key: 'master_pin_hash', value: hash },
      update: { value: hash },
    });

    await prisma.appConfig.upsert({
      where: { key: 'master_pin_salt' },
      create: { key: 'master_pin_salt', value: salt },
      update: { value: salt },
    });
  }

  /**
   * Validates entered PIN and issues a secure signed session token
   */
  public async authenticate(pin: string): Promise<{ success: boolean; token?: string; error?: string }> {
    const hashRecord = await prisma.appConfig.findUnique({ where: { key: 'master_pin_hash' } });
    const saltRecord = await prisma.appConfig.findUnique({ where: { key: 'master_pin_salt' } });

    if (!hashRecord || !saltRecord) {
      return { success: false, error: 'No PIN has been configured yet' };
    }

    const isValid = this.verifyPin(pin, hashRecord.value, saltRecord.value);
    if (!isValid) {
      return { success: false, error: 'Incorrect PIN. Access denied.' };
    }

    // Generate signed HMAC session token valid for 24 hours
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    const payload = `${expiresAt}:${crypto.randomBytes(8).toString('hex')}`;
    const signature = crypto.createHmac('sha256', this.secretKey).update(payload).digest('hex');
    const token = `${Buffer.from(payload).toString('base64')}.${signature}`;

    return { success: true, token };
  }

  /**
   * Verifies an incoming authorization token
   */
  public validateToken(token?: string): boolean {
    if (!token) return false;
    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const [b64Payload, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', this.secretKey).update(Buffer.from(b64Payload, 'base64').toString()).digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSig, 'hex'))) {
      return false;
    }

    const payload = Buffer.from(b64Payload, 'base64').toString();
    const [expiresAtStr] = payload.split(':');
    const expiresAt = parseInt(expiresAtStr, 10);

    return Date.now() < expiresAt;
  }
}

export const authService = new AuthService();
