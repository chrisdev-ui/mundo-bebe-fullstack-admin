import { pgTable, index, foreignKey, uuid, text, boolean, timestamp, unique, check, integer, uniqueIndex, primaryKey, pgEnum } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const addressType = pgEnum("address_type", ['BILLING', 'SHIPPING'])
export const currency = pgEnum("currency", ['COP', 'USD', 'EUR'])
export const discountScope = pgEnum("discount_scope", ['PRODUCT', 'VARIANT', 'CATEGORY', 'SUBCATEGORY', 'PRODUCT_TYPE', 'SITE_WIDE'])
export const discountType = pgEnum("discount_type", ['PERCENTAGE', 'FIXED'])
export const orderStatus = pgEnum("order_status", ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED'])
export const paymentMethod = pgEnum("payment_method", ['COD', 'BANK_TRANSFER', 'PAYU', 'WOMPI'])
export const paymentStatus = pgEnum("payment_status", ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED'])
export const shippingStatus = pgEnum("shipping_status", ['PROCESSING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'RETURNED'])
export const userRole = pgEnum("user_role", ['USER', 'GUEST', 'ADMIN', 'SUPER_ADMIN'])



export const address = pgTable("address", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid().notNull(),
	type: addressType().notNull(),
	firstName: text().notNull(),
	lastName: text().notNull(),
	address1: text().notNull(),
	address2: text(),
	city: text().notNull(),
	department: text().notNull(),
	postalCode: text(),
	country: text().default('Colombia').notNull(),
	phone: text(),
	isDefault: boolean("is_default").default(false).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		userTypeIdx: index("address_user_type_idx").using("btree", table.userId.asc().nullsLast(), table.type.asc().nullsLast()),
		addressUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "address_userId_user_id_fk"
		}).onDelete("cascade"),
	}
});

export const category = pgTable("category", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	description: text(),
	active: boolean().default(true).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		nameIdx: index("category_name_idx").using("btree", sql`lower(name)`),
		categorySlugUnique: unique("category_slug_unique").on(table.slug),
	}
});

export const color = pgTable("color", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	code: text().notNull(),
	active: boolean().default(true).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		colorCodeUnique: unique("color_code_unique").on(table.code),
	}
});

export const coupon = pgTable("coupon", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	code: text().notNull(),
	discountType: discountType("discount_type").notNull(),
	value: integer().notNull(),
	minPurchase: integer(),
	maxUses: integer(),
	usedCount: integer().default(0),
	startDate: timestamp({ mode: 'string' }).notNull(),
	endDate: timestamp({ mode: 'string' }),
	active: boolean().default(true),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		couponCodeUniqueConstraint: unique("coupon_code_unique_constraint").on(table.code),
		couponDateCheck: check("coupon_date_check", sql`("endDate" IS NULL) OR ("endDate" > "startDate")`),
		maxUsesCheck: check("max_uses_check", sql`("maxUses" IS NULL) OR ("maxUses" > 0)`),
		minPurchaseCheck: check("min_purchase_check", sql`("minPurchase" IS NULL) OR ("minPurchase" > 0)`),
		typeValueCheck: check("type_value_check", sql`((discount_type = 'PERCENTAGE'::discount_type) AND (value <= 100)) OR (discount_type = 'FIXED'::discount_type)`),
		usedCountNonNegative: check("used_count_non_negative", sql`"usedCount" >= 0`),
		valuePositive: check("value_positive", sql`value > 0`),
	}
});

export const design = pgTable("design", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	code: text().notNull(),
	description: text(),
	active: boolean().default(true).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		designCodeUnique: unique("design_code_unique").on(table.code),
	}
});

