import { relations } from "drizzle-orm/relations";

import {
  account,
  address,
  authenticator,
  category,
  color,
  coupon,
  design,
  discount,
  discountApplication,
  discountUsage,
  order,
  orderItem,
  payment,
  product,
  productImage,
  productSupplier,
  productType,
  productVariant,
  productVariantInventory,
  review,
  session,
  shipping,
  size,
  subcategory,
  supplier,
  user,
  wishlist,
} from "./schema";

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  authenticators: many(authenticator),
  accounts: many(account),
  addresses: many(address),
  reviews: many(review),
  orders: many(order),
}));

export const authenticatorRelations = relations(authenticator, ({ one }) => ({
  user: one(user, {
    fields: [authenticator.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// Relations for e-commerce

export const categoryRelations = relations(category, ({ many }) => ({
  subcategories: many(subcategory),
}));

export const subcategoryRelations = relations(subcategory, ({ one, many }) => ({
  category: one(category, {
    fields: [subcategory.categoryId],
    references: [category.id],
  }),
  products: many(product),
}));

export const productRelations = relations(product, ({ one, many }) => ({
  subcategory: one(subcategory, {
    fields: [product.subcategoryId],
    references: [subcategory.id],
  }),
  variants: many(productVariant),
  reviews: many(review),
  suppliers: many(productSupplier),
}));

export const productVariantRelations = relations(
  productVariant,
  ({ one, many }) => ({
    product: one(product, {
      fields: [productVariant.productId],
      references: [product.id],
    }),
    size: one(size, {
      fields: [productVariant.sizeId],
      references: [size.id],
    }),
    color: one(color, {
      fields: [productVariant.colorId],
      references: [color.id],
    }),
    design: one(design, {
      fields: [productVariant.designId],
      references: [design.id],
    }),
    type: one(productType, {
      fields: [productVariant.typeId],
      references: [productType.id],
    }),
    inventory: one(productVariantInventory),
    images: many(productImage),
    orderItems: many(orderItem),
    wishlistItems: many(wishlist),
  }),
);

export const orderRelations = relations(order, ({ one, many }) => ({
  user: one(user, {
    fields: [order.userId],
    references: [user.id],
  }),
  items: many(orderItem),
  payment: one(payment),
  shipping: one(shipping),
  coupon: one(coupon, {
    fields: [order.couponId],
    references: [coupon.id],
  }),
  billingAddress: one(address, {
    fields: [order.billingAddressId],
    references: [address.id],
  }),
  shippingAddress: one(address, {
    fields: [order.shippingAddressId],
    references: [address.id],
  }),
}));

export const orderItemRelations = relations(orderItem, ({ one }) => ({
  order: one(order, {
    fields: [orderItem.orderId],
    references: [order.id],
  }),
  variant: one(productVariant, {
    fields: [orderItem.variantId],
    references: [productVariant.id],
  }),
  discount: one(discount, {
    fields: [orderItem.discountId],
    references: [discount.id],
  }),
}));

export const wishlistRelations = relations(wishlist, ({ one }) => ({
  user: one(user, {
    fields: [wishlist.userId],
    references: [user.id],
  }),
  variant: one(productVariant, {
    fields: [wishlist.variantId],
    references: [productVariant.id],
  }),
}));

export const addressRelations = relations(address, ({ one }) => ({
  user: one(user, {
    fields: [address.userId],
    references: [user.id],
  }),
}));

export const paymentRelations = relations(payment, ({ one }) => ({
  order: one(order, {
    fields: [payment.orderId],
    references: [order.id],
  }),
}));

export const shippingRelations = relations(shipping, ({ one }) => ({
  order: one(order, {
    fields: [shipping.orderId],
    references: [order.id],
  }),
  address: one(address, {
    fields: [shipping.addressId],
    references: [address.id],
  }),
}));

export const reviewRelations = relations(review, ({ one }) => ({
  product: one(product, {
    fields: [review.productId],
    references: [product.id],
  }),
  user: one(user, {
    fields: [review.userId],
    references: [user.id],
  }),
}));

export const productSupplierRelations = relations(
  productSupplier,
  ({ one }) => ({
    product: one(product, {
      fields: [productSupplier.productId],
      references: [product.id],
    }),
    supplier: one(supplier, {
      fields: [productSupplier.supplierId],
      references: [supplier.id],
    }),
  }),
);

export const discountRelations = relations(discount, ({ many }) => ({
  applications: many(discountApplication),
  usages: many(discountUsage),
  orderItems: many(orderItem),
}));

export const discountApplicationRelations = relations(
  discountApplication,
  ({ one }) => ({
    discount: one(discount, {
      fields: [discountApplication.discountId],
      references: [discount.id],
    }),
    product: one(product, {
      fields: [discountApplication.productId],
      references: [product.id],
    }),
    variant: one(productVariant, {
      fields: [discountApplication.variantId],
      references: [productVariant.id],
    }),
    category: one(category, {
      fields: [discountApplication.categoryId],
      references: [category.id],
    }),
    subcategory: one(subcategory, {
      fields: [discountApplication.subcategoryId],
      references: [subcategory.id],
    }),
    productType: one(productType, {
      fields: [discountApplication.productTypeId],
      references: [productType.id],
    }),
  }),
);

export const discountUsageRelations = relations(discountUsage, ({ one }) => ({
  discount: one(discount, {
    fields: [discountUsage.discountId],
    references: [discount.id],
  }),
  user: one(user, {
    fields: [discountUsage.userId],
    references: [user.id],
  }),
  order: one(order, {
    fields: [discountUsage.orderId],
    references: [order.id],
  }),
  variant: one(productVariant, {
    fields: [discountUsage.variantId],
    references: [productVariant.id],
  }),
}));
