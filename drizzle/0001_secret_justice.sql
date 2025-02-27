ALTER TABLE "discount_application" ADD COLUMN "scope" "discount_scope" NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "category_name_idx" ON "category" USING btree (lower("name"));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_name_idx" ON "product" USING btree (lower("name"));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sub_category_name_idx" ON "subcategory" USING btree (lower("name"));--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_variant_unique" UNIQUE("orderId","variantId");--> statement-breakpoint
ALTER TABLE "product_variant" ADD CONSTRAINT "variant_combination_unique" UNIQUE("productId","sizeId","colorId","designId","typeId");--> statement-breakpoint
ALTER TABLE "supplier" ADD CONSTRAINT "supplier_tax_id_unique" UNIQUE("taxId");--> statement-breakpoint
ALTER TABLE "address" ADD CONSTRAINT "phone_format_check" CHECK ("address"."phone" IS NULL OR "address"."phone" ~* '^+?[0-9]{10,15}$');--> statement-breakpoint
ALTER TABLE "coupon" ADD CONSTRAINT "value_positive" CHECK ("coupon"."value" > 0);--> statement-breakpoint
ALTER TABLE "coupon" ADD CONSTRAINT "used_count_non_negative" CHECK ("coupon"."usedCount" >= 0);--> statement-breakpoint
ALTER TABLE "coupon" ADD CONSTRAINT "max_uses_check" CHECK ("coupon"."maxUses" IS NULL OR "coupon"."maxUses" > 0);--> statement-breakpoint
ALTER TABLE "coupon" ADD CONSTRAINT "min_purchase_check" CHECK ("coupon"."minPurchase" IS NULL OR "coupon"."minPurchase" > 0);--> statement-breakpoint
ALTER TABLE "coupon" ADD CONSTRAINT "type_value_check" CHECK (("coupon"."discount_type" = 'PERCENTAGE' AND "coupon"."value" <= 100) OR "coupon"."discount_type" = 'FIXED');--> statement-breakpoint
ALTER TABLE "coupon" ADD CONSTRAINT "coupon_date_check" CHECK ("coupon"."endDate" IS NULL OR "coupon"."endDate" > "coupon"."startDate");--> statement-breakpoint
ALTER TABLE "discount" ADD CONSTRAINT "valid_date_range_check" CHECK ("discount"."endDate" > "discount"."startDate");--> statement-breakpoint
ALTER TABLE "discount" ADD CONSTRAINT "value_positive" CHECK ("discount"."value" > 0);--> statement-breakpoint
ALTER TABLE "discount" ADD CONSTRAINT "used_count_non_negative" CHECK ("discount"."usedCount" >= 0);--> statement-breakpoint
ALTER TABLE "discount" ADD CONSTRAINT "max_uses_check" CHECK ("discount"."maxUses" IS NULL OR "discount"."maxUses" > 0);--> statement-breakpoint
ALTER TABLE "discount" ADD CONSTRAINT "min_order_check" CHECK ("discount"."minOrderAmount" IS NULL OR "discount"."minOrderAmount" > 0);--> statement-breakpoint
ALTER TABLE "discount" ADD CONSTRAINT "type_value_check" CHECK (("discount"."type" = 'PERCENTAGE' AND "discount"."value" <= 100) OR "discount"."type" = 'FIXED');--> statement-breakpoint
ALTER TABLE "discount_application" ADD CONSTRAINT "scope_check" CHECK ((
        CASE 
          WHEN "discount_application"."scope" = 'PRODUCT' THEN "discount_application"."productId" IS NOT NULL
          WHEN "discount_application"."scope" = 'VARIANT' THEN "discount_application"."variantId" IS NOT NULL
          WHEN "discount_application"."scope" = 'CATEGORY' THEN "discount_application"."categoryId" IS NOT NULL
          WHEN "discount_application"."scope" = 'SUBCATEGORY' THEN "discount_application"."subcategoryId" IS NOT NULL
          WHEN "discount_application"."scope" = 'PRODUCT_TYPE' THEN "discount_application"."productTypeId" IS NOT NULL
          WHEN "discount_application"."scope" = 'SITE_WIDE' THEN true
        END
      ));--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_expiry_future_check" CHECK ("invitation"."expires" > "invitation"."created_at");--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "subtotal_non_negative" CHECK ("order"."subtotal" >= 0);--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "shipping_cost_non_negative" CHECK ("order"."shippingCost" >= 0);--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "discount_non_negative" CHECK ("order"."discount" >= 0);--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "total_non_negative" CHECK ("order"."total" >= 0);--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "total_calculation_check" CHECK ("order"."total" = "order"."subtotal" + "order"."shippingCost" - "order"."discount");--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "quantity_positive" CHECK ("order_item"."quantity" > 0);--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "price_non_negative" CHECK ("order_item"."price" >= 0);--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "original_price_non_negative" CHECK ("order_item"."originalPrice" >= 0);--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "discounted_price_check" CHECK ("order_item"."discountedPrice" IS NULL OR "order_item"."discountedPrice" >= 0);--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "amount_positive" CHECK ("payment"."amount" > 0);--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "base_price_check" CHECK ("product"."basePrice" >= 0);--> statement-breakpoint