export const discount = pgTable("discount", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	code: text(),
	name: text().notNull(),
	description: text(),
	type: discountType().notNull(),
	value: integer().notNull(),
	scope: discountScope().notNull(),
	maxUses: integer(),
	usedCount: integer().default(0).notNull(),
	minOrderAmount: integer(),
	startDate: timestamp({ mode: 'string' }).notNull(),
	endDate: timestamp({ mode: 'string' }).notNull(),
	active: boolean().default(true).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		activeDateIdx: index("discount_active_date_idx").using("btree", table.active.asc().nullsLast(), table.startDate.asc().nullsLast(), table.endDate.asc().nullsLast()),
		activeIdx: index("discount_active_idx").using("btree", table.active.asc().nullsLast()),
		dateIdx: index("discount_date_idx").using("btree", table.startDate.asc().nullsLast(), table.endDate.asc().nullsLast()),
		scopeIdx: index("discount_scope_idx").using("btree", table.scope.asc().nullsLast()),
		discountCodeUnique: unique("discount_code_unique").on(table.code),
		discountCodeUniqueConstraint: unique("discount_code_unique_constraint").on(table.code),
		maxUsesCheck: check("max_uses_check", sql`("maxUses" IS NULL) OR ("maxUses" > 0)`),
		minOrderCheck: check("min_order_check", sql`("minOrderAmount" IS NULL) OR ("minOrderAmount" > 0)`),
		typeValueCheck: check("type_value_check", sql`((type = 'PERCENTAGE'::discount_type) AND (value <= 100)) OR (type = 'FIXED'::discount_type)`),
		usedCountNonNegative: check("used_count_non_negative", sql`"usedCount" >= 0`),
		validDateRangeCheck: check("valid_date_range_check", sql`"endDate" > "startDate"`),
		valuePositive: check("value_positive", sql`value > 0`),
	}
});

export const discountApplication = pgTable("discount_application", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	discountId: uuid().notNull(),
	productId: uuid(),
	variantId: uuid(),
	categoryId: uuid(),
	subcategoryId: uuid(),
	productTypeId: uuid(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	scope: discountScope().notNull(),
},
(table) => {
	return {
		categoryIdx: index("discount_application_category_idx").using("btree", table.discountId.asc().nullsLast(), table.categoryId.asc().nullsLast()),
		productIdx: index("discount_application_product_idx").using("btree", table.discountId.asc().nullsLast(), table.productId.asc().nullsLast()),
		variantIdx: index("discount_application_variant_idx").using("btree", table.discountId.asc().nullsLast(), table.variantId.asc().nullsLast()),
		discountApplicationCategoryIdCategoryIdFk: foreignKey({
			columns: [table.categoryId],
			foreignColumns: [category.id],
			name: "discount_application_categoryId_category_id_fk"
		}).onDelete("cascade"),
		discountApplicationDiscountIdDiscountIdFk: foreignKey({
			columns: [table.discountId],
			foreignColumns: [discount.id],
			name: "discount_application_discountId_discount_id_fk"
		}).onDelete("cascade"),
		discountApplicationProductIdProductIdFk: foreignKey({
			columns: [table.productId],
			foreignColumns: [product.id],
			name: "discount_application_productId_product_id_fk"
		}).onDelete("cascade"),
		discountApplicationProductTypeIdProductTypeIdFk: foreignKey({
			columns: [table.productTypeId],
			foreignColumns: [productType.id],
			name: "discount_application_productTypeId_product_type_id_fk"
		}).onDelete("cascade"),
		discountApplicationSubcategoryIdSubcategoryIdFk: foreignKey({
			columns: [table.subcategoryId],
			foreignColumns: [subcategory.id],
			name: "discount_application_subcategoryId_subcategory_id_fk"
		}).onDelete("cascade"),
		discountApplicationVariantIdProductVariantIdFk: foreignKey({
			columns: [table.variantId],
			foreignColumns: [productVariant.id],
			name: "discount_application_variantId_product_variant_id_fk"
		}).onDelete("cascade"),
		scopeCheck: check("scope_check", sql`CHECK (
CASE
    WHEN (scope = 'PRODUCT'::discount_scope) THEN ("productId" IS NOT NULL)
    WHEN (scope = 'VARIANT'::discount_scope) THEN ("variantId" IS NOT NULL)
    WHEN (scope = 'CATEGORY'::discount_scope) THEN ("categoryId" IS NOT NULL)
    WHEN (scope = 'SUBCATEGORY'::discount_scope) THEN ("subcategoryId" IS NOT NULL)
    WHEN (scope = 'PRODUCT_TYPE'::discount_scope) THEN ("productTypeId" IS NOT NULL)
    WHEN (scope = 'SITE_WIDE'::discount_scope) THEN true
    ELSE NULL::boolean
END)`),
	}
});

