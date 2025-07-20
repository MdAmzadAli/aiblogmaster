import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Blog posts table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  metaDescription: varchar("meta_description", { length: 160 }),
  keywords: text("keywords").array(),
  category: varchar("category", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("draft"), // draft, published, scheduled
  isAiGenerated: boolean("is_ai_generated").default(true),
  seoScore: integer("seo_score").default(0),
  featuredImage: varchar("featured_image"),
  publishedAt: timestamp("published_at"),
  scheduledAt: timestamp("scheduled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Post analytics table
export const postAnalytics = pgTable("post_analytics", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  views: integer("views").default(0),
  uniqueViews: integer("unique_views").default(0),
  avgReadTime: integer("avg_read_time").default(0), // in seconds
  bounceRate: decimal("bounce_rate", { precision: 5, scale: 2 }).default("0"),
  date: timestamp("date").defaultNow(),
});

// Automation settings table
export const automationSettings = pgTable("automation_settings", {
  id: serial("id").primaryKey(),
  isEnabled: boolean("is_enabled").default(true),
  frequency: varchar("frequency", { length: 20 }).default("weekly"), // daily, weekly, monthly
  scheduledTime: varchar("scheduled_time", { length: 10 }).default("10:00"), // HH:MM format
  targetKeywords: text("target_keywords").array(),
  contentType: varchar("content_type", { length: 50 }).default("how-to"),
  wordCount: integer("word_count").default(1200),
  categories: text("categories").array(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAutomationSettingsSchema = createInsertSchema(automationSettings).omit({
  id: true,
  updatedAt: true,
});

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

// Types
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type PostAnalytics = typeof postAnalytics.$inferSelect;
export type AutomationSettings = typeof automationSettings.$inferSelect;
export type InsertAutomationSettings = z.infer<typeof insertAutomationSettingsSchema>;
export type User = typeof users.$inferSelect;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
