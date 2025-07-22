import {
  users,
  posts,
  postAnalytics,
  automationSettings,
  approvalTokens,
  type User,
  type UpsertUser,
  type Post,
  type InsertPost,
  type PostAnalytics,
  type AutomationSettings,
  type InsertAutomationSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte, count } from "drizzle-orm";

export interface IStorage {
  // User operations - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Post operations
  getPosts(limit?: number, status?: string): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  getPostBySlug(slug: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<Post>;
  deletePost(id: number): Promise<void>;
  getPublishedPosts(limit?: number): Promise<Post[]>;
  getFeaturedPost(): Promise<Post | undefined>;
  getAllPosts(): Promise<Post[]>;
  
  // Analytics operations
  getPostAnalytics(postId: number): Promise<PostAnalytics[]>;
  recordPostView(postId: number, isUnique: boolean): Promise<void>;
  incrementPostViews(postId: number): Promise<void>;
  getAnalyticsSummary(): Promise<{
    totalPosts: number;
    totalViews: number;
    avgSeoScore: number;
    aiGeneratedPercentage: number;
  }>;
  
  // Automation operations
  getAutomationSettings(): Promise<AutomationSettings | undefined>;
  updateAutomationSettings(settings: Partial<InsertAutomationSettings>): Promise<AutomationSettings>;
  getScheduledPosts(): Promise<Post[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Post operations
  async getPosts(limit = 50, status?: string): Promise<Post[]> {
    if (status && status !== 'undefined') {
      return await db.select().from(posts)
        .where(eq(posts.status, status))
        .orderBy(desc(posts.createdAt))
        .limit(limit);
    }
    
    return await db.select().from(posts)
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
    return post;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async updatePost(id: number, post: Partial<InsertPost>): Promise<Post> {
    const [updatedPost] = await db
      .update(posts)
      .set({ ...post, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    return updatedPost;
  }

  async deletePost(id: number): Promise<void> {
    // First delete any related approval tokens to avoid foreign key constraint
    await db.delete(approvalTokens).where(eq(approvalTokens.postId, id));
    
    // Then delete the post
    await db.delete(posts).where(eq(posts.id, id));
  }

  async getAllPosts(): Promise<Post[]> {
    return await db.select().from(posts).orderBy(desc(posts.createdAt));
  }

  async getPublishedPosts(limit = 10): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.status, "published"))
      .orderBy(desc(posts.publishedAt))
      .limit(limit);
  }

  async getFeaturedPost(): Promise<Post | undefined> {
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.status, "published"))
      .orderBy(desc(posts.publishedAt))
      .limit(1);
    return post;
  }

  // Analytics operations
  async getPostAnalytics(postId: number): Promise<PostAnalytics[]> {
    return await db
      .select()
      .from(postAnalytics)
      .where(eq(postAnalytics.postId, postId))
      .orderBy(desc(postAnalytics.date));
  }

  async recordPostView(postId: number, isUnique: boolean): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [existing] = await db
      .select()
      .from(postAnalytics)
      .where(and(
        eq(postAnalytics.postId, postId),
        gte(postAnalytics.date, today)
      ));

    if (existing) {
      await db
        .update(postAnalytics)
        .set({
          views: (existing.views || 0) + 1,
          uniqueViews: (existing.uniqueViews || 0) + (isUnique ? 1 : 0),
        })
        .where(eq(postAnalytics.id, existing.id));
    } else {
      await db.insert(postAnalytics).values({
        postId,
        views: 1,
        uniqueViews: isUnique ? 1 : 0,
        date: today,
      });
    }
  }

  async incrementPostViews(postId: number): Promise<void> {
    // Simple increment - for more sophisticated tracking, use recordPostView
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [existing] = await db
      .select()
      .from(postAnalytics)
      .where(and(
        eq(postAnalytics.postId, postId),
        gte(postAnalytics.date, today)
      ));

    if (existing) {
      await db
        .update(postAnalytics)
        .set({ views: existing.views + 1 })
        .where(eq(postAnalytics.id, existing.id));
    } else {
      await db.insert(postAnalytics).values({
        postId,
        views: 1,
        uniqueViews: 1,
        date: today,
      });
    }
  }

  async getAnalyticsSummary(): Promise<{
    totalPosts: number;
    totalViews: number;
    avgSeoScore: number;
    aiGeneratedPercentage: number;
  }> {
    const [postsCount] = await db
      .select({ count: count() })
      .from(posts)
      .where(eq(posts.status, "published"));

    const [viewsSum] = await db
      .select({ sum: sql<number>`SUM(${postAnalytics.views})` })
      .from(postAnalytics);

    const [seoAvg] = await db
      .select({ avg: sql<number>`AVG(${posts.seoScore})` })
      .from(posts)
      .where(eq(posts.status, "published"));

    const [aiCount] = await db
      .select({ count: count() })
      .from(posts)
      .where(and(
        eq(posts.status, "published"),
        eq(posts.isAiGenerated, true)
      ));

    return {
      totalPosts: postsCount.count,
      totalViews: viewsSum.sum || 0,
      avgSeoScore: Math.round(seoAvg.avg || 0),
      aiGeneratedPercentage: postsCount.count > 0 
        ? Math.round((aiCount.count / postsCount.count) * 100) 
        : 0,
    };
  }

  // Automation operations
  async getAutomationSettings(): Promise<AutomationSettings | undefined> {
    const [settings] = await db.select().from(automationSettings).limit(1);
    return settings;
  }

  async updateAutomationSettings(settingsData: Partial<InsertAutomationSettings>): Promise<AutomationSettings> {
    const existing = await this.getAutomationSettings();
    
    if (existing) {
      const [updated] = await db
        .update(automationSettings)
        .set({ ...settingsData, updatedAt: new Date() })
        .where(eq(automationSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(automationSettings)
        .values(settingsData)
        .returning();
      return created;
    }
  }

  async getScheduledPosts(): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.status, "scheduled"))
      .orderBy(posts.scheduledAt);
  }
}

export const storage = new DatabaseStorage();
