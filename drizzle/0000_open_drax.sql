CREATE TYPE "public"."address_type" AS ENUM('BILLING', 'SHIPPING');--> statement-breakpoint
CREATE TYPE "public"."currency" AS ENUM('COP', 'USD', 'EUR');--> statement-breakpoint
CREATE TYPE "public"."discount_scope" AS ENUM('PRODUCT', 'VARIANT', 'CATEGORY', 'SUBCATEGORY', 'PRODUCT_TYPE', 'SITE_WIDE');--> statement-breakpoint
CREATE TYPE "public"."discount_type" AS ENUM('PERCENTAGE', 'FIXED');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('COD', 'BANK_TRANSFER', 'PAYU', 'WOMPI');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."shipping_status" AS ENUM('PROCESSING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'RETURNED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('USER', 'GUEST', 'ADMIN', 'SUPER_ADMIN');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account" (
	"userId" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "address" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"type" "address_type" NOT NULL,
	"firstName" text NOT NULL,
	"lastName" text NOT NULL,
	"address1" text NOT NULL,
	"address2" text,
	"city" text NOT NULL,
	"department" text NOT NULL,
	"postalCode" text,
	"country" text DEFAULT 'Colombia' NOT NULL,
	"phone" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "authenticator" (
	"credentialId" text NOT NULL,
	"userId" uuid NOT NULL,
	"providerAccountId" text NOT NULL,
	"credentialPublicKey" text NOT NULL,
	"counter" integer NOT NULL,
	"credentialDeviceType" text NOT NULL,
	"credentialBackedUp" boolean NOT NULL,
	"transports" text,
	CONSTRAINT "authenticator_userId_credentialID_pk" PRIMARY KEY("credentialId","userId"),
	CONSTRAINT "authenticator_credentialID_unique" UNIQUE("credentialId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "color" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "color_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coupon" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"discount_type" "discount_type" NOT NULL,
	"value" integer NOT NULL,
	"minPurchase" integer,
	"maxUses" integer,
	"usedCount" integer DEFAULT 0,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp,
	"active" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "coupon_code_unique_constraint" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "design" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "design_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "discount" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text,
	"name" text NOT NULL,
	"description" text,
	"type" "discount_type" NOT NULL,
	"value" integer NOT NULL,
	"scope" "discount_scope" NOT NULL,
	"maxUses" integer,
	"usedCount" integer DEFAULT 0 NOT NULL,
	"minOrderAmount" integer,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "discount_code_unique" UNIQUE("code"),
	CONSTRAINT "discount_code_unique_constraint" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "discount_application" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"discountId" uuid NOT NULL,
	"productId" uuid,
	"variantId" uuid,
	"categoryId" uuid,
	"subcategoryId" uuid,
	"productTypeId" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "discount_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"discountId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"orderId" uuid NOT NULL,
	"variantId" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invitation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	CONSTRAINT "invitation_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"order_status" "order_status" DEFAULT 'PENDING' NOT NULL,
	"subtotal" integer NOT NULL,
	"shippingCost" integer DEFAULT 0 NOT NULL,
	"discount" integer DEFAULT 0,
	"total" integer NOT NULL,
	"couponId" uuid,
	"billingAddressId" uuid NOT NULL,
	"shippingAddressId" uuid NOT NULL,
	"notes" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orderId" uuid NOT NULL,
	"variantId" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"price" integer NOT NULL,
	"originalPrice" integer NOT NULL,
	"discountedPrice" integer,
	"discountId" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orderId" uuid NOT NULL,
	"amount" integer NOT NULL,
	"currency" "currency" DEFAULT 'COP' NOT NULL,
	"provider" text,
	"payment_status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"transactionId" text,
	"paymentMethod" "payment_method" NOT NULL,
	"last4Digits" text,
	"expiryDate" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payment_transaction_unique" UNIQUE("transactionId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subcategoryId" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"basePrice" integer NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"isFeatured" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_image" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variantId" uuid NOT NULL,
	"cloudflareId" text NOT NULL,
	"url" text NOT NULL,
	"order" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_supplier" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"productId" uuid NOT NULL,
	"supplierId" uuid NOT NULL,
	"supplierSku" text,
	"supplierPrice" integer NOT NULL,
	"isMainSupplier" boolean DEFAULT false,
	"leadTime" integer,
	"minimumOrder" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_type" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"active" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_type_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_variant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"productId" uuid NOT NULL,
	"sizeId" uuid,
	"colorId" uuid,
	"designId" uuid,
	"typeId" uuid,
	"sku" text NOT NULL,
	"price" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "variant_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_variant_inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variantId" uuid NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"lowStockThreshold" integer DEFAULT 5 NOT NULL,
	"restockDate" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "review" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"productId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"rating" integer NOT NULL,
	"title" text,
	"content" text,
	"isVerifiedPurchase" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shipping" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orderId" uuid NOT NULL,
	"shipping_status" "shipping_status" DEFAULT 'PROCESSING' NOT NULL,
	"courier" text,
	"trackingNumber" text,
	"estimatedDelivery" timestamp,
	"shippingCost" integer DEFAULT 0 NOT NULL,
	"addressId" uuid NOT NULL,
	"actualDelivery" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shipping_tracking_unique" UNIQUE("trackingNumber")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "size" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"order" integer DEFAULT 0,
	"active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "size_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subcategory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"categoryId" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subcategory_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "supplier" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"contactPerson" text,
	"email" text,
	"phone" text,
	"address" text,
	"taxId" text,
	"notes" text,
	"active" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"last_name" text,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text NOT NULL,
	"document_id" text,
	"emailVerified" timestamp,
	"role" "user_role" DEFAULT 'USER' NOT NULL,
	"image" text,
	"phone_number" text,
	"dob" timestamp,
	"active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wishlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"variantId" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "address" ADD CONSTRAINT "address_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "authenticator" ADD CONSTRAINT "authenticator_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "discount_application" ADD CONSTRAINT "discount_application_discountId_discount_id_fk" FOREIGN KEY ("discountId") REFERENCES "public"."discount"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "discount_application" ADD CONSTRAINT "discount_application_productId_product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "discount_application" ADD CONSTRAINT "discount_application_variantId_product_variant_id_fk" FOREIGN KEY ("variantId") REFERENCES "public"."product_variant"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "discount_application" ADD CONSTRAINT "discount_application_categoryId_category_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "discount_application" ADD CONSTRAINT "discount_application_subcategoryId_subcategory_id_fk" FOREIGN KEY ("subcategoryId") REFERENCES "public"."subcategory"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "discount_application" ADD CONSTRAINT "discount_application_productTypeId_product_type_id_fk" FOREIGN KEY ("productTypeId") REFERENCES "public"."product_type"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "discount_usage" ADD CONSTRAINT "discount_usage_discountId_discount_id_fk" FOREIGN KEY ("discountId") REFERENCES "public"."discount"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "discount_usage" ADD CONSTRAINT "discount_usage_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "discount_usage" ADD CONSTRAINT "discount_usage_orderId_order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "discount_usage" ADD CONSTRAINT "discount_usage_variantId_product_variant_id_fk" FOREIGN KEY ("variantId") REFERENCES "public"."product_variant"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order" ADD CONSTRAINT "order_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order" ADD CONSTRAINT "order_couponId_coupon_id_fk" FOREIGN KEY ("couponId") REFERENCES "public"."coupon"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order" ADD CONSTRAINT "order_billingAddressId_address_id_fk" FOREIGN KEY ("billingAddressId") REFERENCES "public"."address"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order" ADD CONSTRAINT "order_shippingAddressId_address_id_fk" FOREIGN KEY ("shippingAddressId") REFERENCES "public"."address"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_item" ADD CONSTRAINT "order_item_orderId_order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_item" ADD CONSTRAINT "order_item_variantId_product_variant_id_fk" FOREIGN KEY ("variantId") REFERENCES "public"."product_variant"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_item" ADD CONSTRAINT "order_item_discountId_discount_id_fk" FOREIGN KEY ("discountId") REFERENCES "public"."discount"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment" ADD CONSTRAINT "payment_orderId_order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product" ADD CONSTRAINT "product_subcategoryId_subcategory_id_fk" FOREIGN KEY ("subcategoryId") REFERENCES "public"."subcategory"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_image" ADD CONSTRAINT "product_image_variantId_product_variant_id_fk" FOREIGN KEY ("variantId") REFERENCES "public"."product_variant"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_supplier" ADD CONSTRAINT "product_supplier_productId_product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_supplier" ADD CONSTRAINT "product_supplier_supplierId_supplier_id_fk" FOREIGN KEY ("supplierId") REFERENCES "public"."supplier"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_productId_product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_sizeId_size_id_fk" FOREIGN KEY ("sizeId") REFERENCES "public"."size"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_colorId_color_id_fk" FOREIGN KEY ("colorId") REFERENCES "public"."color"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_designId_design_id_fk" FOREIGN KEY ("designId") REFERENCES "public"."design"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_typeId_product_type_id_fk" FOREIGN KEY ("typeId") REFERENCES "public"."product_type"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_variant_inventory" ADD CONSTRAINT "product_variant_inventory_variantId_product_variant_id_fk" FOREIGN KEY ("variantId") REFERENCES "public"."product_variant"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "review" ADD CONSTRAINT "review_productId_product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "review" ADD CONSTRAINT "review_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shipping" ADD CONSTRAINT "shipping_orderId_order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shipping" ADD CONSTRAINT "shipping_addressId_address_id_fk" FOREIGN KEY ("addressId") REFERENCES "public"."address"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subcategory" ADD CONSTRAINT "subcategory_categoryId_category_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_variantId_product_variant_id_fk" FOREIGN KEY ("variantId") REFERENCES "public"."product_variant"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "address_user_type_idx" ON "address" USING btree ("userId","type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "discount_active_idx" ON "discount" USING btree ("active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "discount_date_idx" ON "discount" USING btree ("startDate","endDate");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "discount_scope_idx" ON "discount" USING btree ("scope");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "discount_active_date_idx" ON "discount" USING btree ("active","startDate","endDate");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "discount_application_product_idx" ON "discount_application" USING btree ("discountId","productId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "discount_application_variant_idx" ON "discount_application" USING btree ("discountId","variantId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "discount_application_category_idx" ON "discount_application" USING btree ("discountId","categoryId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "discount_usage_user_idx" ON "discount_usage" USING btree ("discountId","userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "discount_usage_order_idx" ON "discount_usage" USING btree ("userId","orderId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_user_status_idx" ON "order" USING btree ("userId","order_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_created_at_idx" ON "order" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_coupon_idx" ON "order" USING btree ("couponId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_item_price_idx" ON "order_item" USING btree ("orderId","originalPrice","discountedPrice");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_status_idx" ON "payment" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_active_archived_idx" ON "product" USING btree ("archived","isFeatured");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_price_idx" ON "product" USING btree ("basePrice");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_subcategory_active_idx" ON "product" USING btree ("subcategoryId","archived");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_featured_idx" ON "product" USING btree ("isFeatured","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_variant_attributes_idx" ON "product_variant" USING btree ("sizeId","colorId","designId","typeId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_variant_price_idx" ON "product_variant" USING btree ("price");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "variant_product_idx" ON "product_variant" USING btree ("productId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "variant_sku_idx" ON "product_variant" USING btree ("sku");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inventory_stock_idx" ON "product_variant_inventory" USING btree ("stock");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inventory_variant_idx" ON "product_variant_inventory" USING btree ("variantId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "review_product_rating_idx" ON "review" USING btree ("productId","rating");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "review_verified_idx" ON "review" USING btree ("isVerifiedPurchase");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "shipping_status_idx" ON "shipping" USING btree ("shipping_status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "email_unique_index" ON "user" USING btree (lower(email));--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "username_unique_index" ON "user" USING btree (lower(username));--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "wishlist_user_variant_unique" ON "wishlist" USING btree ("userId","variantId");