ALTER TABLE "product_image" ADD CONSTRAINT "order_non_negative" CHECK ("product_image"."order" >= 0);--> statement-breakpoint
ALTER TABLE "product_supplier" ADD CONSTRAINT "supplier_price_positive" CHECK ("product_supplier"."supplierPrice" > 0);--> statement-breakpoint
ALTER TABLE "product_supplier" ADD CONSTRAINT "lead_time_check" CHECK ("product_supplier"."leadTime" IS NULL OR "product_supplier"."leadTime" > 0);--> statement-breakpoint
ALTER TABLE "product_supplier" ADD CONSTRAINT "minimum_order_check" CHECK ("product_supplier"."minimumOrder" IS NULL OR "product_supplier"."minimumOrder" > 0);--> statement-breakpoint
ALTER TABLE "product_variant" ADD CONSTRAINT "variant_price_check" CHECK ("product_variant"."price" >= 0);--> statement-breakpoint
ALTER TABLE "product_variant_inventory" ADD CONSTRAINT "stock_non_negative" CHECK ("product_variant_inventory"."stock" >= 0);--> statement-breakpoint
ALTER TABLE "product_variant_inventory" ADD CONSTRAINT "threshold_positive" CHECK ("product_variant_inventory"."lowStockThreshold" > 0);--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "rating_range_check" CHECK ("review"."rating" BETWEEN 1 AND 5);--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "expiry_future_check" CHECK ("session"."expires" > NOW());--> statement-breakpoint
ALTER TABLE "shipping" ADD CONSTRAINT "shipping_cost_non_negative" CHECK ("shipping"."shippingCost" >= 0);--> statement-breakpoint
ALTER TABLE "shipping" ADD CONSTRAINT "delivery_date_check" CHECK ("shipping"."actualDelivery" IS NULL OR "shipping"."actualDelivery" >= "shipping"."estimatedDelivery");--> statement-breakpoint
ALTER TABLE "supplier" ADD CONSTRAINT "supplier_email_format_check" CHECK ("supplier"."email" IS NULL OR "supplier"."email" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,}$');--> statement-breakpoint
ALTER TABLE "supplier" ADD CONSTRAINT "phone_format_check" CHECK ("supplier"."phone" IS NULL OR "supplier"."phone" ~* '^+?[0-9]{10,15}$');--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "email_format_check" CHECK ("user"."email" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,}$');--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "dob_valid_check" CHECK ("user"."dob" IS NULL OR "user"."dob" <= NOW());--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "phone_format_check" CHECK ("user"."phone_number" IS NULL OR "user"."phone_number" ~* '^+?[0-9]{10,15}$');--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "password_length_check" CHECK (LENGTH("user"."password") >= 8);