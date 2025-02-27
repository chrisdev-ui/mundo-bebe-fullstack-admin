import { SQL, sql } from "drizzle-orm";
import {
  boolean,
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

import { tsVector } from "@/db/utils";

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
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
};

export const address = pgTable(
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
      foreignColumns: [user.id],
    }).onDelete("cascade"),
    userTypeIdx: index("address_user_type_idx").on(table.userId, table.type),
  }),
);

export const invitation = pgTable(
  "invitation",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    email: text().notNull(),
    token: text().notNull(),
    expires: timestamp({ mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    used: boolean().default(false).notNull(),
  },
  (table) => {
    return {
      invitationTokenUnique: unique("invitation_token_unique").on(table.token),
    };
  },
);

export const session = pgTable(
  "session",
  {
    sessionToken: text().primaryKey().notNull(),
    userId: uuid().notNull(),
    expires: timestamp({ mode: "string" }).notNull(),
  },
  (table) => {
    return {
      sessionUserIdUserIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "session_userId_user_id_fk",
      }).onDelete("cascade"),
    };
  },
);

export const user = pgTable(
  "user",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text(),
    lastName: text("last_name"),
    username: text().notNull(),
    password: text().notNull(),
    email: text().notNull(),
    documentId: text("document_id"),
    emailVerified: timestamp({ mode: "string" }),
    role: userRole().default("USER").notNull(),
    image: text(),
    phoneNumber: text("phone_number"),
    dob: timestamp({ mode: "string" }),
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
    };
  },
);

export const verificationToken = pgTable(
  "verificationToken",
  {
    identifier: text().notNull(),
    token: text().notNull(),
    expires: timestamp({ mode: "string" }).notNull(),
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
        foreignColumns: [user.id],
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
        foreignColumns: [user.id],
        name: "account_userId_user_id_fk",
      }).onDelete("cascade"),
      accountProviderProviderAccountIdPk: primaryKey({
        columns: [table.provider, table.providerAccountId],
        name: "account_provider_providerAccountId_pk",
      }),
    };
  },
);

// Tables for e-commerce

export const category = pgTable(
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
  }),
);

export const subcategory = pgTable(
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
      foreignColumns: [category.id],
    }).onDelete("cascade"),
    slugUnique: unique("subcategory_slug_unique").on(table.slug),
  }),
);

export const size = pgTable(
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

export const color = pgTable(
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

export const design = pgTable(
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

export const product = pgTable(
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
    productSearch: tsVector("product_search").generatedAlwaysAs(
      (): SQL =>
        sql`to_tsvector('spanish', coalesce(${product.name}, '') || ' ' || coalesce(${product.description}, ''))`,
    ),
    ...timestamps,
  },
  (table) => ({
    subcategoryFk: foreignKey({
      columns: [table.subcategoryId],
      foreignColumns: [subcategory.id],
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
    featuredIdx: index("product_featured_idx").on(
      table.isFeatured,
      table.createdAt,
    ),
    productSearchIdx: index("idx_product_search").using(
      "gin",
      table.productSearch,
    ),
  }),
);

export const productVariant = pgTable(
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
      foreignColumns: [product.id],
    }).onDelete("cascade"),
    sizeFk: foreignKey({
      columns: [table.sizeId],
      foreignColumns: [size.id],
    }).onDelete("set null"),
    colorFk: foreignKey({
      columns: [table.colorId],
      foreignColumns: [color.id],
    }).onDelete("set null"),
    designFk: foreignKey({
      columns: [table.designId],
      foreignColumns: [design.id],
    }).onDelete("set null"),
    typeFk: foreignKey({
      columns: [table.typeId],
      foreignColumns: [productType.id],
    }).onDelete("set null"),
    skuUnique: unique("variant_sku_unique").on(table.sku),
    attributesIdx: index("product_variant_attributes_idx").on(
      table.sizeId,
      table.colorId,
      table.designId,
      table.typeId,
    ),
    priceIdx: index("product_variant_price_idx").on(table.price),
    productIdx: index("variant_product_idx").on(table.productId),
    skuIdx: index("variant_sku_idx").on(table.sku),
  }),
);

export const productVariantInventory = pgTable(
  "product_variant_inventory",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    variantId: uuid().notNull(),
    stock: integer().notNull().default(0).$type<number>(),
    lowStockThreshold: integer().notNull().default(5).$type<number>(),
    restockDate: timestamp({ mode: "string" }),
    ...timestamps,
  },
  (table) => ({
    variantFk: foreignKey({
      columns: [table.variantId],
      foreignColumns: [productVariant.id],
    }).onDelete("cascade"),
    stockIdx: index("inventory_stock_idx").on(table.stock),
    variantIdx: index("inventory_variant_idx").on(table.variantId),
  }),
);

export const productImage = pgTable(
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
      foreignColumns: [productVariant.id],
    }).onDelete("cascade"),
  }),
);

export const wishlist = pgTable(
  "wishlist",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid().notNull(),
    variantId: uuid().notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
    }).onDelete("cascade"),
    variantFk: foreignKey({
      columns: [table.variantId],
      foreignColumns: [productVariant.id],
    }).onDelete("cascade"),
    userVariantIdx: uniqueIndex("wishlist_user_variant_unique").on(
      table.userId,
      table.variantId,
    ),
  }),
);

