import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod";

export const currency = pgEnum("currency", ["COP", "USD", "EUR"]);

export const orderStatus = pgEnum("order_status", [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
]);

export const shippingStatus = pgEnum("shipping_status", [
  "PROCESSING",
  "SHIPPED",
  "IN_TRANSIT",
  "DELIVERED",
  "RETURNED",
]);

export const addressType = pgEnum("address_type", ["BILLING", "SHIPPING"]);

export const paymentMethod = pgEnum("payment_method", [
  "COD",
  "BANK_TRANSFER",
  "PAYU",
  "WOMPI",
]);

export const discountType = pgEnum("discount_type", ["PERCENTAGE", "FIXED"]);

export const discountScope = pgEnum("discount_scope", [
  "PRODUCT",
  "VARIANT",
  "CATEGORY",
  "SUBCATEGORY",
  "PRODUCT_TYPE",
  "SITE_WIDE",
]);

export const paymentStatus = pgEnum("payment_status", [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
]);

export const userRole = pgEnum("user_role", [
  "USER",
  "GUEST",
  "ADMIN",
  "SUPER_ADMIN",
]);

const timestamps = {
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
};

export const addresses = pgTable(
  "address",
  {
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
    country: text().notNull().default("Colombia"),
    phone: text(),
    isDefault: boolean("is_default").default(false).notNull(),
    ...timestamps,
  },
  (table) => ({
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
    userTypeIdx: index("address_user_type_idx").on(table.userId, table.type),
  }),
);

export const invitations = pgTable(
  "invitation",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    email: text().notNull(),
    token: text().notNull(),
    expires: timestamp({ mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    used: boolean().default(false).notNull(),
  },
  (table) => {
    return {
      invitationTokenUnique: unique("invitation_token_unique").on(table.token),
      expiryCheck: check(
        "invitation_expiry_future_check",
        sql`${table.expires} > ${table.createdAt}`,
      ),
    };
  },
);

export const session = pgTable(
  "session",
  {
    sessionToken: text().primaryKey().notNull(),
    userId: uuid().notNull(),
    expires: timestamp({ mode: "date" }).notNull(),
  },
  (table) => {
    return {
      sessionUserIdUserIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
        name: "session_userId_user_id_fk",
      }).onDelete("cascade"),
      expiryCheck: check("expiry_future_check", sql`${table.expires} > NOW()`),
    };
  },
);

export const users = pgTable(
  "user",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text(),
    lastName: text("last_name"),
    username: text().notNull(),
    password: text().notNull(),
    email: text().notNull(),
    documentId: text("document_id"),
    emailVerified: timestamp({ mode: "date" }),
    role: userRole().default("USER").notNull(),
    image: text(),
    phoneNumber: text("phone_number"),
    dob: timestamp({ mode: "date" }),
    active: boolean().default(true).notNull(),
    ...timestamps,
  },
  (table) => {
    return {
      emailUniqueIdx: uniqueIndex("email_unique_index").using(
        "btree",
        sql`lower(email)`,
      ),
      usernameUniqueIdx: uniqueIndex("username_unique_index").using(
        "btree",
        sql`lower(username)`,
      ),
      userEmailUnique: unique("user_email_unique").on(table.email),
      userUsernameUnique: unique("user_username_unique").on(table.username),
      documentIdUnique: unique("user_document_id_unique").on(table.documentId),
    };
  },
);

export const verificationToken = pgTable(
  "verificationToken",
  {
    identifier: text().notNull(),
    token: text().notNull(),
    expires: timestamp({ mode: "date" }).notNull(),
  },
  (table) => {
    return {
      verificationTokenIdentifierTokenPk: primaryKey({
        columns: [table.identifier, table.token],
        name: "verificationToken_identifier_token_pk",
      }),
    };
  },
);

export const authenticator = pgTable(
  "authenticator",
  {
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
        foreignColumns: [users.id],
        name: "authenticator_userId_user_id_fk",
      }).onDelete("cascade"),
      authenticatorUserIdCredentialIdPk: primaryKey({
        columns: [table.credentialId, table.userId],
        name: "authenticator_userId_credentialID_pk",
      }),
      authenticatorCredentialIdUnique: unique(
        "authenticator_credentialID_unique",
      ).on(table.credentialId),
    };
  },
);

