import { relations, sql } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
import { customers } from "./customers.js";
import { products } from "./products.js";

export const sales = pgTable("sales", (t) => ({
  id: t.uuid().primaryKey().notNull().defaultRandom(),
  customerId: t.uuid().references(() => customers.id, { onDelete: "restrict" }),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "string", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
  customer: one(customers, {
    fields: [sales.customerId],
    references: [customers.id],
  }),
  items: many(salesItems),
}));

export const salesItems = pgTable("sales_items", (t) => ({
  id: t.uuid().primaryKey().notNull().defaultRandom(),
  salesId: t.uuid().references(() => sales.id, { onDelete: "cascade" }),
  productId: t.uuid().references(() => products.id, { onDelete: "restrict" }),
  price: t.real().default(0),
  quantity: t.integer().default(0),
}));

export const salesItemsRelations = relations(salesItems, ({ one }) => ({
  sales: one(sales, {
    fields: [salesItems.salesId],
    references: [sales.id],
  }),
  product: one(products, {
    fields: [salesItems.productId],
    references: [products.id],
  }),
}));
