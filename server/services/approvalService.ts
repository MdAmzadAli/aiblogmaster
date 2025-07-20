import { nanoid } from 'nanoid';
import { db } from '../db';
import { approvalTokens, posts } from '@shared/schema';
import { eq, and, gte } from 'drizzle-orm';
import { sendPostApprovalEmail } from './email';
import type { Post } from '@shared/schema';

export async function createApprovalToken(postId: number): Promise<string> {
  const token = nanoid(32);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

  await db.insert(approvalTokens).values({
    postId,
    token,
    expiresAt
  });

  return token;
}

export async function validateApprovalToken(postId: number, token: string): Promise<boolean> {
  const [approvalToken] = await db
    .select()
    .from(approvalTokens)
    .where(and(
      eq(approvalTokens.postId, postId),
      eq(approvalTokens.token, token),
      gte(approvalTokens.expiresAt, new Date())
    ));

  return !!approvalToken;
}

export async function sendApprovalEmailForPost(post: Post, adminEmail: string): Promise<boolean> {
  try {
    const token = await createApprovalToken(post.id);
    return await sendPostApprovalEmail(post, token, adminEmail);
  } catch (error) {
    console.error('Error sending approval email:', error);
    return false;
  }
}

export async function approveAndPublishPost(postId: number, token: string): Promise<Post | null> {
  // Validate token
  const isValid = await validateApprovalToken(postId, token);
  if (!isValid) {
    throw new Error('Invalid or expired approval token');
  }

  // Update post status to published
  const [updatedPost] = await db
    .update(posts)
    .set({ 
      status: 'published', 
      publishedAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(posts.id, postId))
    .returning();

  // Clean up used token
  await db.delete(approvalTokens).where(eq(approvalTokens.token, token));

  return updatedPost || null;
}