export const account = pgTable(
  "account",
  {
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
        foreignColumns: [users.id],
        name: "account_userId_user_id_fk",
      }).onDelete("cascade"),
      accountProviderProviderAccountIdPk: primaryKey({
        columns: [table.provider, table.providerAccountId],
        name: "account_provider_providerAccountId_pk",
      }),
    };
  },
);

export const categories = pgTable(
  "category",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    slug: text().notNull(),
    description: text(),
    active: boolean().default(true).notNull(),
    ...timestamps,
  },
  (table) => ({
    categorySlugUnique: unique("category_slug_unique").on(table.slug),
    nameIdx: index("category_name_idx").on(sql`lower(${table.name})`),
  }),
);

export const subcategories = pgTable(
  "subcategory",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    categoryId: uuid().notNull(),
    name: text().notNull(),
    slug: text().notNull(),
    description: text(),
    active: boolean().default(true).notNull(),
    ...timestamps,
  },
  (table) => ({
    categoryFk: foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
    }).onDelete("cascade"),
    slugUnique: unique("subcategory_slug_unique").on(table.slug),
    nameIdx: index("sub_category_name_idx").on(sql`lower(${table.name})`),
  }),
);

export const sizes = pgTable(
  "size",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    code: text().notNull(),
    order: integer().default(0),
    active: boolean().default(true).notNull(),
    ...timestamps,
  },
  (table) => ({
    codeUnique: unique("size_code_unique").on(table.code),
  }),
);

export const colors = pgTable(
  "color",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    code: text().notNull(),
    active: boolean().default(true).notNull(),
    ...timestamps,
  },
  (table) => ({
    codeUnique: unique("color_code_unique").on(table.code),
  }),
);

export const designs = pgTable(
  "design",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    code: text().notNull(),
    description: text(),
    active: boolean().default(true).notNull(),
    ...timestamps,
  },
  (table) => ({
    codeUnique: unique("design_code_unique").on(table.code),
  }),
);

export const products = pgTable(
  "product",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    subcategoryId: uuid().notNull(),
    name: text().notNull(),
    slug: text().notNull(),
    description: text(),
    basePrice: integer().notNull(),
    archived: boolean().default(false).notNull(),
    isFeatured: boolean().default(false).notNull(),
    ...timestamps,
  },
  (table) => ({
    subcategoryFk: foreignKey({
      columns: [table.subcategoryId],
      foreignColumns: [subcategories.id],
    }).onDelete("cascade"),
    slugUnique: unique("product_slug_unique").on(table.slug),
    activeArchivedIdx: index("product_active_archived_idx").on(
      table.archived,
      table.isFeatured,
    ),
    priceIdx: index("product_price_idx").on(table.basePrice),
    subcategoryActiveIdx: index("product_subcategory_active_idx").on(
      table.subcategoryId,
      table.archived,
    ),
    nameIdx: index("product_name_idx").on(sql`lower(${table.name})`),
    featuredIdx: index("product_featured_idx").on(
      table.isFeatured,
      table.createdAt,
    ),
    basePriceCheck: check("base_price_check", sql`${table.basePrice} >= 0`),
    productSearchIdx: index("product_search_idx").on(
      table.name,
      table.archived,
      table.isFeatured,
    ),
  }),
);

