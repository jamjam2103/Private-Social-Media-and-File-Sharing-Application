import { sqliteTable, text as sqliteText, integer as sqliteInteger } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: sqliteInteger("id").primaryKey({ autoIncrement: true }),
  username: sqliteText("username").notNull().unique(),
  password: sqliteText("password").notNull(),
});

export const files = sqliteTable("files", {
  id: sqliteText("id").primaryKey(),
  name: sqliteText("name").notNull(),
  data: sqliteText("data").notNull(), // base64 encoded data
  username: sqliteText("username").notNull(),
  timestamp: sqliteInteger("timestamp").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type Message = {
  id: string;
  username: string;
  content: string;
  encrypted: boolean;
  timestamp: number;
};

export type FileShare = typeof files.$inferSelect;