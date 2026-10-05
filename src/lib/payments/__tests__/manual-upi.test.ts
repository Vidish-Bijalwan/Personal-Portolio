/**
 * Manual UPI payments — unit tests. NO network: pure helpers + local QR render.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Boundary modules (DB client / schema / drizzle-orm) belong to other agents;
// mock them so this suite stays pure and offline.
vi.mock('@/lib/db/client', () => ({ db: {} }));
vi.mock('@/lib/db/schema', () => ({}));
vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  and: vi.fn(),
  ne: vi.fn(),
  inArray: vi.fn(),
}));

import { ManualUpiProvider, getUpiConfig } from '../manual-upi';
import {
  buildUpiUri,
  isValidUtr,
  newOrderCode,
  normalizeUtr,
} from '../../vilish/types';

const ENV_KEYS = [
  'UPI_PAYMENT_ENABLED',
  'UPI_VPA',
  'UPI_PAYEE_NAME',
  'UPI_QR_IMAGE',
  'MANUAL_UPI_ORDER_TTL_MIN',
];

beforeEach(() => {
  for (const k of ENV_KEYS) delete process.env[k];
  process.env.UPI_PAYMENT_ENABLED = 'true';
  process.env.UPI_VPA = 'vidish@okhdfcbank';
  process.env.UPI_PAYEE_NAME = 'PixauraStudio';
});

describe('buildUpiUri', () => {
  it('contains pa, pn, am (2 decimals), cu=INR, tn=Pixaura-<code>', () => {
    const uri = buildUpiUri({
      vpa: 'vidish@okhdfcbank',
      payeeName: 'PixauraStudio',
      amountPaise: 2900,
      orderCode: 'VLSH-8H4K2P',
    });
    expect(uri.startsWith('upi://pay?')).toBe(true);
    const p = new URLSearchParams(uri.slice('upi://pay?'.length));
    expect(p.get('pa')).toBe('vidish@okhdfcbank');
    expect(p.get('pn')).toBe('PixauraStudio');
    expect(p.get('am')).toBe('29.00');
    expect(p.get('cu')).toBe('INR');
    expect(p.get('tn')).toBe('Pixaura-VLSH-8H4K2P');
  });

  it('keeps paise exactness (no float drift)', () => {
    const p = new URLSearchParams(
      buildUpiUri({
        vpa: 'a@b',
        payeeName: 'N',
        amountPaise: 1999,
        orderCode: 'VLSH-X',
      }).split('?')[1]
    );
    expect(p.get('am')).toBe('19.99');
  });
});

describe('newOrderCode', () => {
  it('matches /^VLSH-[A-Z2-9]{6}$/ and two codes differ', () => {
    const a = newOrderCode();
    const b = newOrderCode();
    expect(a).toMatch(/^VLSH-[A-Z2-9]{6}$/);
    expect(b).toMatch(/^VLSH-[A-Z2-9]{6}$/);
    expect(a).not.toBe(b);
  });
});

describe('UTR helpers', () => {
  it('isValidUtr accepts known-good shapes', () => {
    expect(isValidUtr('123456789012')).toBe(true);
    expect(isValidUtr('UPI/123456/AB')).toBe(true);
  });

  it('isValidUtr rejects bad shapes', () => {
    expect(isValidUtr('abc')).toBe(false);
    expect(isValidUtr('x'.repeat(31))).toBe(false);
    expect(isValidUtr('')).toBe(false);
  });

  it('normalizeUtr uppercases and strips spaces/hyphens', () => {
    expect(normalizeUtr(' upi/12 3456-ab ')).toBe('UPI/123456AB');
  });
});

describe('getUpiConfig', () => {
  it('returns config from env with 30min default TTL', () => {
    const cfg = getUpiConfig();
    expect(cfg.enabled).toBe(true);
    expect(cfg.vpa).toBe('vidish@okhdfcbank');
    expect(cfg.payeeName).toBe('PixauraStudio');
    expect(cfg.qrImageUrl).toBeNull();
    expect(cfg.orderTtlMin).toBe(30);
  });

  it('throws when enabled but VPA/payee name missing', () => {
    delete process.env.UPI_VPA;
    expect(() => getUpiConfig()).toThrow(/UPI_VPA/);
    process.env.UPI_VPA = 'vidish@okhdfcbank';
    delete process.env.UPI_PAYEE_NAME;
    expect(() => getUpiConfig()).toThrow(/UPI_PAYEE_NAME/);
  });

  it('does not throw when disabled', () => {
    process.env.UPI_PAYMENT_ENABLED = 'false';
    delete process.env.UPI_VPA;
    delete process.env.UPI_PAYEE_NAME;
    expect(() => getUpiConfig().enabled).not.toThrow();
  });
});

describe('ManualUpiProvider QR', () => {
  it('generates a PNG data-URI QR locally (no network)', async () => {
    const provider = new ManualUpiProvider();
    expect(provider.id).toBe('manual_upi');
    const checkout = await provider.createCheckout({
      code: 'VLSH-8H4K2P',
      amountPaise: 4900,
    });
    expect(checkout.qrDataUri).toMatch(/^data:image\/png;base64,/);
    expect(checkout.upiUri).toContain('upi://pay?');
    expect(checkout.vpa).toBe('vidish@okhdfcbank');
    expect(checkout.payeeName).toBe('PixauraStudio');
    const ttl = Date.parse(checkout.expiresAt) - Date.now();
    expect(ttl).toBeGreaterThan(29 * 60_000);
    expect(ttl).toBeLessThanOrEqual(30 * 60_000);
  });

  it('prefers the hosted QR image when UPI_QR_IMAGE is set', async () => {
    process.env.UPI_QR_IMAGE = 'https://cdn.example.com/vidish-qr.png';
    const checkout = await new ManualUpiProvider().createCheckout({
      code: 'VLSH-8H4K2P',
      amountPaise: 4900,
    });
    expect(checkout.qrImageUrl).toBe('https://cdn.example.com/vidish-qr.png');
    expect(checkout.qrDataUri).toBeUndefined();
  });
});
