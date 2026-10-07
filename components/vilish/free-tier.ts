/**
 * Etch free-tier helpers shared between the composer and the watch room.
 */

import { priceOf } from "@/src/lib/pricing/catalog";

/** sessionStorage key for a just-created video order, so the watch room can reopen payment. */
export function videoPaymentStorageKey(id: string) {
  return `vidish:video-payment:${id}`;
}

/** Amount in paise for the free-tier image unlock — always the catalog single-image price. */
export const FREE_UNLOCK_AMOUNT_PAISE = priceOf("single-image");
/** Amount in paise for a 5s video clip — always the catalog clip price. */
export const VIDEO_CLIP_AMOUNT_PAISE = priceOf("clip-5s");