export const productVariants = pgTable(
  "product_variant",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    productId: uuid().notNull(),
    sizeId: uuid(),
    colorId: uuid(),
    designId: uuid(),
    typeId: uuid(),
    sku: text().notNull(),
    price: integer().notNull(),
    ...timestamps,
  },
  (table) => ({
    productFk: foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
    }).onDelete("cascade"),
    sizeFk: foreignKey({
      columns: [table.sizeId],
      foreignColumns: [sizes.id],
    }).onDelete("set null"),
    colorFk: foreignKey({
      columns: [table.colorId],
      foreignColumns: [colors.id],
    }).onDelete("set null"),
    designFk: foreignKey({
      columns: [table.designId],
      foreignColumns: [designs.id],
    }).onDelete("set null"),
    typeFk: foreignKey({
      columns: [table.typeId],
      foreignColumns: [productTypes.id],
    }).onDelete("set null"),
    skuUnique: unique("variant_sku_unique").on(table.sku),
    variantComboUnique: unique("variant_combination_unique").on(
      table.productId,
      table.sizeId,
      table.colorId,
      table.designId,
      table.typeId,
    ),
    attributesIdx: index("product_variant_attributes_idx").on(
      table.sizeId,
      table.colorId,
      table.designId,
      table.typeId,
    ),
    priceIdx: index("product_variant_price_idx").on(table.price),
    productIdx: index("variant_product_idx").on(table.productId),
    skuIdx: index("variant_sku_idx").on(table.sku),
    priceCheck: check("variant_price_check", sql`${table.price} >= 0`),
  }),
);

export const productVariantsInventory = pgTable(
  "product_variant_inventory",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    variantId: uuid().notNull(),
    stock: integer().notNull().default(0).$type<number>(),
    lowStockThreshold: integer().notNull().default(5).$type<number>(),
    restockDate: timestamp({ mode: "date" }),
    ...timestamps,
  },
  (table) => ({
    variantFk: foreignKey({
      columns: [table.variantId],
      foreignColumns: [productVariants.id],
    }).onDelete("cascade"),
    stockIdx: index("inventory_stock_idx").on(table.stock),
    variantIdx: index("inventory_variant_idx").on(table.variantId),
    stockCheck: check("stock_non_negative", sql`${table.stock} >= 0`),
    thresholdCheck: check(
      "threshold_positive",
      sql`${table.lowStockThreshold} > 0`,
    ),
  }),
);

export const productImages = pgTable(
  "product_image",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    variantId: uuid().notNull(),
    cloudflareId: text().notNull(),
    url: text().notNull(),
    order: integer().default(0),
    ...timestamps,
  },
  (table) => ({
    variantFk: foreignKey({
      columns: [table.variantId],
      foreignColumns: [productVariants.id],
    }).onDelete("cascade"),
    orderCheck: check("order_non_negative", sql`${table.order} >= 0`),
  }),
);

export const wishlists = pgTable(
  "wishlist",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid().notNull(),
    variantId: uuid().notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
    variantFk: foreignKey({
      columns: [table.variantId],
      foreignColumns: [productVariants.id],
    }).onDelete("cascade"),
    userVariantIdx: uniqueIndex("wishlist_user_variant_unique").on(
      table.userId,
      table.variantId,
    ),
  }),
);

export const orders = pgTable(
  "order",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid().notNull(),
    status: orderStatus("order_status").notNull().default("PENDING"),
    subtotal: integer().notNull(),
    shippingCost: integer().notNull().default(0),
    discount: integer().default(0),
    total: integer().notNull(),
    couponId: uuid(),
    billingAddressId: uuid().notNull(),
    shippingAddressId: uuid().notNull(),
    notes: text(),
    ...timestamps,
  },
  (table) => ({
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
    couponFk: foreignKey({
      columns: [table.couponId],
      foreignColumns: [coupons.id],
    }).onDelete("set null"),
    billingAddressFk: foreignKey({
      columns: [table.billingAddressId],
      foreignColumns: [addresses.id],
    }).onDelete("restrict"),
    shippingAddressFk: foreignKey({
      columns: [table.shippingAddressId],
      foreignColumns: [addresses.id],
    }).onDelete("restrict"),
    userStatusIdx: index("order_user_status_idx").on(
      table.userId,
      table.status,
    ),
    createdAtIndex: index("order_created_at_idx").on(table.createdAt),
    couponIdx: index("order_coupon_idx").on(table.couponId),
    subtotalCheck: check("subtotal_non_negative", sql`${table.subtotal} >= 0`),
    shippingCheck: check(
      "shipping_cost_non_negative",
      sql`${table.shippingCost} >= 0`,
    ),
    discountCheck: check("discount_non_negative", sql`${table.discount} >= 0`),
    totalCheck: check("total_non_negative", sql`${table.total} >= 0`),
    orderDateStatusIdx: index("order_date_status_idx").on(
      table.createdAt,
      table.status,
    ),
    totalValidCheck: check(
      "total_calculation_check",
      sql`${table.total} = ${table.subtotal} + ${table.shippingCost} - ${table.discount}`,
    ),
  }),
);

