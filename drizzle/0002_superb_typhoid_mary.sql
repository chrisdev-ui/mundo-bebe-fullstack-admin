CREATE INDEX IF NOT EXISTS "order_date_status_idx" ON "order" USING btree ("created_at","order_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_search_idx" ON "product" USING btree ("name","archived","isFeatured");--> statement-breakpoint
ALTER TABLE "supplier" ADD CONSTRAINT "supplier_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_document_id_unique" UNIQUE("document_id");