export const order = pgTable(
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
      foreignColumns: [user.id],
    }).onDelete("cascade"),
    couponFk: foreignKey({
      columns: [table.couponId],
      foreignColumns: [coupon.id],
    }).onDelete("set null"),
    billingAddressFk: foreignKey({
      columns: [table.billingAddressId],
      foreignColumns: [address.id],
    }).onDelete("restrict"),
    shippingAddressFk: foreignKey({
      columns: [table.shippingAddressId],
      foreignColumns: [address.id],
    }).onDelete("restrict"),
    userStatusIdx: index("order_user_status_idx").on(
      table.userId,
      table.status,
    ),
    createdAtIndex: index("order_created_at_idx").on(table.createdAt),
    couponIdx: index("order_coupon_idx").on(table.couponId),
  }),
);

export const orderItem = pgTable(
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
      foreignColumns: [order.id],
    }).onDelete("cascade"),
    variantFk: foreignKey({
      columns: [table.variantId],
      foreignColumns: [productVariant.id],
    }).onDelete("cascade"),
    discountFk: foreignKey({
      columns: [table.discountId],
      foreignColumns: [discount.id],
    }).onDelete("set null"),
    orderPriceIdx: index("order_item_price_idx").on(
      table.orderId,
      table.originalPrice,
      table.discountedPrice,
    ),
  }),
);

export const payment = pgTable(
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
      foreignColumns: [order.id],
    }).onDelete("cascade"),
    transactionUnique: unique("payment_transaction_unique").on(
      table.transactionId,
    ),
    statusIdx: index("payment_status_idx").on(table.status),
  }),
);

export const shipping = pgTable(
  "shipping",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    orderId: uuid().notNull(),
    status: shippingStatus("shipping_status").notNull().default("PROCESSING"),
    courier: text(),
    trackingNumber: text(),
    estimatedDelivery: timestamp({ mode: "string" }),
    shippingCost: integer().notNull().default(0),
    addressId: uuid().notNull(),
    actualDelivery: timestamp({ mode: "string" }),
    ...timestamps,
  },
  (table) => ({
    orderFk: foreignKey({
      columns: [table.orderId],
      foreignColumns: [order.id],
    }).onDelete("cascade"),
    addressFk: foreignKey({
      columns: [table.addressId],
      foreignColumns: [address.id],
    }).onDelete("cascade"),
    trackingUnique: unique("shipping_tracking_unique").on(table.trackingNumber),
    statusIdx: index("shipping_status_idx").on(table.status),
  }),
);

export const review = pgTable(
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
      foreignColumns: [product.id],
    }).onDelete("cascade"),
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
    }).onDelete("cascade"),
    productRatingIdx: index("review_product_rating_idx").on(
      table.productId,
      table.rating,
    ),
    verifiedIdx: index("review_verified_idx").on(table.isVerifiedPurchase),
  }),
);

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
  ...timestamps,
});

export const productSupplier = pgTable(
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
      foreignColumns: [product.id],
    }).onDelete("cascade"),
    supplierFk: foreignKey({
      columns: [table.supplierId],
      foreignColumns: [supplier.id],
    }).onDelete("cascade"),
  }),
);

export const productType = pgTable(
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

export const coupon = pgTable(
  "coupon",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    code: text().notNull(),
    type: discountType("discount_type").notNull(),
    value: integer().notNull(),
    minPurchase: integer(),
    maxUses: integer(),
    usedCount: integer().default(0),
    startDate: timestamp({ mode: "string" }).notNull(),
    endDate: timestamp({ mode: "string" }),
    active: boolean().default(true),
    ...timestamps,
  },
  (table) => ({
    codeUnique: unique("coupon_code_unique").on(table.code),
  }),
);

export const discount = pgTable(
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
    startDate: timestamp({ mode: "string" }).notNull(),
    endDate: timestamp({ mode: "string" }).notNull(),
    active: boolean().default(true).notNull(),
    ...timestamps,
  },
  (table) => ({
    codeUnique: unique("discount_code_unique").on(table.code),
    activeIdx: index("discount_active_idx").on(table.active),
    dateIdx: index("discount_date_idx").on(table.startDate, table.endDate),
    scopeIdx: index("discount_scope_idx").on(table.scope),
    activeDateIdx: index("discount_active_date_idx").on(
      table.active,
      table.startDate,
      table.endDate,
    ),
  }),
);

export const discountApplication = pgTable(
  "discount_application",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    discountId: uuid().notNull(),
    productId: uuid(),
    variantId: uuid(),
    categoryId: uuid(),
    subcategoryId: uuid(),
    productTypeId: uuid(),
    ...timestamps,
  },
  (table) => ({
    discountFk: foreignKey({
      columns: [table.discountId],
      foreignColumns: [discount.id],
    }).onDelete("cascade"),
    productFk: foreignKey({
      columns: [table.productId],
      foreignColumns: [product.id],
    }).onDelete("cascade"),
    variantFk: foreignKey({
      columns: [table.variantId],
      foreignColumns: [productVariant.id],
    }).onDelete("cascade"),
    categoryFk: foreignKey({
      columns: [table.categoryId],
      foreignColumns: [category.id],
    }).onDelete("cascade"),
    subcategoryFk: foreignKey({
      columns: [table.subcategoryId],
      foreignColumns: [subcategory.id],
    }).onDelete("cascade"),
    productTypeFk: foreignKey({
      columns: [table.productTypeId],
      foreignColumns: [productType.id],
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
  }),
);

export const discountUsage = pgTable(
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
      foreignColumns: [discount.id],
    }).onDelete("cascade"),
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
    }).onDelete("cascade"),
    orderFk: foreignKey({
      columns: [table.orderId],
      foreignColumns: [order.id],
    }).onDelete("cascade"),
    variantFk: foreignKey({
      columns: [table.variantId],
      foreignColumns: [productVariant.id],
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
