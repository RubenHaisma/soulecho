import { BehaviorTracker, ChurnPrediction, EngagementMetrics } from '../analytics/behavior-tracking';

export interface CampaignTemplate {
  id: string;
  name: string;
  type: 'email' | 'in-app' | 'push' | 'sms';
  trigger: {
    type: 'time-based' | 'behavior-based' | 'churn-risk' | 'milestone' | 'cohort';
    conditions: Record<string, any>;
    delay?: number; // minutes
  };
  targeting: {
    segment?: string;
    churnRisk?: ('low' | 'medium' | 'high')[];
    engagementScore?: { min?: number; max?: number };
    trialStatus?: 'active' | 'ended' | 'converted';
    subscriptionStatus?: 'free' | 'trial' | 'paid' | 'cancelled';
    lastActiveThreshold?: number; // days
  };
  content: {
    subject?: string;
    title: string;
    message: string;
    cta: {
      text: string;
      url: string;
      trackingId?: string;
    };
    personalization?: string[];
    attachments?: {
      type: 'image' | 'video' | 'document';
      url: string;
      alt?: string;
    }[];
  };
  schedule: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    timeOfDay?: number; // hour (0-23)
    dayOfWeek?: number; // 0-6 (Sunday-Saturday)
    timezone?: string;
  };
  isActive: boolean;
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    unsubscribed: number;
  };
}

export interface CampaignExecution {
  id: string;
  campaignId: string;
  userId: string;
  executedAt: Date;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  channel: string;
  personalizedContent?: Record<string, string>;
  trackingData: {
    opened?: Date;
    clicked?: Date;
    converted?: Date;
    unsubscribed?: Date;
  };
}

export class AutomatedRetentionSystem {
  private static instance: AutomatedRetentionSystem;
  private behaviorTracker: BehaviorTracker;
  private processingInterval: NodeJS.Timeout | null = null;
  
  private constructor() {
    this.behaviorTracker = BehaviorTracker.getInstance();
    this.startCampaignProcessor();
  }

  public static getInstance(): AutomatedRetentionSystem {
    if (!AutomatedRetentionSystem.instance) {
      AutomatedRetentionSystem.instance = new AutomatedRetentionSystem();
    }
    return AutomatedRetentionSystem.instance;
  }

