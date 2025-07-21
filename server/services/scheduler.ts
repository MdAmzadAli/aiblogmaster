import * as cron from "node-cron";
import { storage } from "../storage";
import { createOptimizedPost } from "./gemini";
import { sendApprovalEmailForPost } from "./approvalService";

class BlogScheduler {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  async initializeScheduler() {
    try {
      const settings = await storage.getAutomationSettings();
      if (settings && settings.isEnabled) {
        this.scheduleAutomatedPosting(settings);
      }
      
      // Also schedule a job to publish scheduled posts
      this.schedulePostPublishing();
      
      console.log("Blog scheduler initialized");
    } catch (error) {
      console.error("Failed to initialize scheduler:", error);
    }
  }

  private scheduleAutomatedPosting(settings: any) {
    // Clear existing automation job if any
    const existingJob = this.jobs.get("automation");
    if (existingJob) {
      existingJob.destroy();
    }

    // Parse scheduled time (format: "HH:MM")
    const [hour, minute] = settings.scheduledTime.split(':');
    
    let cronExpression = '';
    switch (settings.frequency) {
      case 'twice-daily':
        // 10:00 AM and 4:00 PM daily
        cronExpression = `${minute} ${hour},16 * * *`;
        break;
      case 'daily':
        cronExpression = `${minute} ${hour} * * *`;
        break;
      case 'weekly':
        // Default to Monday for weekly posts (best for SEO)
        cronExpression = `${minute} ${hour} * * 1`;
        break;
      case 'monthly':
        // First day of each month
        cronExpression = `${minute} ${hour} 1 * *`;
        break;
      default:
        cronExpression = `${minute} ${hour},16 * * *`; // Default to twice daily
    }

    const task = cron.schedule(cronExpression, async () => {
      try {
        console.log("Running automated content generation (IST)...");
        await this.generateAndSchedulePost(settings);
      } catch (error) {
        console.error("Error in automated post generation:", error);
      }
    }, {
      timezone: "Asia/Kolkata"
    });

    this.jobs.set("automation", task);
    console.log(`Scheduled automated posting (IST): ${cronExpression} at ${settings.scheduledTime} IST`);
  }

  private schedulePostPublishing() {
    // Check every hour for posts that need to be published
    const task = cron.schedule("0 * * * *", async () => {
      try {
        await this.publishScheduledPosts();
      } catch (error) {
        console.error("Error publishing scheduled posts:", error);
      }
    }, {
      timezone: "Asia/Kolkata"
    });

    this.jobs.set("publishing", task);
  }

  async generateAndSchedulePost(settings: any) {
    try {
      const post = await createOptimizedPost(
        settings.targetKeywords || [],
        settings.contentType || "how-to",
        settings.wordCount || 1200,
        this.selectRandomCategory(settings.categories)
      );

      // Create post as draft for approval
      const createdPost = await storage.createPost({
        ...post,
        status: "draft", // Always create as draft for approval
        scheduledAt: new Date()
      });

      // Send approval email if admin email is set
      if (settings.adminEmail) {
        const emailSent = await sendApprovalEmailForPost(createdPost, settings.adminEmail);
        if (emailSent) {
          console.log(`Generated post and sent approval email: ${createdPost.title}`);
        } else {
          console.log(`Generated post but failed to send email: ${createdPost.title}`);
        }
      } else {
        console.log(`Generated post (no email configured): ${createdPost.title}`);
      }
    } catch (error) {
      console.error("Failed to generate automated post:", error);
    }
  }

  private async publishScheduledPosts() {
    try {
      const scheduledPosts = await storage.getScheduledPosts();
      const now = new Date();

      for (const post of scheduledPosts) {
        if (post.scheduledAt && post.scheduledAt <= now) {
          await storage.updatePost(post.id, {
            status: "published",
            publishedAt: now,
          });
          console.log(`Published scheduled post: ${post.title}`);
        }
      }
    } catch (error) {
      console.error("Error publishing scheduled posts:", error);
    }
  }

  private selectRandomCategory(categories: string[] = []): string {
    const defaultCategories = ["SEO", "AI", "Marketing", "Technology", "Content Strategy"];
    const availableCategories = categories.length > 0 ? categories : defaultCategories;
    return availableCategories[Math.floor(Math.random() * availableCategories.length)];
  }

  async updateSchedule(settings: any) {
    if (settings.isEnabled) {
      this.scheduleAutomatedPosting(settings);
    } else {
      const existingJob = this.jobs.get("automation");
      if (existingJob) {
        existingJob.destroy();
        this.jobs.delete("automation");
      }
    }
  }

  stop() {
    this.jobs.forEach(job => job.destroy());
    this.jobs.clear();
    console.log("Blog scheduler stopped");
  }
}

export const blogScheduler = new BlogScheduler();