export const discountUsage = pgTable("discount_usage", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	discountId: uuid().notNull(),
	userId: uuid().notNull(),
	orderId: uuid().notNull(),
	variantId: uuid().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		orderIdx: index("discount_usage_order_idx").using("btree", table.userId.asc().nullsLast(), table.orderId.asc().nullsLast()),
		userIdx: index("discount_usage_user_idx").using("btree", table.discountId.asc().nullsLast(), table.userId.asc().nullsLast()),
		discountUsageDiscountIdDiscountIdFk: foreignKey({
			columns: [table.discountId],
			foreignColumns: [discount.id],
			name: "discount_usage_discountId_discount_id_fk"
		}).onDelete("cascade"),
		discountUsageOrderIdOrderIdFk: foreignKey({
			columns: [table.orderId],
			foreignColumns: [order.id],
			name: "discount_usage_orderId_order_id_fk"
		}).onDelete("cascade"),
		discountUsageUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "discount_usage_userId_user_id_fk"
		}).onDelete("cascade"),
		discountUsageVariantIdProductVariantIdFk: foreignKey({
			columns: [table.variantId],
			foreignColumns: [productVariant.id],
			name: "discount_usage_variantId_product_variant_id_fk"
		}).onDelete("cascade"),
	}
});

export const invitation = pgTable("invitation", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	used: boolean().default(false).notNull(),
},
(table) => {
	return {
		invitationTokenUnique: unique("invitation_token_unique").on(table.token),
		invitationExpiryFutureCheck: check("invitation_expiry_future_check", sql`expires > created_at`),
	}
});

export const order = pgTable("order", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid().notNull(),
	orderStatus: orderStatus("order_status").default('PENDING').notNull(),
	subtotal: integer().notNull(),
	shippingCost: integer().default(0).notNull(),
	discount: integer().default(0),
	total: integer().notNull(),
	couponId: uuid(),
	billingAddressId: uuid().notNull(),
	shippingAddressId: uuid().notNull(),
	notes: text(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		couponIdx: index("order_coupon_idx").using("btree", table.couponId.asc().nullsLast()),
		createdAtIdx: index("order_created_at_idx").using("btree", table.createdAt.asc().nullsLast()),
		dateStatusIdx: index("order_date_status_idx").using("btree", table.createdAt.asc().nullsLast(), table.orderStatus.asc().nullsLast()),
		userStatusIdx: index("order_user_status_idx").using("btree", table.userId.asc().nullsLast(), table.orderStatus.asc().nullsLast()),
		orderBillingAddressIdAddressIdFk: foreignKey({
			columns: [table.billingAddressId],
			foreignColumns: [address.id],
			name: "order_billingAddressId_address_id_fk"
		}).onDelete("restrict"),
		orderCouponIdCouponIdFk: foreignKey({
			columns: [table.couponId],
			foreignColumns: [coupon.id],
			name: "order_couponId_coupon_id_fk"
		}).onDelete("set null"),
		orderShippingAddressIdAddressIdFk: foreignKey({
			columns: [table.shippingAddressId],
			foreignColumns: [address.id],
			name: "order_shippingAddressId_address_id_fk"
		}).onDelete("restrict"),
		orderUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "order_userId_user_id_fk"
		}).onDelete("cascade"),
		discountNonNegative: check("discount_non_negative", sql`discount >= 0`),
		shippingCostNonNegative: check("shipping_cost_non_negative", sql`"shippingCost" >= 0`),
		subtotalNonNegative: check("subtotal_non_negative", sql`subtotal >= 0`),
		totalCalculationCheck: check("total_calculation_check", sql`total = ((subtotal + "shippingCost") - discount)`),
		totalNonNegative: check("total_non_negative", sql`total >= 0`),
	}
});

