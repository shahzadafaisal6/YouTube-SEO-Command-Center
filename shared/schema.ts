import { pgTable, text, serial, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  company: text("company"),
  phone: text("phone"),
  timezone: text("timezone").default("UTC"),
  emailNotifications: boolean("email_notifications").default(true),
  darkMode: boolean("dark_mode").default(true),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  // OAuth related fields
  googleId: text("google_id").unique(),
  profilePicture: text("profile_picture"),
  youtubeToken: text("youtube_token"),
  youtubeChannelId: text("youtube_channel_id"),
  youtubeChannelTitle: text("youtube_channel_title"),
  isAdmin: boolean("is_admin").default(false),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// API Key Schema
export const apiKeyTypeEnum = pgEnum("api_key_type", ["youtube", "openai", "vision", "other"]);

export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: apiKeyTypeEnum("type").notNull(),
  name: text("name").notNull(),
  key: text("key").notNull(),
  isActive: boolean("is_active").default(true),
  quotaLimit: integer("quota_limit"),
  quotaUsed: integer("quota_used").default(0),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// YouTube Video Schema
export const videoStatusEnum = pgEnum("video_status", ["published", "private", "unlisted"]);

export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  youtubeId: text("youtube_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  tags: text("tags").array(),
  publishedAt: timestamp("published_at"),
  status: videoStatusEnum("status").default("published"),
  seoScore: integer("seo_score"),
  optimizationNotes: jsonb("optimization_notes"),
  lastAnalyzed: timestamp("last_analyzed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Video Analytics Schema
export const videoAnalytics = pgTable("video_analytics", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").references(() => videos.id).notNull(),
  date: timestamp("date").notNull(),
  views: integer("views").default(0),
  watchTimeHours: integer("watch_time_hours").default(0),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  ctr: text("ctr"),
  avgViewDuration: text("avg_view_duration"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Keywords Schema
export const keywords = pgTable("keywords", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  keyword: text("keyword").notNull(),
  volume: integer("volume"),
  trend: text("trend"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Settings Schema
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  key: text("key").notNull(),
  value: text("value"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define Relations
export const usersRelations = relations(users, ({ many }) => ({
  videos: many(videos),
  apiKeys: many(apiKeys),
  keywords: many(keywords),
  settings: many(settings),
}));

export const videosRelations = relations(videos, ({ one, many }) => ({
  user: one(users, { fields: [videos.userId], references: [users.id] }),
  analytics: many(videoAnalytics),
}));

export const videoAnalyticsRelations = relations(videoAnalytics, ({ one }) => ({
  video: one(videos, { fields: [videoAnalytics.videoId], references: [videos.id] }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, { fields: [apiKeys.userId], references: [users.id] }),
}));

export const keywordsRelations = relations(keywords, ({ one }) => ({
  user: one(users, { fields: [keywords.userId], references: [users.id] }),
}));

export const settingsRelations = relations(settings, ({ one }) => ({
  user: one(users, { fields: [settings.userId], references: [users.id] }),
}));

// Zod Schemas for Validation
export const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email("Must provide a valid email"),
  password: (schema) => schema.min(8, "Password must be at least 8 characters"),
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
});

export const insertApiKeySchema = createInsertSchema(apiKeys);
export const insertVideoSchema = createInsertSchema(videos);
export const insertVideoAnalyticsSchema = createInsertSchema(videoAnalytics);
export const insertKeywordSchema = createInsertSchema(keywords);
export const insertSettingSchema = createInsertSchema(settings);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
export type Video = typeof videos.$inferSelect;
export type VideoAnalytics = typeof videoAnalytics.$inferSelect;
export type Keyword = typeof keywords.$inferSelect;
export type Setting = typeof settings.$inferSelect;
