import {
  integer,
  numeric,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const scaleMeasurementsTable = pgTable("scale_measurements", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  status: varchar({ length: 50 }).notNull().default("pending"),
  weight: numeric({ precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
