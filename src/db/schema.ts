import { pgTable, text, timestamp, json, integer } from "drizzle-orm/pg-core";

export const articles = pgTable("articles", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    author: text("author"),
    category: text("category"),
    excerpt: text("excerpt"),
    summary: text("summary"),
    views: integer("views").default(0).notNull(),
    imageUrl: text("image_url").default("https://jc.uol.com.br/img/logo.svg"),
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

export const articleSections = pgTable("article_sections", {
    id: text("id").primaryKey(),
    articleId: text("article_id").notNull(),
    userId: text("user_id").notNull(),
    sectionTitle: text("section_title").notNull(),
    sectionLevel: text("section_level").notNull(), // h1, h2, h3, etc
    viewCount: integer("view_count").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});