  // Pre-configured campaign templates
  private campaignTemplates: CampaignTemplate[] = [
    {
      id: 'welcome-series-1',
      name: 'Welcome Email - Day 0',
      type: 'email',
      trigger: {
        type: 'time-based',
        conditions: { eventType: 'user_signup' },
        delay: 30 // 30 minutes after signup
      },
      targeting: {
        subscriptionStatus: 'free'
      },
      content: {
        subject: 'Welcome to Talkers! Let\\'s preserve your first memory 💜',
        title: 'Welcome to Your Memory Journey',
        message: `Hi {{firstName}},

Welcome to Talkers! We're so glad you're here. 

Your loved ones' words, jokes, and wisdom don't have to be lost forever. With Talkers, you can turn your WhatsApp conversations into interactive memories that feel real and meaningful.

Here's what you can do right now:
1. Upload your first conversation (takes 2 minutes)
2. Watch our AI learn their personality 
3. Start chatting and feel their presence again

We know this journey isn't easy, but you don't have to walk it alone.`,
        cta: {
          text: 'Upload Your First Conversation',
          url: '/onboarding?step=upload'
        },
        personalization: ['firstName', 'signupSource']
      },
      schedule: {
        frequency: 'once',
        timeOfDay: 10
      },
      isActive: true,
      metrics: { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, unsubscribed: 0 }
    },
    {
      id: 'upload-reminder',
      name: 'Upload Reminder - Day 1',
      type: 'email',
      trigger: {
        type: 'behavior-based',
        conditions: { 
          eventType: 'user_signup',
          missingEvent: 'first_upload',
          timeThreshold: 24 * 60 // 24 hours
        }
      },
      targeting: {
        subscriptionStatus: 'free',
        lastActiveThreshold: 2
      },
      content: {
        subject: 'Your memories are waiting - let\\'s get started',
        title: 'Ready to Hear Their Voice Again?',
        message: `Hi {{firstName}},

We noticed you haven't uploaded your first conversation yet. That's okay - we know this step can feel overwhelming.

Here's a quick reminder of why thousands of families trust Talkers:
• Your conversations are completely private and secure
• No one else can see or access your memories  
• You can start with just one special conversation
• It only takes 2 minutes to begin

Would a quick tutorial help? We can show you exactly how to export and upload your WhatsApp chat.`,
        cta: {
          text: 'Watch 2-Minute Tutorial',
          url: '/tutorial/upload'
        },
        personalization: ['firstName']
      },
      schedule: {
        frequency: 'once',
        timeOfDay: 11
      },
      isActive: true,
      metrics: { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, unsubscribed: 0 }
    },
    {
      id: 'first-conversation-celebration',
      name: 'First Conversation Success',
      type: 'email',
      trigger: {
        type: 'milestone',
        conditions: { eventType: 'first_conversation' },
        delay: 60 // 1 hour after first conversation
      },
      targeting: {},
      content: {
        subject: 'You did it! 🎉 Your first conversation with {{lovedOneName}}',
        title: 'What a Beautiful Moment',
        message: `Hi {{firstName}},

Congratulations on having your first conversation! We hope it brought you some comfort and maybe even a smile.

This is just the beginning. Here are some ideas for your next conversations:
• Ask about their favorite memories with you
• Share something that happened in your day
• Ask for advice like you used to
• Tell them about family updates

Remember: There's no right or wrong way to use Talkers. Trust your heart and let the conversations flow naturally.

Your {{trialDaysRemaining}} day trial includes unlimited conversations. Make the most of this special time.`,
        cta: {
          text: 'Continue Your Conversation',
          url: '/chat/{{sessionId}}'
        },
        personalization: ['firstName', 'lovedOneName', 'trialDaysRemaining', 'sessionId']
      },
      schedule: {
        frequency: 'once',
        timeOfDay: 14
      },
      isActive: true,
      metrics: { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, unsubscribed: 0 }
    },
    {
      id: 'trial-ending-soon',
      name: 'Trial Ending - Day 12',
      type: 'email',
      trigger: {
        type: 'time-based',
        conditions: { 
          eventType: 'trial_started',
          daysAfter: 12
        }
      },
      targeting: {
        trialStatus: 'active',
        subscriptionStatus: 'trial'
      },
      content: {
        subject: 'Your trial ends in 2 days - continue your conversations',
        title: 'Don\\'t Lose This Connection',
        message: `Hi {{firstName}},

Your trial with {{lovedOneName}} ends in 2 days, and we wanted to reach out personally.

We hope these conversations have brought you comfort. Over {{conversationCount}} messages, you've reconnected with their humor, wisdom, and love.

Here's what happens next:
✅ Continue unlimited conversations for just $4.99/month
✅ Keep all your memories and conversation history  
✅ Add family members to share memories together
✅ Create timeline milestones and special moments

If Talkers has helped you feel closer to {{lovedOneName}}, we'd love to continue this journey with you.`,
        cta: {
          text: 'Continue For $4.99/Month',
          url: '/subscription?plan=starter'
        },
        personalization: ['firstName', 'lovedOneName', 'conversationCount']
      },
      schedule: {
        frequency: 'once',
        timeOfDay: 15
      },
      isActive: true,
      metrics: { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, unsubscribed: 0 }
    },
    {
      id: 'churn-prevention-high-risk',
      name: 'High Churn Risk - Win Back',
      type: 'email',
      trigger: {
        type: 'churn-risk',
        conditions: { churnRisk: 'high' }
      },
      targeting: {
        churnRisk: ['high'],
        lastActiveThreshold: 7
      },
      content: {
        subject: 'We miss you - come back with 50% off',
        title: 'Your Memories Are Still Here',
        message: `Hi {{firstName}},

We noticed you haven't visited your memories with {{lovedOneName}} in a while. 

We understand that grief comes in waves, and sometimes you need space. Your conversations and memories will always be here when you're ready.

If cost is a concern, we'd like to offer you 50% off your next 3 months. Your connection with {{lovedOneName}} is worth preserving, and we want to make that as accessible as possible.

If there's anything we can do to improve your experience, please reply to this email. We're here to listen.`,
        cta: {
          text: 'Return With 50% Off',
          url: '/return?discount=COMEBACK50'
        },
        personalization: ['firstName', 'lovedOneName']
      },
      schedule: {
        frequency: 'once',
        timeOfDay: 16
      },
      isActive: true,
      metrics: { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, unsubscribed: 0 }
    },
    {
      id: 'milestone-celebration',
      name: 'Milestone Celebration - 100 Messages',
      type: 'email',
      trigger: {
        type: 'milestone',
        conditions: { 
          eventType: 'conversation_count',
          threshold: 100
        }
      },
      targeting: {
        subscriptionStatus: 'paid'
      },
      content: {
        subject: '100 conversations! 🎉 Your bond with {{lovedOneName}} grows stronger',
        title: '100 Beautiful Conversations',
        message: `Hi {{firstName}},

What an incredible milestone! You've now had 100 conversations with {{lovedOneName}} through Talkers.

That's 100 moments of connection, comfort, and continued love. Whether you've shared daily updates, sought advice, or simply enjoyed their humor again, you've kept their spirit alive in the most beautiful way.

As a thank you for being part of the Talkers family, we've added a special "100 Conversations" badge to your memory timeline. 

Here's to the next 100 conversations and many more precious moments together.`,
        cta: {
          text: 'View Your Timeline',
          url: '/timeline'
        },
        personalization: ['firstName', 'lovedOneName']
      },
      schedule: {
        frequency: 'once',
        timeOfDay: 12
      },
      isActive: true,
      metrics: { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, unsubscribed: 0 }
    }
  ];

