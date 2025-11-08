import { pgTable, text, timestamp, json } from "drizzle-orm/pg-core";

export const articles = pgTable("articles", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    author: text("author"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const anonymousUsers = pgTable("anonymous_users", {
    id: text("id").primaryKey(),
    nanoid: text("nanoid").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const userLogs = pgTable("user_logs", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    articleId: text("article_id").notNull(),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    location: json("location").notNull(), // stores the ipapi response
    ipAddress: text("ip_address").notNull(),
});