import type { Post } from '@shared/schema';

export interface EmailParams {
  to: string;
  from: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    const emailData = {
      sender: { email: params.from, name: "AI Blog Platform" },
      to: [{ email: params.to }],
      subject: params.subject,
      htmlContent: params.htmlContent,
      textContent: params.textContent,
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY || '',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      console.error('Brevo API error:', response.status, response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Brevo email error:', error);
    return false;
  }
}

export async function sendPostApprovalEmail(post: Post, approvalToken: string, adminEmail: string): Promise<boolean> {
  const baseUrl = process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'http://localhost:5000';
  const approvalUrl = `${baseUrl}/admin/approve/${post.id}?token=${approvalToken}`;
  const editUrl = `${baseUrl}/admin/posts/edit/${post.id}?token=${approvalToken}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .post-preview { background: #fff; border: 1px solid #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 24px; margin: 10px 5px; text-decoration: none; border-radius: 6px; font-weight: bold; }
            .approve-btn { background: #28a745; color: white; }
            .edit-btn { background: #007bff; color: white; }
            .meta { font-size: 14px; color: #6c757d; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>🤖 AI Generated Post Ready for Review</h2>
            <p>A new AI-generated blog post is ready for your approval.</p>
        </div>

        <div class="post-preview">
            <h3>${post.title}</h3>
            <div class="meta">
                <strong>Category:</strong> ${post.category}<br>
                <strong>SEO Score:</strong> ${post.seoScore}/100<br>
                <strong>Keywords:</strong> ${post.keywords?.join(', ') || 'None'}<br>
                <strong>Word Count:</strong> ~${post.content.split(' ').length} words
            </div>
            
            <h4>Excerpt:</h4>
            <p>${post.excerpt}</p>
            
            <h4>Meta Description:</h4>
            <p>${post.metaDescription}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${approvalUrl}" class="button approve-btn">✅ Approve & Publish</a>
            <a href="${editUrl}" class="button edit-btn">✏️ Edit Post</a>
        </div>

        <p style="font-size: 12px; color: #6c757d; text-align: center;">
            This email was sent automatically by your AI Blog Platform.<br>
            Links expire in 24 hours for security.
        </p>
    </body>
    </html>
  `;

  const textContent = `
AI Generated Post Ready for Review

Title: ${post.title}
Category: ${post.category}
SEO Score: ${post.seoScore}/100

Excerpt: ${post.excerpt}

To approve and publish: ${approvalUrl}
To edit the post: ${editUrl}

Links expire in 24 hours.
  `;

  return await sendEmail({
    to: adminEmail,
    from: process.env.FROM_EMAIL || 'noreply@aiblogs.com',
    subject: `📝 New AI Post Ready: "${post.title}"`,
    htmlContent,
    textContent
  });
}