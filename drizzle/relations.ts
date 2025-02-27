import { relations } from "drizzle-orm/relations";
import { user, address, category, discountApplication, discount, product, productType, subcategory, productVariant, discountUsage, order, coupon, orderItem, payment, productImage, productSupplier, supplier, color, design, size, productVariantInventory, review, session, shipping, wishlist, authenticator, account } from "./schema";

export const addressRelations = relations(address, ({one, many}) => ({
	user: one(user, {
		fields: [address.userId],
		references: [user.id]
	}),
	orders_billingAddressId: many(order, {
		relationName: "order_billingAddressId_address_id"
	}),
	orders_shippingAddressId: many(order, {
		relationName: "order_shippingAddressId_address_id"
	}),
	shippings: many(shipping),
}));

export const userRelations = relations(user, ({many}) => ({
	addresses: many(address),
	discountUsages: many(discountUsage),
	orders: many(order),
	reviews: many(review),
	sessions: many(session),
	wishlists: many(wishlist),
	authenticators: many(authenticator),
	accounts: many(account),
}));

export const discountApplicationRelations = relations(discountApplication, ({one}) => ({
	category: one(category, {
		fields: [discountApplication.categoryId],
		references: [category.id]
	}),
	discount: one(discount, {
		fields: [discountApplication.discountId],
		references: [discount.id]
	}),
	product: one(product, {
		fields: [discountApplication.productId],
		references: [product.id]
	}),
	productType: one(productType, {
		fields: [discountApplication.productTypeId],
		references: [productType.id]
	}),
	subcategory: one(subcategory, {
		fields: [discountApplication.subcategoryId],
		references: [subcategory.id]
	}),
	productVariant: one(productVariant, {
		fields: [discountApplication.variantId],
		references: [productVariant.id]
	}),
}));

export const categoryRelations = relations(category, ({many}) => ({
	discountApplications: many(discountApplication),
	subcategories: many(subcategory),
}));

export const discountRelations = relations(discount, ({many}) => ({
	discountApplications: many(discountApplication),
	discountUsages: many(discountUsage),
	orderItems: many(orderItem),
}));

export const productRelations = relations(product, ({one, many}) => ({
	discountApplications: many(discountApplication),
	subcategory: one(subcategory, {
		fields: [product.subcategoryId],
		references: [subcategory.id]
	}),
	productSuppliers: many(productSupplier),
	productVariants: many(productVariant),
	reviews: many(review),
}));

export const productTypeRelations = relations(productType, ({many}) => ({
	discountApplications: many(discountApplication),
	productVariants: many(productVariant),
}));

export const subcategoryRelations = relations(subcategory, ({one, many}) => ({
	discountApplications: many(discountApplication),
	products: many(product),
	category: one(category, {
		fields: [subcategory.categoryId],
		references: [category.id]
	}),
}));

export const productVariantRelations = relations(productVariant, ({one, many}) => ({
	discountApplications: many(discountApplication),
	discountUsages: many(discountUsage),
	orderItems: many(orderItem),
	productImages: many(productImage),
	color: one(color, {
		fields: [productVariant.colorId],
		references: [color.id]
	}),
	design: one(design, {
		fields: [productVariant.designId],
		references: [design.id]
	}),
	product: one(product, {
		fields: [productVariant.productId],
		references: [product.id]
	}),
	size: one(size, {
		fields: [productVariant.sizeId],
		references: [size.id]
	}),
	productType: one(productType, {
		fields: [productVariant.typeId],
		references: [productType.id]
	}),
	productVariantInventories: many(productVariantInventory),
	wishlists: many(wishlist),
}));

export const discountUsageRelations = relations(discountUsage, ({one}) => ({
	discount: one(discount, {
		fields: [discountUsage.discountId],
		references: [discount.id]
	}),
	order: one(order, {
		fields: [discountUsage.orderId],
		references: [order.id]
	}),
	user: one(user, {
		fields: [discountUsage.userId],
		references: [user.id]
	}),
	productVariant: one(productVariant, {
		fields: [discountUsage.variantId],
		references: [productVariant.id]
	}),
}));

export const orderRelations = relations(order, ({one, many}) => ({
	discountUsages: many(discountUsage),
	address_billingAddressId: one(address, {
		fields: [order.billingAddressId],
		references: [address.id],
		relationName: "order_billingAddressId_address_id"
	}),
	coupon: one(coupon, {
		fields: [order.couponId],
		references: [coupon.id]
	}),
	address_shippingAddressId: one(address, {
		fields: [order.shippingAddressId],
		references: [address.id],
		relationName: "order_shippingAddressId_address_id"
	}),
	user: one(user, {
		fields: [order.userId],
		references: [user.id]
	}),
	orderItems: many(orderItem),
	payments: many(payment),
	shippings: many(shipping),
}));

export const couponRelations = relations(coupon, ({many}) => ({
	orders: many(order),
}));

export const orderItemRelations = relations(orderItem, ({one}) => ({
	discount: one(discount, {
		fields: [orderItem.discountId],
		references: [discount.id]
	}),
	order: one(order, {
		fields: [orderItem.orderId],
		references: [order.id]
	}),
	productVariant: one(productVariant, {
		fields: [orderItem.variantId],
		references: [productVariant.id]
	}),
}));

export const paymentRelations = relations(payment, ({one}) => ({
	order: one(order, {
		fields: [payment.orderId],
		references: [order.id]
	}),
}));

export const productImageRelations = relations(productImage, ({one}) => ({
	productVariant: one(productVariant, {
		fields: [productImage.variantId],
		references: [productVariant.id]
	}),
}));

export const productSupplierRelations = relations(productSupplier, ({one}) => ({
	product: one(product, {
		fields: [productSupplier.productId],
		references: [product.id]
	}),
	supplier: one(supplier, {
		fields: [productSupplier.supplierId],
		references: [supplier.id]
	}),
}));

export const supplierRelations = relations(supplier, ({many}) => ({
	productSuppliers: many(productSupplier),
}));

export const colorRelations = relations(color, ({many}) => ({
	productVariants: many(productVariant),
}));

export const designRelations = relations(design, ({many}) => ({
	productVariants: many(productVariant),
}));

export const sizeRelations = relations(size, ({many}) => ({
	productVariants: many(productVariant),
}));

export const productVariantInventoryRelations = relations(productVariantInventory, ({one}) => ({
	productVariant: one(productVariant, {
		fields: [productVariantInventory.variantId],
		references: [productVariant.id]
	}),
}));

export const reviewRelations = relations(review, ({one}) => ({
	product: one(product, {
		fields: [review.productId],
		references: [product.id]
	}),
	user: one(user, {
		fields: [review.userId],
		references: [user.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const shippingRelations = relations(shipping, ({one}) => ({
	address: one(address, {
		fields: [shipping.addressId],
		references: [address.id]
	}),
	order: one(order, {
		fields: [shipping.orderId],
		references: [order.id]
	}),
}));

export const wishlistRelations = relations(wishlist, ({one}) => ({
	user: one(user, {
		fields: [wishlist.userId],
		references: [user.id]
	}),
	productVariant: one(productVariant, {
		fields: [wishlist.variantId],
		references: [productVariant.id]
	}),
}));

export const authenticatorRelations = relations(authenticator, ({one}) => ({
	user: one(user, {
		fields: [authenticator.userId],
		references: [user.id]
	}),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));