export const orderItem = pgTable("order_item", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid().notNull(),
	variantId: uuid().notNull(),
	quantity: integer().notNull(),
	price: integer().notNull(),
	originalPrice: integer().notNull(),
	discountedPrice: integer(),
	discountId: uuid(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		priceIdx: index("order_item_price_idx").using("btree", table.orderId.asc().nullsLast(), table.originalPrice.asc().nullsLast(), table.discountedPrice.asc().nullsLast()),
		orderItemDiscountIdDiscountIdFk: foreignKey({
			columns: [table.discountId],
			foreignColumns: [discount.id],
			name: "order_item_discountId_discount_id_fk"
		}).onDelete("set null"),
		orderItemOrderIdOrderIdFk: foreignKey({
			columns: [table.orderId],
			foreignColumns: [order.id],
			name: "order_item_orderId_order_id_fk"
		}).onDelete("cascade"),
		orderItemVariantIdProductVariantIdFk: foreignKey({
			columns: [table.variantId],
			foreignColumns: [productVariant.id],
			name: "order_item_variantId_product_variant_id_fk"
		}).onDelete("cascade"),
		orderVariantUnique: unique("order_variant_unique").on(table.orderId, table.variantId),
		discountedPriceCheck: check("discounted_price_check", sql`("discountedPrice" IS NULL) OR ("discountedPrice" >= 0)`),
		originalPriceNonNegative: check("original_price_non_negative", sql`"originalPrice" >= 0`),
		priceNonNegative: check("price_non_negative", sql`price >= 0`),
		quantityPositive: check("quantity_positive", sql`quantity > 0`),
	}
});

export const payment = pgTable("payment", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid().notNull(),
	amount: integer().notNull(),
	currency: currency().default('COP').notNull(),
	provider: text(),
	paymentStatus: paymentStatus("payment_status").default('PENDING').notNull(),
	transactionId: text(),
	paymentMethod: paymentMethod().notNull(),
	last4Digits: text(),
	expiryDate: text(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		statusIdx: index("payment_status_idx").using("btree", table.paymentStatus.asc().nullsLast()),
		paymentOrderIdOrderIdFk: foreignKey({
			columns: [table.orderId],
			foreignColumns: [order.id],
			name: "payment_orderId_order_id_fk"
		}).onDelete("cascade"),
		paymentTransactionUnique: unique("payment_transaction_unique").on(table.transactionId),
		amountPositive: check("amount_positive", sql`amount > 0`),
	}
});

export const product = pgTable("product", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	subcategoryId: uuid().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	description: text(),
	basePrice: integer().notNull(),
	archived: boolean().default(false).notNull(),
	isFeatured: boolean().default(false).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		activeArchivedIdx: index("product_active_archived_idx").using("btree", table.archived.asc().nullsLast(), table.isFeatured.asc().nullsLast()),
		featuredIdx: index("product_featured_idx").using("btree", table.isFeatured.asc().nullsLast(), table.createdAt.asc().nullsLast()),
		nameIdx: index("product_name_idx").using("btree", sql`lower(name)`),
		priceIdx: index("product_price_idx").using("btree", table.basePrice.asc().nullsLast()),
		searchIdx: index("product_search_idx").using("btree", table.name.asc().nullsLast(), table.archived.asc().nullsLast(), table.isFeatured.asc().nullsLast()),
		subcategoryActiveIdx: index("product_subcategory_active_idx").using("btree", table.subcategoryId.asc().nullsLast(), table.archived.asc().nullsLast()),
		productSubcategoryIdSubcategoryIdFk: foreignKey({
			columns: [table.subcategoryId],
			foreignColumns: [subcategory.id],
			name: "product_subcategoryId_subcategory_id_fk"
		}).onDelete("cascade"),
		productSlugUnique: unique("product_slug_unique").on(table.slug),
		basePriceCheck: check("base_price_check", sql`"basePrice" >= 0`),
	}
});

