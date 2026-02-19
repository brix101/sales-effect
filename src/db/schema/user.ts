import { pgTable } from "drizzle-orm/pg-core";

export const users = pgTable("users", (t) => ({
  id: t.uuid().primaryKey().notNull().defaultRandom(),
  name: t.varchar().notNull(),
  email: t.varchar().unique().notNull(),
  passsword: t.text().notNull(),
}));