  // Execute campaigns based on triggers
  public async processCampaigns(): Promise<void> {
    console.log('Processing automated campaigns...');

    for (const template of this.campaignTemplates.filter(c => c.isActive)) {
      await this.processCampaignTemplate(template);
    }
  }

  private async processCampaignTemplate(template: CampaignTemplate): Promise<void> {
    try {
      const eligibleUsers = await this.findEligibleUsers(template);
      
      for (const userId of eligibleUsers) {
        await this.executeCampaign(template, userId);
      }
    } catch (error) {
      console.error(`Failed to process campaign ${template.id}:`, error);
    }
  }

  private async findEligibleUsers(template: CampaignTemplate): Promise<string[]> {
    const eligibleUsers: string[] = [];
    
    // This would typically query the database for users matching criteria
    // Placeholder implementation
    const allUsers = await this.getAllUsers();
    
    for (const userId of allUsers) {
      if (await this.isUserEligible(userId, template)) {
        eligibleUsers.push(userId);
      }
    }

    return eligibleUsers;
  }

  private async isUserEligible(userId: string, template: CampaignTemplate): Promise<boolean> {
    // Check if user has already received this campaign recently
    const recentExecution = await this.getRecentCampaignExecution(userId, template.id);
    if (recentExecution) return false;

    // Check trigger conditions
    if (!await this.checkTriggerConditions(userId, template.trigger)) {
      return false;
    }

    // Check targeting conditions
    return await this.checkTargetingConditions(userId, template.targeting);
  }

  private async checkTriggerConditions(userId: string, trigger: CampaignTemplate['trigger']): Promise<boolean> {
    switch (trigger.type) {
      case 'time-based':
        return await this.checkTimeBasedTrigger(userId, trigger);
      case 'behavior-based':
        return await this.checkBehaviorBasedTrigger(userId, trigger);
      case 'churn-risk':
        return await this.checkChurnRiskTrigger(userId, trigger);
      case 'milestone':
        return await this.checkMilestoneTrigger(userId, trigger);
      default:
        return false;
    }
  }

