import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const articles = pgTable("articles", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    author: text("author"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
})