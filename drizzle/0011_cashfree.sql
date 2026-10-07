-- Cashfree online payments: link gateway order/payment ids to internal rows.
-- orders.cashfree_order_id stores the Cashfree PG order id (etch_<code>_<ts>);
-- payments.cashfree_payment_id stores the gateway cf_payment_id.
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "cashfree_order_id" text;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "orders_cashfree_order_id_unique" ON "orders" ("cashfree_order_id");
--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "cashfree_payment_id" text;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "payments_cashfree_payment_id_unique" ON "payments" ("cashfree_payment_id");