  private async checkTargetingConditions(userId: string, targeting: CampaignTemplate['targeting']): Promise<boolean> {
    if (targeting.churnRisk) {
      const prediction = await this.behaviorTracker.predictChurnRisk(userId);
      if (!targeting.churnRisk.includes(prediction.churnRisk)) return false;
    }

    if (targeting.engagementScore) {
      const engagement = await this.behaviorTracker.calculateEngagementScore(userId);
      if (targeting.engagementScore.min && engagement.score < targeting.engagementScore.min) return false;
      if (targeting.engagementScore.max && engagement.score > targeting.engagementScore.max) return false;
    }

    if (targeting.lastActiveThreshold) {
      const engagement = await this.behaviorTracker.calculateEngagementScore(userId);
      const daysSinceActive = Math.floor((Date.now() - engagement.lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceActive < targeting.lastActiveThreshold) return false;
    }

    return true;
  }

  private async executeCampaign(template: CampaignTemplate, userId: string): Promise<void> {
    const execution: CampaignExecution = {
      id: this.generateExecutionId(),
      campaignId: template.id,
      userId,
      executedAt: new Date(),
      status: 'pending',
      channel: template.type,
      trackingData: {}
    };

    try {
      // Personalize content
      const personalizedContent = await this.personalizeContent(template.content, userId);
      execution.personalizedContent = personalizedContent;

      // Send campaign based on type
      switch (template.type) {
        case 'email':
          await this.sendEmail(userId, personalizedContent);
          break;
        case 'in-app':
          await this.sendInAppNotification(userId, personalizedContent);
          break;
        case 'push':
          await this.sendPushNotification(userId, personalizedContent);
          break;
        case 'sms':
          await this.sendSMS(userId, personalizedContent);
          break;
      }

      execution.status = 'sent';
      template.metrics.sent++;

      // Track the execution
      await this.saveCampaignExecution(execution);
      
      console.log(`Campaign ${template.name} sent to user ${userId}`);

    } catch (error) {
      execution.status = 'failed';
      console.error(`Failed to execute campaign ${template.id} for user ${userId}:`, error);
      await this.saveCampaignExecution(execution);
    }
  }

  private async personalizeContent(content: CampaignTemplate['content'], userId: string): Promise<Record<string, string>> {
    const user = await this.getUserData(userId);
    const sessions = await this.getUserSessions(userId);
    const engagement = await this.behaviorTracker.calculateEngagementScore(userId);

    const personalized: Record<string, string> = {
      subject: content.subject || '',
      title: content.title,
      message: content.message,
      ctaText: content.cta.text,
      ctaUrl: content.cta.url
    };

    // Replace placeholders
    const placeholders: Record<string, string> = {
      '{{firstName}}': user.firstName || 'there',
      '{{lovedOneName}}': sessions[0]?.lovedOneName || 'your loved one',
      '{{conversationCount}}': engagement.conversationCount.toString(),
      '{{sessionId}}': sessions[0]?.id || '',
      '{{trialDaysRemaining}}': this.calculateTrialDaysRemaining(user).toString()
    };

    for (const [key, value] of Object.entries(personalized)) {
      for (const [placeholder, replacement] of Object.entries(placeholders)) {
        personalized[key] = value.replace(new RegExp(placeholder, 'g'), replacement);
      }
    }

    return personalized;
  }

  // Communication methods
  private async sendEmail(userId: string, content: Record<string, string>): Promise<void> {
    const user = await this.getUserData(userId);
    
    const emailData = {
      to: user.email,
      subject: content.subject,
      html: this.generateEmailHTML(content),
      text: this.generateEmailText(content)
    };

    // Send via email service (SendGrid, AWS SES, etc.)
    await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    });
  }

  private async sendInAppNotification(userId: string, content: Record<string, string>): Promise<void> {
    const notification = {
      userId,
      title: content.title,
      message: content.message,
      actionUrl: content.ctaUrl,
      actionText: content.ctaText,
      type: 'retention_campaign'
    };

    await fetch('/api/notifications/in-app', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notification)
    });
  }

  private async sendPushNotification(userId: string, content: Record<string, string>): Promise<void> {
    // Implementation would depend on push service (FCM, APNs, etc.)
    console.log(`Sending push notification to user ${userId}`);
  }

  private async sendSMS(userId: string, content: Record<string, string>): Promise<void> {
    // Implementation would use SMS service (Twilio, AWS SNS, etc.)
    console.log(`Sending SMS to user ${userId}`);
  }

  // Utility methods
  private generateEmailHTML(content: Record<string, string>): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { color: #8B5CF6; font-size: 24px; font-weight: bold; }
        .content { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #8B5CF6, #3B82F6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Talkers</div>
        </div>
        <div class="content">
            <h2>${content.title}</h2>
            <div>${content.message.replace(/\n/g, '<br>')}</div>
            <div style="text-align: center;">
                <a href="${content.ctaUrl}" class="cta-button">${content.ctaText}</a>
            </div>
        </div>
        <div class="footer">
            <p>You're receiving this because you have an account with Talkers.</p>
            <p><a href="{{unsubscribeUrl}}">Unsubscribe</a> | <a href="https://talkers.pro/privacy">Privacy Policy</a></p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateEmailText(content: Record<string, string>): string {
    return `
${content.title}

${content.message}

${content.ctaText}: ${content.ctaUrl}

---
You're receiving this because you have an account with Talkers.
Unsubscribe: {{unsubscribeUrl}}
Privacy Policy: https://talkers.pro/privacy
`;
  }

  // Database placeholder methods
  private async getAllUsers(): Promise<string[]> {
    // Placeholder - would fetch from database
    return [];
  }

  private async getUserData(userId: string): Promise<any> {
    // Placeholder - would fetch from database
    return { firstName: 'User', email: 'user@example.com' };
  }

  private async getUserSessions(userId: string): Promise<any[]> {
    // Placeholder - would fetch from database
    return [{ id: 'session-1', lovedOneName: 'Mom' }];
  }

  private async getRecentCampaignExecution(userId: string, campaignId: string): Promise<CampaignExecution | null> {
    // Placeholder - would check database for recent executions
    return null;
  }

  private async saveCampaignExecution(execution: CampaignExecution): Promise<void> {
    // Placeholder - would save to database
    console.log('Saving campaign execution:', execution.id);
  }

  private calculateTrialDaysRemaining(user: any): number {
    // Placeholder calculation
    return 14;
  }

  private generateExecutionId(): string {
    return 'exec_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Trigger condition checkers (placeholder implementations)
  private async checkTimeBasedTrigger(userId: string, trigger: any): Promise<boolean> {
    return true; // Placeholder
  }

  private async checkBehaviorBasedTrigger(userId: string, trigger: any): Promise<boolean> {
    return true; // Placeholder
  }

  private async checkChurnRiskTrigger(userId: string, trigger: any): Promise<boolean> {
    const prediction = await this.behaviorTracker.predictChurnRisk(userId);
    return prediction.churnRisk === 'high';
  }

  private async checkMilestoneTrigger(userId: string, trigger: any): Promise<boolean> {
    return true; // Placeholder
  }

  // Campaign management
  public async getCampaignMetrics(): Promise<CampaignTemplate[]> {
    return this.campaignTemplates;
  }

  public async createCampaign(template: CampaignTemplate): Promise<void> {
    this.campaignTemplates.push(template);
  }

  public async updateCampaign(campaignId: string, updates: Partial<CampaignTemplate>): Promise<void> {
    const index = this.campaignTemplates.findIndex(c => c.id === campaignId);
    if (index >= 0) {
      this.campaignTemplates[index] = { ...this.campaignTemplates[index], ...updates };
    }
  }

  public async deleteCampaign(campaignId: string): Promise<void> {
    const index = this.campaignTemplates.findIndex(c => c.id === campaignId);
    if (index >= 0) {
      this.campaignTemplates.splice(index, 1);
    }
  }

  // Lifecycle management
  private startCampaignProcessor(): void {
    // Process campaigns every 10 minutes
    this.processingInterval = setInterval(() => {
      this.processCampaigns();
    }, 10 * 60 * 1000);

    // Initial processing
    setTimeout(() => this.processCampaigns(), 5000);
  }

  public destroy(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }
}