export const orderItems = pgTable(
  "order_item",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    orderId: uuid().notNull(),
    variantId: uuid().notNull(),
    quantity: integer().notNull(),
    price: integer().notNull(),
    originalPrice: integer().notNull(),
    discountedPrice: integer(),
    discountId: uuid(),
    ...timestamps,
  },
  (table) => ({
    orderFk: foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
    }).onDelete("cascade"),
    variantFk: foreignKey({
      columns: [table.variantId],
      foreignColumns: [productVariants.id],
    }).onDelete("cascade"),
    discountFk: foreignKey({
      columns: [table.discountId],
      foreignColumns: [discounts.id],
    }).onDelete("set null"),
    uniqueVariantOrder: unique("order_variant_unique").on(
      table.orderId,
      table.variantId,
    ),
    orderPriceIdx: index("order_item_price_idx").on(
      table.orderId,
      table.originalPrice,
      table.discountedPrice,
    ),
    quantityCheck: check("quantity_positive", sql`${table.quantity} > 0`),
    priceCheck: check("price_non_negative", sql`${table.price} >= 0`),
    originalPriceCheck: check(
      "original_price_non_negative",
      sql`${table.originalPrice} >= 0`,
    ),
    discountedPriceCheck: check(
      "discounted_price_check",
      sql`${table.discountedPrice} IS NULL OR ${table.discountedPrice} >= 0`,
    ),
  }),
);

export const payments = pgTable(
  "payment",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    orderId: uuid().notNull(),
    amount: integer().notNull(),
    currency: currency().notNull().default("COP"),
    provider: text(),
    status: paymentStatus("payment_status").notNull().default("PENDING"),
    transactionId: text(),
    paymentMethod: paymentMethod().notNull(),
    last4Digits: text(),
    expiryDate: text(),
    ...timestamps,
  },
  (table) => ({
    orderFk: foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
    }).onDelete("cascade"),
    transactionUnique: unique("payment_transaction_unique").on(
      table.transactionId,
    ),
    statusIdx: index("payment_status_idx").on(table.status),
    amountCheck: check("amount_positive", sql`${table.amount} > 0`),
  }),
);

export const shippings = pgTable(
  "shipping",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    orderId: uuid().notNull(),
    status: shippingStatus("shipping_status").notNull().default("PROCESSING"),
    courier: text(),
    trackingNumber: text(),
    estimatedDelivery: timestamp({ mode: "date" }),
    shippingCost: integer().notNull().default(0),
    addressId: uuid().notNull(),
    actualDelivery: timestamp({ mode: "date" }),
    ...timestamps,
  },
  (table) => ({
    orderFk: foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
    }).onDelete("cascade"),
    addressFk: foreignKey({
      columns: [table.addressId],
      foreignColumns: [addresses.id],
    }).onDelete("cascade"),
    trackingUnique: unique("shipping_tracking_unique").on(table.trackingNumber),
    statusIdx: index("shipping_status_idx").on(table.status),
    shippingCostCheck: check(
      "shipping_cost_non_negative",
      sql`${table.shippingCost} >= 0`,
    ),
    deliveryDateCheck: check(
      "delivery_date_check",
      sql`${table.actualDelivery} IS NULL OR ${table.actualDelivery} >= ${table.estimatedDelivery}`,
    ),
  }),
);

export const reviews = pgTable(
  "review",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    productId: uuid().notNull(),
    userId: uuid().notNull(),
    rating: integer().notNull(),
    title: text(),
    content: text(),
    isVerifiedPurchase: boolean().default(false),
    ...timestamps,
  },
  (table) => ({
    productFk: foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
    }).onDelete("cascade"),
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
    productRatingIdx: index("review_product_rating_idx").on(
      table.productId,
      table.rating,
    ),
    verifiedIdx: index("review_verified_idx").on(table.isVerifiedPurchase),
    ratingCheck: check(
      "rating_range_check",
      sql`${table.rating} BETWEEN 1 AND 5`,
    ),
  }),
);

