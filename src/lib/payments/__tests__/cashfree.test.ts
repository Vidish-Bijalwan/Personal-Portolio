/**
 * Cashfree payments — unit tests. NO network: pure helpers + signature math.
 * DB-backed functions (markCashfreeOrderPaid) are covered by construction
 * (idempotent no-op on verified orders) and exercised in sandbox, not here.
 */
import { createHmac } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Boundary modules (DB client / schema / drizzle-orm) belong elsewhere;
// mock them so this suite stays pure and offline.
vi.mock('@/lib/db/client', () => ({ db: {} }));
vi.mock('@/lib/db/schema', () => ({}));
vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
}));
vi.mock('../manual-upi', () => ({
  runUnlockHooks: vi.fn(),
}));

import {
  buildCashfreeOrderPayload,
  getCashfreeConfig,
  isCashfreePaidStatus,
  isValidIndianPhone,
  paiseToRupees,
  verifyCashfreeWebhookSignature,
} from '../cashfree';

const ENV_KEYS = [
  'CASHFREE_ENV',
  'CASHFREE_CLIENT_ID',
  'CASHFREE_CLIENT_SECRET',
  'CASHFREE_LIVE_CLIENT_ID',
  'CASHFREE_LIVE_CLIENT_SECRET',
];

beforeEach(() => {
  for (const k of ENV_KEYS) delete process.env[k];
});

describe('getCashfreeConfig', () => {
  it('defaults to sandbox with the sandbox key pair and host', () => {
    process.env.CASHFREE_CLIENT_ID = 'TEST_id';
    process.env.CASHFREE_CLIENT_SECRET = 'TEST_secret';
    const cfg = getCashfreeConfig();
    expect(cfg.env).toBe('sandbox');
    expect(cfg.clientId).toBe('TEST_id');
    expect(cfg.clientSecret).toBe('TEST_secret');
    expect(cfg.baseUrl).toBe('https://sandbox.cashfree.com/pg');
    expect(cfg.checkoutMode).toBe('sandbox');
  });

  it('switches to production keys + host when CASHFREE_ENV=production', () => {
    process.env.CASHFREE_ENV = 'production';
    process.env.CASHFREE_LIVE_CLIENT_ID = 'PROD_id';
    process.env.CASHFREE_LIVE_CLIENT_SECRET = 'PROD_secret';
    const cfg = getCashfreeConfig();
    expect(cfg.env).toBe('production');
    expect(cfg.clientId).toBe('PROD_id');
    expect(cfg.baseUrl).toBe('https://api.cashfree.com/pg');
    expect(cfg.checkoutMode).toBe('production');
  });

  it('throws when the active env key pair is missing', () => {
    expect(() => getCashfreeConfig()).toThrow(/not configured/);
    process.env.CASHFREE_ENV = 'production';
    process.env.CASHFREE_CLIENT_ID = 'TEST_id';
    process.env.CASHFREE_CLIENT_SECRET = 'TEST_secret';
    // sandbox keys must NOT satisfy production
    expect(() => getCashfreeConfig()).toThrow(/not configured/);
  });

  it('rejects unknown CASHFREE_ENV values', () => {
    process.env.CASHFREE_ENV = 'staging';
    process.env.CASHFREE_CLIENT_ID = 'x';
    process.env.CASHFREE_CLIENT_SECRET = 'y';
    expect(() => getCashfreeConfig()).toThrow(/CASHFREE_ENV/);
  });
});

describe('paiseToRupees', () => {
  it('converts paise to rupees decimal (Cashfree takes rupees, not paise)', () => {
    expect(paiseToRupees(1900)).toBe(19);
    expect(paiseToRupees(1999)).toBe(19.99);
    expect(paiseToRupees(8900)).toBe(89);
  });
  it('rejects non-positive or non-integer amounts', () => {
    expect(() => paiseToRupees(0)).toThrow();
    expect(() => paiseToRupees(-100)).toThrow();
    expect(() => paiseToRupees(19.5)).toThrow();
  });
});

describe('isValidIndianPhone', () => {
  it('accepts 10-digit Indian mobiles', () => {
    expect(isValidIndianPhone('9876543210')).toBe(true);
    expect(isValidIndianPhone(' 8123456789 ')).toBe(true);
  });
  it('rejects short, long, or non-mobile numbers', () => {
    expect(isValidIndianPhone('987654321')).toBe(false);
    expect(isValidIndianPhone('19876543210')).toBe(false);
    expect(isValidIndianPhone('5876543210')).toBe(false);
    expect(isValidIndianPhone('abcdefghij')).toBe(false);
    expect(isValidIndianPhone('')).toBe(false);
  });
});