export const productImage = pgTable("product_image", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	variantId: uuid().notNull(),
	cloudflareId: text().notNull(),
	url: text().notNull(),
	order: integer().default(0),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		productImageVariantIdProductVariantIdFk: foreignKey({
			columns: [table.variantId],
			foreignColumns: [productVariant.id],
			name: "product_image_variantId_product_variant_id_fk"
		}).onDelete("cascade"),
		orderNonNegative: check("order_non_negative", sql`"order" >= 0`),
	}
});

export const productSupplier = pgTable("product_supplier", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	productId: uuid().notNull(),
	supplierId: uuid().notNull(),
	supplierSku: text(),
	supplierPrice: integer().notNull(),
	isMainSupplier: boolean().default(false),
	leadTime: integer(),
	minimumOrder: integer(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		productSupplierProductIdProductIdFk: foreignKey({
			columns: [table.productId],
			foreignColumns: [product.id],
			name: "product_supplier_productId_product_id_fk"
		}).onDelete("cascade"),
		productSupplierSupplierIdSupplierIdFk: foreignKey({
			columns: [table.supplierId],
			foreignColumns: [supplier.id],
			name: "product_supplier_supplierId_supplier_id_fk"
		}).onDelete("cascade"),
		leadTimeCheck: check("lead_time_check", sql`("leadTime" IS NULL) OR ("leadTime" > 0)`),
		minimumOrderCheck: check("minimum_order_check", sql`("minimumOrder" IS NULL) OR ("minimumOrder" > 0)`),
		supplierPricePositive: check("supplier_price_positive", sql`"supplierPrice" > 0`),
	}
});

export const productType = pgTable("product_type", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	code: text().notNull(),
	description: text(),
	active: boolean().default(true),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		productTypeCodeUnique: unique("product_type_code_unique").on(table.code),
	}
});

export const productVariant = pgTable("product_variant", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	productId: uuid().notNull(),
	sizeId: uuid(),
	colorId: uuid(),
	designId: uuid(),
	typeId: uuid(),
	sku: text().notNull(),
	price: integer().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		attributesIdx: index("product_variant_attributes_idx").using("btree", table.sizeId.asc().nullsLast(), table.colorId.asc().nullsLast(), table.designId.asc().nullsLast(), table.typeId.asc().nullsLast()),
		priceIdx: index("product_variant_price_idx").using("btree", table.price.asc().nullsLast()),
		variantProductIdx: index("variant_product_idx").using("btree", table.productId.asc().nullsLast()),
		variantSkuIdx: index("variant_sku_idx").using("btree", table.sku.asc().nullsLast()),
		productVariantColorIdColorIdFk: foreignKey({
			columns: [table.colorId],
			foreignColumns: [color.id],
			name: "product_variant_colorId_color_id_fk"
		}).onDelete("set null"),
		productVariantDesignIdDesignIdFk: foreignKey({
			columns: [table.designId],
			foreignColumns: [design.id],
			name: "product_variant_designId_design_id_fk"
		}).onDelete("set null"),
		productVariantProductIdProductIdFk: foreignKey({
			columns: [table.productId],
			foreignColumns: [product.id],
			name: "product_variant_productId_product_id_fk"
		}).onDelete("cascade"),
		productVariantSizeIdSizeIdFk: foreignKey({
			columns: [table.sizeId],
			foreignColumns: [size.id],
			name: "product_variant_sizeId_size_id_fk"
		}).onDelete("set null"),
		productVariantTypeIdProductTypeIdFk: foreignKey({
			columns: [table.typeId],
			foreignColumns: [productType.id],
			name: "product_variant_typeId_product_type_id_fk"
		}).onDelete("set null"),
		variantCombinationUnique: unique("variant_combination_unique").on(table.productId, table.sizeId, table.colorId, table.designId, table.typeId),
		variantSkuUnique: unique("variant_sku_unique").on(table.sku),
		variantPriceCheck: check("variant_price_check", sql`price >= 0`),
	}
});