export const suppliers = pgTable(
  "supplier",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    contactPerson: text(),
    email: text(),
    phone: text(),
    address: text(),
    taxId: text(),
    notes: text(),
    active: boolean().default(true),
    ...timestamps,
  },
  (table) => ({
    taxIdUnique: unique("supplier_tax_id_unique").on(table.taxId),
    emailUnique: unique("supplier_email_unique").on(table.email),
  }),
);

export const productSuppliers = pgTable(
  "product_supplier",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    productId: uuid().notNull(),
    supplierId: uuid().notNull(),
    supplierSku: text(),
    supplierPrice: integer().notNull(),
    isMainSupplier: boolean().default(false),
    leadTime: integer(),
    minimumOrder: integer(),
    ...timestamps,
  },
  (table) => ({
    productFk: foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
    }).onDelete("cascade"),
    supplierFk: foreignKey({
      columns: [table.supplierId],
      foreignColumns: [suppliers.id],
    }).onDelete("cascade"),
    supplierPriceCheck: check(
      "supplier_price_positive",
      sql`${table.supplierPrice} > 0`,
    ),
    leadTimeCheck: check(
      "lead_time_check",
      sql`${table.leadTime} IS NULL OR ${table.leadTime} > 0`,
    ),
    minimumOrderCheck: check(
      "minimum_order_check",
      sql`${table.minimumOrder} IS NULL OR ${table.minimumOrder} > 0`,
    ),
  }),
);

export const productTypes = pgTable(
  "product_type",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    code: text().notNull(),
    description: text(),
    active: boolean().default(true),
    ...timestamps,
  },
  (table) => ({
    codeUnique: unique("product_type_code_unique").on(table.code),
  }),
);

export const coupons = pgTable(
  "coupon",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    code: text().notNull(),
    type: discountType("discount_type").notNull(),
    value: integer().notNull(),
    minPurchase: integer(),
    maxUses: integer(),
    usedCount: integer().default(0),
    startDate: timestamp({ mode: "date" }).notNull(),
    endDate: timestamp({ mode: "date" }),
    active: boolean().default(true),
    ...timestamps,
  },
  (table) => ({
    codeUnique: unique("coupon_code_unique_constraint").on(table.code),
    valueCheck: check("value_positive", sql`${table.value} > 0`),
    usedCountCheck: check(
      "used_count_non_negative",
      sql`${table.usedCount} >= 0`,
    ),
    maxUsesCheck: check(
      "max_uses_check",
      sql`${table.maxUses} IS NULL OR ${table.maxUses} > 0`,
    ),
    minPurchaseCheck: check(
      "min_purchase_check",
      sql`${table.minPurchase} IS NULL OR ${table.minPurchase} > 0`,
    ),
    typeValueCheck: check(
      "type_value_check",
      sql`(${table.type} = 'PERCENTAGE' AND ${table.value} <= 100) OR ${table.type} = 'FIXED'`,
    ),
    dateCheck: check(
      "coupon_date_check",
      sql`${table.endDate} IS NULL OR ${table.endDate} > ${table.startDate}`,
    ),
  }),
);

export const discounts = pgTable(
  "discount",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    code: text().unique(),
    name: text().notNull(),
    description: text(),
    type: discountType().notNull(),
    value: integer().notNull(),
    scope: discountScope().notNull(),
    maxUses: integer(),
    usedCount: integer().default(0).notNull(),
    minOrderAmount: integer(),
    startDate: timestamp({ mode: "date" }).notNull(),
    endDate: timestamp({ mode: "date" }).notNull(),
    active: boolean().default(true).notNull(),
    ...timestamps,
  },
  (table) => ({
    codeUnique: unique("discount_code_unique_constraint").on(table.code),
    activeIdx: index("discount_active_idx").on(table.active),
    dateIdx: index("discount_date_idx").on(table.startDate, table.endDate),
    scopeIdx: index("discount_scope_idx").on(table.scope),
    activeDateIdx: index("discount_active_date_idx").on(
      table.active,
      table.startDate,
      table.endDate,
    ),
    dateCheck: check(
      "valid_date_range_check",
      sql`${table.endDate} > ${table.startDate}`,
    ),
    valueCheck: check("value_positive", sql`${table.value} > 0`),
    usedCountCheck: check(
      "used_count_non_negative",
      sql`${table.usedCount} >= 0`,
    ),
    maxUsesCheck: check(
      "max_uses_check",
      sql`${table.maxUses} IS NULL OR ${table.maxUses} > 0`,
    ),
    minOrderCheck: check(
      "min_order_check",
      sql`${table.minOrderAmount} IS NULL OR ${table.minOrderAmount} > 0`,
    ),
    typeValueCheck: check(
      "type_value_check",
      sql`(${table.type} = 'PERCENTAGE' AND ${table.value} <= 100) OR ${table.type} = 'FIXED'`,
    ),
  }),
);

