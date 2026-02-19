import { pgTable } from "drizzle-orm/pg-core";

export const customers = pgTable("courses", (t) => ({
  id: t.uuid().primaryKey().notNull().defaultRandom(),
  name: t.varchar().notNull(),
  email: t.varchar().notNull(),
  phone: t.varchar(),
  address: t.text(),
}));
