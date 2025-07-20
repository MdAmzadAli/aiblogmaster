import * as cron from "node-cron";
import { storage } from "../storage";
import { createOptimizedPost } from "./gemini";

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
        cronExpression = `${minute} ${hour} * * 1`; // Default to weekly
    }

    const task = cron.schedule(cronExpression, async () => {
      try {
        console.log("Running automated content generation...");
        await this.generateAndSchedulePost(settings);
      } catch (error) {
        console.error("Error in automated post generation:", error);
      }
    });

    this.jobs.set("automation", task);
    console.log(`Scheduled automated posting: ${cronExpression}`);
  }

  private schedulePostPublishing() {
    // Check every hour for posts that need to be published
    const task = cron.schedule("0 * * * *", async () => {
      try {
        await this.publishScheduledPosts();
      } catch (error) {
        console.error("Error publishing scheduled posts:", error);
      }
    });

    this.jobs.set("publishing", task);
  }

  private async generateAndSchedulePost(settings: any) {
    try {
      const post = await createOptimizedPost(
        settings.targetKeywords || [],
        settings.contentType || "how-to",
        settings.wordCount || 1200,
        this.selectRandomCategory(settings.categories)
      );

      // Schedule for immediate publishing or set a future date
      const scheduledAt = new Date();
      scheduledAt.setMinutes(scheduledAt.getMinutes() + 5); // Publish 5 minutes from now

      const createdPost = await storage.createPost({
        ...post,
        status: "scheduled",
        scheduledAt,
      });

      console.log(`Generated and scheduled post: ${createdPost.title}`);
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
