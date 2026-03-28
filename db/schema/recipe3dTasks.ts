import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const recipe3dTasksTable = pgTable("recipe_3d_tasks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  recipeName: varchar("recipe_name", { length: 500 }).notNull(),
  prompt: text().notNull(),
  meshyTaskId: varchar("meshy_task_id", { length: 255 }),
  status: varchar({ length: 50 }).notNull().default("PENDING"),
  progress: integer().notNull().default(0),
  modelUrl: varchar("model_url", { length: 1000 }),
  meshyModelUrl: varchar("meshy_model_url", { length: 1000 }),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