export const productVariantInventory = pgTable("product_variant_inventory", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	variantId: uuid().notNull(),
	stock: integer().default(0).notNull(),
	lowStockThreshold: integer().default(5).notNull(),
	restockDate: timestamp({ mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		inventoryStockIdx: index("inventory_stock_idx").using("btree", table.stock.asc().nullsLast()),
		inventoryVariantIdx: index("inventory_variant_idx").using("btree", table.variantId.asc().nullsLast()),
		productVariantInventoryVariantIdProductVariantIdFk: foreignKey({
			columns: [table.variantId],
			foreignColumns: [productVariant.id],
			name: "product_variant_inventory_variantId_product_variant_id_fk"
		}).onDelete("cascade"),
		stockNonNegative: check("stock_non_negative", sql`stock >= 0`),
		thresholdPositive: check("threshold_positive", sql`"lowStockThreshold" > 0`),
	}
});

export const review = pgTable("review", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	productId: uuid().notNull(),
	userId: uuid().notNull(),
	rating: integer().notNull(),
	title: text(),
	content: text(),
	isVerifiedPurchase: boolean().default(false),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		productRatingIdx: index("review_product_rating_idx").using("btree", table.productId.asc().nullsLast(), table.rating.asc().nullsLast()),
		verifiedIdx: index("review_verified_idx").using("btree", table.isVerifiedPurchase.asc().nullsLast()),
		reviewProductIdProductIdFk: foreignKey({
			columns: [table.productId],
			foreignColumns: [product.id],
			name: "review_productId_product_id_fk"
		}).onDelete("cascade"),
		reviewUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "review_userId_user_id_fk"
		}).onDelete("cascade"),
		ratingRangeCheck: check("rating_range_check", sql`(rating >= 1) AND (rating <= 5)`),
	}
});

export const session = pgTable("session", {
	sessionToken: text().primaryKey().notNull(),
	userId: uuid().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
},
(table) => {
	return {
		sessionUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_userId_user_id_fk"
		}).onDelete("cascade"),
		expiryFutureCheck: check("expiry_future_check", sql`expires > now()`),
	}
});

export const shipping = pgTable("shipping", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid().notNull(),
	shippingStatus: shippingStatus("shipping_status").default('PROCESSING').notNull(),
	courier: text(),
	trackingNumber: text(),
	estimatedDelivery: timestamp({ mode: 'string' }),
	shippingCost: integer().default(0).notNull(),
	addressId: uuid().notNull(),
	actualDelivery: timestamp({ mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		statusIdx: index("shipping_status_idx").using("btree", table.shippingStatus.asc().nullsLast()),
		shippingAddressIdAddressIdFk: foreignKey({
			columns: [table.addressId],
			foreignColumns: [address.id],
			name: "shipping_addressId_address_id_fk"
		}).onDelete("cascade"),
		shippingOrderIdOrderIdFk: foreignKey({
			columns: [table.orderId],
			foreignColumns: [order.id],
			name: "shipping_orderId_order_id_fk"
		}).onDelete("cascade"),
		shippingTrackingUnique: unique("shipping_tracking_unique").on(table.trackingNumber),
		deliveryDateCheck: check("delivery_date_check", sql`("actualDelivery" IS NULL) OR ("actualDelivery" >= "estimatedDelivery")`),
		shippingCostNonNegative: check("shipping_cost_non_negative", sql`"shippingCost" >= 0`),
	}
});

export const size = pgTable("size", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	code: text().notNull(),
	order: integer().default(0),
	active: boolean().default(true).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		sizeCodeUnique: unique("size_code_unique").on(table.code),
	}
});