describe('buildCashfreeOrderPayload', () => {
  const base = {
    cashfreeOrderId: 'etch_VLSH8H4K2P_lz3abc',
    amountPaise: 1900,
    customerId: 'user_123',
    customerPhone: '9876543210',
    returnUrl: 'https://tryetch.online/api/cashfree/return',
    notifyUrl: 'https://tryetch.online/api/cashfree/webhook',
  };

  it('shapes the payload with server-side amounts in rupees', () => {
    const p = buildCashfreeOrderPayload({ ...base, customerEmail: 'a@b.com' });
    expect(p.order_id).toBe('etch_VLSH8H4K2P_lz3abc');
    expect(p.order_amount).toBe(19);
    expect(p.order_currency).toBe('INR');
    expect(p.customer_details).toEqual({
      customer_id: 'user_123',
      customer_email: 'a@b.com',
      customer_phone: '9876543210',
    });
    expect(p.order_meta.return_url).toContain('/api/cashfree/return');
    expect(p.order_meta.notify_url).toContain('/api/cashfree/webhook');
  });

  it('omits blank optional email instead of sending an empty string', () => {
    const p = buildCashfreeOrderPayload({ ...base, customerEmail: '   ' });
    expect('customer_email' in p.customer_details).toBe(false);
    const q = buildCashfreeOrderPayload(base);
    expect('customer_email' in q.customer_details).toBe(false);
  });

  it('rejects invalid phone numbers before any network call', () => {
    expect(() =>
      buildCashfreeOrderPayload({ ...base, customerPhone: '123' })
    ).toThrow(/customerPhone/);
  });

  it('rejects bad order ids and amounts', () => {
    expect(() =>
      buildCashfreeOrderPayload({ ...base, cashfreeOrderId: '' })
    ).toThrow();
    expect(() =>
      buildCashfreeOrderPayload({ ...base, amountPaise: 0 })
    ).toThrow();
  });

  it('matches Cashfree\'s documented required-fields contract', () => {
    // Per Cashfree PG docs, POST /pg/orders requires: order_amount,
    // order_currency, customer_details.customer_id,
    // customer_details.customer_phone. A missing field surfaces as a
    // checkout-side "technical glitch", so lock the contract here.
    const p = buildCashfreeOrderPayload(base);
    expect(typeof p.order_amount).toBe('number');
    expect(p.order_amount).toBeGreaterThan(0);
    expect(p.order_currency).toBe('INR');
    expect(p.customer_details.customer_id).toBeTruthy();
    expect(p.customer_details.customer_phone).toMatch(/^[6-9]\d{9}$/);
    expect(p.order_meta.return_url).toBeTruthy();
    expect(p.order_meta.notify_url).toBeTruthy();
  });

  it('keeps return_url a static path (Cashfree appends ?order_id itself)', () => {
    // Cashfree appends "?order_id=<id>" to the return_url. If the URL
    // already carried a query string (?code=...), the append would mangle
    // it and the return handler could not find the order.
    const p = buildCashfreeOrderPayload(base);
    expect(p.order_meta.return_url).not.toContain('?');
    expect(new URL(p.order_meta.return_url).pathname).toBe(
      '/api/cashfree/return'
    );
  });
});

describe('verifyCashfreeWebhookSignature', () => {
  const secret = 'test_secret_123';
  const timestamp = '2026-10-08T00:00:00Z';
  const rawBody = '{"type":"PAYMENT_SUCCESS_WEBHOOK","data":{"order":{"order_amount":19.00}}}';
  const valid = createHmac('sha256', secret)
    .update(timestamp + rawBody, 'utf8')
    .digest('base64');

  it('accepts a correctly signed webhook', () => {
    expect(
      verifyCashfreeWebhookSignature({
        signature: valid,
        timestamp,
        rawBody,
        secret,
      })
    ).toBe(true);
  });

  it('rejects a tampered body', () => {
    expect(
      verifyCashfreeWebhookSignature({
        signature: valid,
        timestamp,
        rawBody: rawBody.replace('19.00', '190.00'),
        secret,
      })
    ).toBe(false);
  });

  it('rejects a wrong timestamp or wrong secret', () => {
    expect(
      verifyCashfreeWebhookSignature({
        signature: valid,
        timestamp: '2026-10-08T00:00:01Z',
        rawBody,
        secret,
      })
    ).toBe(false);
    expect(
      verifyCashfreeWebhookSignature({
        signature: valid,
        timestamp,
        rawBody,
        secret: 'other_secret',
      })
    ).toBe(false);
  });

  it('rejects missing signature/timestamp/secret', () => {
    expect(
      verifyCashfreeWebhookSignature({
        signature: null,
        timestamp,
        rawBody,
        secret,
      })
    ).toBe(false);
    expect(
      verifyCashfreeWebhookSignature({ signature: valid, timestamp: null, rawBody, secret })
    ).toBe(false);
  });
});

describe('isCashfreePaidStatus', () => {
  it('only PAID counts as paid', () => {
    expect(isCashfreePaidStatus('PAID')).toBe(true);
    expect(isCashfreePaidStatus('ACTIVE')).toBe(false);
    expect(isCashfreePaidStatus('EXPIRED')).toBe(false);
    expect(isCashfreePaidStatus('FAILED')).toBe(false);
  });
});
