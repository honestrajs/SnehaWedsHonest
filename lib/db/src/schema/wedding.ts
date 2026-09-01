import { integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const savingsEntriesTable = pgTable("savings_entries", {
  id: serial("id").primaryKey(),
  amountCents: integer("amount_cents").notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  summary: text("summary").notNull(),
  category: varchar("category", { length: 32 }).notNull(),
  addedBy: varchar("added_by", { length: 32 }).notNull(),
  addedByName: varchar("added_by_name", { length: 120 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type SavingsEntry = typeof savingsEntriesTable.$inferSelect;
export type InsertSavingsEntry = typeof savingsEntriesTable.$inferInsert;