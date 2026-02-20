import { relations, sql } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
import { customers } from "./customers.js";
import { products } from "./products.js";

export const orders = pgTable("orders", (t) => ({
  id: t.uuid().primaryKey().notNull().defaultRandom(),
  customerId: t
    .uuid()
    .references(() => customers.id, { onDelete: "restrict" })
    .notNull(),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "string", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  items: many(ordersItems),
}));

export const ordersItems = pgTable("orders_items", (t) => ({
  id: t.uuid().primaryKey().notNull().defaultRandom(),
  orderId: t
    .uuid()
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  productId: t
    .uuid()
    .references(() => products.id, { onDelete: "restrict" })
    .notNull(),
  price: t.real().default(0),
  quantity: t.integer().default(0),
}));

export const ordersItemsRelations = relations(ordersItems, ({ one }) => ({
  orders: one(orders, {
    fields: [ordersItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [ordersItems.productId],
    references: [products.id],
  }),
}));
