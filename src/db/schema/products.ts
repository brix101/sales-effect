import { pgTable } from "drizzle-orm/pg-core";

export const products = pgTable("products", (t) => ({
  id: t.uuid().primaryKey().notNull().defaultRandom(),
  name: t.varchar().notNull(),
  description: t.text(),
  image: t.text(),
  price: t.real().default(0),
}));