export const discountsApplication = pgTable(
  "discount_application",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    discountId: uuid().notNull(),
    productId: uuid(),
    variantId: uuid(),
    categoryId: uuid(),
    subcategoryId: uuid(),
    productTypeId: uuid(),
    scope: discountScope().notNull(),
    ...timestamps,
  },
  (table) => ({
    discountFk: foreignKey({
      columns: [table.discountId],
      foreignColumns: [discounts.id],
    }).onDelete("cascade"),
    productFk: foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
    }).onDelete("cascade"),
    variantFk: foreignKey({
      columns: [table.variantId],
      foreignColumns: [productVariants.id],
    }).onDelete("cascade"),
    categoryFk: foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
    }).onDelete("cascade"),
    subcategoryFk: foreignKey({
      columns: [table.subcategoryId],
      foreignColumns: [subcategories.id],
    }).onDelete("cascade"),
    productTypeFk: foreignKey({
      columns: [table.productTypeId],
      foreignColumns: [productTypes.id],
    }).onDelete("cascade"),
    discountProductIdx: index("discount_application_product_idx").on(
      table.discountId,
      table.productId,
    ),
    discountVariantIdx: index("discount_application_variant_idx").on(
      table.discountId,
      table.variantId,
    ),
    discountCategoryIdx: index("discount_application_category_idx").on(
      table.discountId,
      table.categoryId,
    ),
    scopeCheck: check(
      "scope_check",
      sql`(
        CASE 
          WHEN ${table.scope} = 'PRODUCT' THEN ${table.productId} IS NOT NULL
          WHEN ${table.scope} = 'VARIANT' THEN ${table.variantId} IS NOT NULL
          WHEN ${table.scope} = 'CATEGORY' THEN ${table.categoryId} IS NOT NULL
          WHEN ${table.scope} = 'SUBCATEGORY' THEN ${table.subcategoryId} IS NOT NULL
          WHEN ${table.scope} = 'PRODUCT_TYPE' THEN ${table.productTypeId} IS NOT NULL
          WHEN ${table.scope} = 'SITE_WIDE' THEN true
        END
      )`,
    ),
  }),
);

export const discountsUsage = pgTable(
  "discount_usage",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    discountId: uuid().notNull(),
    userId: uuid().notNull(),
    orderId: uuid().notNull(),
    variantId: uuid().notNull(),
    ...timestamps,
  },
  (table) => ({
    discountFk: foreignKey({
      columns: [table.discountId],
      foreignColumns: [discounts.id],
    }).onDelete("cascade"),
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
    orderFk: foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
    }).onDelete("cascade"),
    variantFk: foreignKey({
      columns: [table.variantId],
      foreignColumns: [productVariants.id],
    }).onDelete("cascade"),
    discountUserIdx: index("discount_usage_user_idx").on(
      table.discountId,
      table.userId,
    ),
    userOrderIdx: index("discount_usage_order_idx").on(
      table.userId,
      table.orderId,
    ),
  }),
);

export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Size = typeof sizes.$inferSelect;
export type Color = typeof colors.$inferSelect;
export type Design = typeof designs.$inferSelect;
export type ProductType = typeof productTypes.$inferSelect;
export type Subcategory = typeof subcategories.$inferSelect;
export type UserRoleType = (typeof userRole.enumValues)[number];

export const UserRoleValues = z.enum(userRole.enumValues).Enum;
