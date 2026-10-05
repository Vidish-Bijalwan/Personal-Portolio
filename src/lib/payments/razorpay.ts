// Status: DISABLED (owner decision 2026-10-05; code kept for future)
import type { PaymentProvider } from '@/lib/vilish/types';

/** Razorpay integration point — disabled for the MVP. Manual UPI only. */
export class RazorpayProvider implements PaymentProvider {
  readonly id = 'razorpay' as const;

  async createCheckout(): Promise<{
    upiUri: string;
    qrDataUri?: string;
    qrImageUrl?: string;
    vpa: string;
    payeeName: string;
    expiresAt: string;
  }> {
    throw new Error('Razorpay provider is disabled in this build');
  }
}
