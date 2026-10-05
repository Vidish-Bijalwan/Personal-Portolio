/**
 * Pixaura free-tier helpers shared between the composer and the watch room.
 */

/** sessionStorage key for a just-created video order, so the watch room can reopen payment. */
export function videoPaymentStorageKey(id: string) {
  return `vidish:video-payment:${id}`;
}

/** Amount in paise for the free-tier image unlock (₹29). */
export const FREE_UNLOCK_AMOUNT_PAISE = 2900;
/** Amount in paise for a 5s video clip (₹99). */
export const VIDEO_CLIP_AMOUNT_PAISE = 9900;
