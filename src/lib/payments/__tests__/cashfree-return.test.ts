/**
 * Cashfree return-flow recovery — unit tests. NO network.
 * Covers the session fallback lookup (DB chain mocked) and the
 * pure payment-status state derivation used by /payment/status.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const chain = vi.hoisted(() => {
  const limit = vi.fn();
  const orderBy = vi.fn(() => ({ limit }));
  const where = vi.fn(() => ({ orderBy }));
  const from = vi.fn(() => ({ where }));
  const select = vi.fn(() => ({ from }));
  return { limit, orderBy, where, from, select };
});
const { limit, orderBy, where, from, select } = chain;

vi.mock('@/lib/db/client', () => ({ db: { select: chain.select } }));
vi.mock('@/lib/db/schema', () => ({
  orders: {
    id: 'id',
    code: 'code',
    userId: 'user_id',
    provider: 'provider',
    cashfreeOrderId: 'cashfree_order_id',
    status: 'status',
    createdAt: 'createdAt',
  },
  auditLogs: {},
  generationOrders: {},
  payments: {},
}));
vi.mock('drizzle-orm', () => ({
  eq: (field: string, value: unknown) => ({ op: 'eq', field, value }),
  and: (...conds: unknown[]) => ({ op: 'and', conds }),
  desc: (field: string) => ({ op: 'desc', field }),
  gt: (field: string, value: unknown) => ({ op: 'gt', field, value }),
}));
vi.mock('../manual-upi', () => ({
  runUnlockHooks: vi.fn(),
}));

import {
  derivePaymentStatus,
  findRecentPendingCashfreeOrder,
  type PaymentStatusOrderLite,
} from '../cashfree';

beforeEach(() => {
  vi.clearAllMocks();
});

const lite = (
  status: string,
  createdAt: string,
  code = 'VLSH-TEST1'
): PaymentStatusOrderLite => ({
  code,
  status,
  createdAt,
  destination: '/watch/abc?paid=1',
});

describe('findRecentPendingCashfreeOrder', () => {
  it('returns the most recent pending cashfree order for the user', async () => {
    const row = { code: 'VLSH-ABC1', status: 'PAYMENT_PENDING' };
    limit.mockResolvedValue([row]);
    const got = await findRecentPendingCashfreeOrder('user-1');
    expect(got).toEqual(row);
  });

  it('returns undefined when nothing matches', async () => {
    limit.mockResolvedValue([]);
    const got = await findRecentPendingCashfreeOrder('user-1');
    expect(got).toBeUndefined();
  });

  it('constrains the query to the user + cashfree + PAYMENT_PENDING + recent', async () => {
    limit.mockResolvedValue([]);
    await findRecentPendingCashfreeOrder('user-9', 60);
    expect(where).toHaveBeenCalledTimes(1);
    const firstCall = where.mock.calls[0] as unknown as unknown[];
    expect(firstCall).toBeDefined();
    const whereArg = firstCall[0] as {
      op: string;
      conds: { op: string; field: string; value: unknown }[];
    };
    expect(whereArg.op).toBe('and');
    const byField = Object.fromEntries(
      whereArg.conds.map((c) => [c.field, c])
    );
    // Never another user's orders:
    expect(byField['user_id']).toMatchObject({
      op: 'eq',
      value: 'user-9',
    });
    // Only cashfree-provider orders, only still-pending ones:
    expect(byField['provider']).toMatchObject({
      op: 'eq',
      value: 'cashfree',
    });
    expect(byField['status']).toMatchObject({
      op: 'eq',
      value: 'PAYMENT_PENDING',
    });
    // Old orders (> window) are ignored:
    const created = byField['createdAt'];
    expect(created.op).toBe('gt');
    const cutoff = (created.value as Date).getTime();
    const ageMs = Date.now() - cutoff;
    expect(ageMs).toBeGreaterThan(59 * 60_000);
    expect(ageMs).toBeLessThan(61 * 60_000);
    // Newest first:
    expect(orderBy).toHaveBeenCalledWith({ op: 'desc', field: 'createdAt' });
  });
});

describe('derivePaymentStatus', () => {
  const now = new Date('2026-10-08T03:00:00Z').getTime();

  it('is empty with no orders', () => {
    expect(derivePaymentStatus([], now)).toEqual({
      kind: 'empty',
      order: null,
    });
  });

  it('is verified for PAYMENT_VERIFIED and GENERATION_QUEUED', () => {
    for (const status of ['PAYMENT_VERIFIED', 'GENERATION_QUEUED']) {
      const o = lite(status, '2026-10-08T02:55:00Z');
      expect(derivePaymentStatus([o], now)).toEqual({
        kind: 'verified',
        order: o,
      });
    }
  });

  it('is confirming for a fresh pending order', () => {
    const o = lite('PAYMENT_PENDING', '2026-10-08T02:55:00Z');
    expect(derivePaymentStatus([o], now).kind).toBe('confirming');
  });

  it('is stale for a pending order past the webhook window', () => {
    const o = lite('PAYMENT_PENDING', '2026-10-08T02:40:00Z');
    expect(derivePaymentStatus([o], now).kind).toBe('stale');
  });

  it('is failed for terminal rejection states', () => {
    for (const status of [
      'PAYMENT_REJECTED',
      'PAYMENT_EXPIRED',
      'AMOUNT_MISMATCH',
    ]) {
      const o = lite(status, '2026-10-08T02:55:00Z');
      expect(derivePaymentStatus([o], now).kind).toBe('failed');
    }
  });

  it('uses the newest order', () => {
    const old = lite('PAYMENT_PENDING', '2026-10-08T02:30:00Z', 'VLSH-OLD');
    const fresh = lite('PAYMENT_VERIFIED', '2026-10-08T02:58:00Z', 'VLSH-NEW');
    expect(derivePaymentStatus([fresh, old], now)).toEqual({
      kind: 'verified',
      order: fresh,
    });
  });
});