export const subcategory = pgTable("subcategory", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	categoryId: uuid().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	description: text(),
	active: boolean().default(true).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		subCategoryNameIdx: index("sub_category_name_idx").using("btree", sql`lower(name)`),
		subcategoryCategoryIdCategoryIdFk: foreignKey({
			columns: [table.categoryId],
			foreignColumns: [category.id],
			name: "subcategory_categoryId_category_id_fk"
		}).onDelete("cascade"),
		subcategorySlugUnique: unique("subcategory_slug_unique").on(table.slug),
	}
});

export const supplier = pgTable("supplier", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	contactPerson: text(),
	email: text(),
	phone: text(),
	address: text(),
	taxId: text(),
	notes: text(),
	active: boolean().default(true),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		supplierEmailUnique: unique("supplier_email_unique").on(table.email),
		supplierTaxIdUnique: unique("supplier_tax_id_unique").on(table.taxId),
	}
});

export const user = pgTable("user", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text(),
	lastName: text("last_name"),
	username: text().notNull(),
	password: text().notNull(),
	email: text().notNull(),
	documentId: text("document_id"),
	emailVerified: timestamp({ mode: 'string' }),
	role: userRole().default('USER').notNull(),
	image: text(),
	phoneNumber: text("phone_number"),
	dob: timestamp({ mode: 'string' }),
	active: boolean().default(true).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		emailUniqueIdx: uniqueIndex("email_unique_index").using("btree", sql`lower(email)`),
		ameUniqueIdx: uniqueIndex("username_unique_index").using("btree", sql`lower(username)`),
		userDocumentIdUnique: unique("user_document_id_unique").on(table.documentId),
		userEmailUnique: unique("user_email_unique").on(table.email),
		userUsernameUnique: unique("user_username_unique").on(table.username),
	}
});

export const wishlist = pgTable("wishlist", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid().notNull(),
	variantId: uuid().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		userVariantUnique: uniqueIndex("wishlist_user_variant_unique").using("btree", table.userId.asc().nullsLast(), table.variantId.asc().nullsLast()),
		wishlistUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "wishlist_userId_user_id_fk"
		}).onDelete("cascade"),
		wishlistVariantIdProductVariantIdFk: foreignKey({
			columns: [table.variantId],
			foreignColumns: [productVariant.id],
			name: "wishlist_variantId_product_variant_id_fk"
		}).onDelete("cascade"),
	}
});

export const verificationToken = pgTable("verificationToken", {
	identifier: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
},
(table) => {
	return {
		verificationTokenIdentifierTokenPk: primaryKey({ columns: [table.identifier, table.token], name: "verificationToken_identifier_token_pk"}),
	}
});

export const authenticator = pgTable("authenticator", {
	credentialId: text().notNull(),
	userId: uuid().notNull(),
	providerAccountId: text().notNull(),
	credentialPublicKey: text().notNull(),
	counter: integer().notNull(),
	credentialDeviceType: text().notNull(),
	credentialBackedUp: boolean().notNull(),
	transports: text(),
},
(table) => {
	return {
		authenticatorUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "authenticator_userId_user_id_fk"
		}).onDelete("cascade"),
		authenticatorUserIdCredentialIdPk: primaryKey({ columns: [table.credentialId, table.userId], name: "authenticator_userId_credentialID_pk"}),
		authenticatorCredentialIdUnique: unique("authenticator_credentialID_unique").on(table.credentialId),
	}
});

export const account = pgTable("account", {
	userId: uuid().notNull(),
	type: text().notNull(),
	provider: text().notNull(),
	providerAccountId: text().notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: integer("expires_at"),
	tokenType: text("token_type"),
	scope: text(),
	idToken: text("id_token"),
	sessionState: text("session_state"),
},
(table) => {
	return {
		accountUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_userId_user_id_fk"
		}).onDelete("cascade"),
		accountProviderProviderAccountIdPk: primaryKey({ columns: [table.provider, table.providerAccountId], name: "account_provider_providerAccountId_pk"}),
	}
});
