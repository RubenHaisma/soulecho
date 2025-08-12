export interface UserEvent {
  userId: string;
  sessionId: string;
  eventType: string;
  eventData: Record<string, any>;
  timestamp: Date;
  source: 'web' | 'mobile' | 'api';
  userAgent?: string;
  ipAddress?: string;
}

export interface EngagementMetrics {
  userId: string;
  sessionCount: number;
  totalTimeSpent: number;
  pageViews: number;
  conversationCount: number;
  uploadCount: number;
  featuresUsed: string[];
  lastActiveDate: Date;
  streak: number;
  score: number;
}

export interface ChurnPrediction {
  userId: string;
  churnRisk: 'low' | 'medium' | 'high';
  probability: number;
  riskFactors: string[];
  lastPredictionDate: Date;
  suggestedActions: string[];
}

export interface UserJourney {
  userId: string;
  registrationDate: Date;
  currentStage: 'onboarding' | 'activation' | 'growth' | 'retention' | 'resurrection';
  stageHistory: {
    stage: string;
    enteredAt: Date;
    exitedAt?: Date;
    duration?: number;
  }[];
  milestones: {
    name: string;
    achievedAt: Date;
    value?: number;
  }[];
  conversionEvents: {
    event: string;
    date: Date;
    value?: number;
  }[];
}

export class BehaviorTracker {
  private static instance: BehaviorTracker;
  private eventQueue: UserEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startEventProcessor();
  }

  public static getInstance(): BehaviorTracker {
    if (!BehaviorTracker.instance) {
      BehaviorTracker.instance = new BehaviorTracker();
    }
    return BehaviorTracker.instance;
  }

  // Track user events
  public track(userId: string, eventType: string, eventData: Record<string, any> = {}, sessionId?: string) {
    const event: UserEvent = {
      userId,
      sessionId: sessionId || this.generateSessionId(),
      eventType,
      eventData,
      timestamp: new Date(),
      source: 'web',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
    };

    this.eventQueue.push(event);
    
    // Immediate processing for critical events
    if (this.isCriticalEvent(eventType)) {
      this.processEvent(event);
    }
  }

  // Track specific user actions
  public trackSignup(userId: string, source: string, referrer?: string) {
    this.track(userId, 'user_signup', { source, referrer });
  }

  public trackFirstUpload(userId: string, fileType: string, fileSize: number) {
    this.track(userId, 'first_upload', { fileType, fileSize });
  }

  public trackFirstConversation(userId: string, sessionId: string) {
    this.track(userId, 'first_conversation', { sessionId });
  }

  public trackSubscription(userId: string, planId: string, amount: number) {
    this.track(userId, 'subscription_created', { planId, amount });
  }

  public trackChurn(userId: string, reason?: string) {
    this.track(userId, 'user_churned', { reason });
  }

  public trackFeatureUsage(userId: string, feature: string, context?: Record<string, any>) {
    this.track(userId, 'feature_used', { feature, ...context });
  }

  public trackPageView(userId: string, page: string, timeSpent?: number) {
    this.track(userId, 'page_view', { page, timeSpent });
  }

  public trackTrialStart(userId: string, trialType: string) {
    this.track(userId, 'trial_started', { trialType });
  }

  public trackTrialEnd(userId: string, outcome: 'converted' | 'churned') {
    this.track(userId, 'trial_ended', { outcome });
  }

  // Calculate engagement metrics
  public async calculateEngagementScore(userId: string, timeframe: number = 30): Promise<EngagementMetrics> {
    const events = await this.getUserEvents(userId, timeframe);
    
    const sessionCount = new Set(events.map(e => e.sessionId)).size;
    const totalTimeSpent = this.calculateTotalTimeSpent(events);
    const pageViews = events.filter(e => e.eventType === 'page_view').length;
    const conversationCount = events.filter(e => e.eventType === 'conversation_started').length;
    const uploadCount = events.filter(e => e.eventType === 'file_uploaded').length;
    const featuresUsed = [...new Set(events.filter(e => e.eventType === 'feature_used').map(e => e.eventData.feature))];
    
    const lastActiveDate = events.length > 0 ? new Date(Math.max(...events.map(e => e.timestamp.getTime()))) : new Date();
    const streak = this.calculateStreak(events);
    
    // Calculate weighted engagement score
    let score = 0;
    score += Math.min(sessionCount * 0.5, 5); // Sessions (max 5 points)
    score += Math.min(conversationCount * 1, 10); // Conversations (max 10 points)
    score += Math.min(uploadCount * 2, 6); // Uploads (max 6 points)
    score += Math.min(featuresUsed.length * 0.3, 3); // Feature diversity (max 3 points)
    score += Math.min(streak * 0.1, 2); // Consistency (max 2 points)
    score += Math.min(totalTimeSpent / 3600 * 0.1, 4); // Time spent (max 4 points)
    
    return {
      userId,
      sessionCount,
      totalTimeSpent,
      pageViews,
      conversationCount,
      uploadCount,
      featuresUsed,
      lastActiveDate,
      streak,
      score: Math.round(score * 10) / 10
    };
  }

  // Predict churn risk
  public async predictChurnRisk(userId: string): Promise<ChurnPrediction> {
    const engagement = await this.calculateEngagementScore(userId);
    const events = await this.getUserEvents(userId, 30);
    const journey = await this.getUserJourney(userId);
    
    const riskFactors: string[] = [];
    let riskScore = 0;

    // Low engagement score
    if (engagement.score < 3) {
      riskFactors.push('Low engagement score');
      riskScore += 3;
    }

    // No recent activity
    const daysSinceLastActive = Math.floor((Date.now() - engagement.lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLastActive > 7) {
      riskFactors.push('Inactive for more than 7 days');
      riskScore += 2;
    }

    // No conversations
    if (engagement.conversationCount === 0) {
      riskFactors.push('No conversations started');
      riskScore += 2;
    }

    // Trial without conversion
    const trialEvents = events.filter(e => e.eventType === 'trial_started');
    const conversionEvents = events.filter(e => e.eventType === 'subscription_created');
    if (trialEvents.length > 0 && conversionEvents.length === 0) {
      const trialAge = Math.floor((Date.now() - trialEvents[0].timestamp.getTime()) / (1000 * 60 * 60 * 24));
      if (trialAge > 10) {
        riskFactors.push('Trial period ending without conversion');
        riskScore += 3;
      }
    }

    // Declining session frequency
    const recentSessions = events.filter(e => 
      e.timestamp.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length;
    const previousSessions = events.filter(e => 
      e.timestamp.getTime() > Date.now() - 14 * 24 * 60 * 60 * 1000 &&
      e.timestamp.getTime() <= Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length;
    
    if (previousSessions > recentSessions * 1.5) {
      riskFactors.push('Declining session frequency');
      riskScore += 2;
    }

    // Support tickets without resolution
    const supportEvents = events.filter(e => e.eventType === 'support_ticket_created');
    if (supportEvents.length > 0) {
      riskFactors.push('Unresolved support issues');
      riskScore += 1;
    }

    // Determine risk level
    let churnRisk: 'low' | 'medium' | 'high';
    if (riskScore <= 2) churnRisk = 'low';
    else if (riskScore <= 5) churnRisk = 'medium';
    else churnRisk = 'high';

    // Generate suggested actions
    const suggestedActions = this.generateRetentionActions(churnRisk, riskFactors, engagement);

    return {
      userId,
      churnRisk,
      probability: Math.min(riskScore / 10, 0.95),
      riskFactors,
      lastPredictionDate: new Date(),
      suggestedActions
    };
  }

  // Track user journey stages
  public async getUserJourney(userId: string): Promise<UserJourney> {
    const events = await this.getUserEvents(userId);
    const registrationEvent = events.find(e => e.eventType === 'user_signup');
    const registrationDate = registrationEvent ? registrationEvent.timestamp : new Date();

    // Determine current stage
    let currentStage: UserJourney['currentStage'] = 'onboarding';
    
    if (events.some(e => e.eventType === 'subscription_created')) {
      currentStage = 'retention';
    } else if (events.some(e => e.eventType === 'first_conversation')) {
      currentStage = 'growth';
    } else if (events.some(e => e.eventType === 'first_upload')) {
      currentStage = 'activation';
    }

    // Check for resurrection stage
    const lastActiveDate = events.length > 0 ? new Date(Math.max(...events.map(e => e.timestamp.getTime()))) : new Date();
    const daysSinceActive = Math.floor((Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceActive > 30) {
      currentStage = 'resurrection';
    }

    // Build stage history
    const stageHistory = [
      { stage: 'onboarding', enteredAt: registrationDate }
    ];

    const firstUpload = events.find(e => e.eventType === 'first_upload');
    if (firstUpload) {
      stageHistory.push({ stage: 'activation', enteredAt: firstUpload.timestamp });
    }

    const firstConversation = events.find(e => e.eventType === 'first_conversation');
    if (firstConversation) {
      stageHistory.push({ stage: 'growth', enteredAt: firstConversation.timestamp });
    }

    const subscription = events.find(e => e.eventType === 'subscription_created');
    if (subscription) {
      stageHistory.push({ stage: 'retention', enteredAt: subscription.timestamp });
    }

    // Identify milestones
    const milestones = [];
    if (firstUpload) milestones.push({ name: 'First Upload', achievedAt: firstUpload.timestamp });
    if (firstConversation) milestones.push({ name: 'First Conversation', achievedAt: firstConversation.timestamp });
    if (subscription) milestones.push({ name: 'Subscription', achievedAt: subscription.timestamp });

    // Track conversion events
    const conversionEvents = events.filter(e => 
      ['trial_started', 'subscription_created', 'upgrade_plan'].includes(e.eventType)
    ).map(e => ({
      event: e.eventType,
      date: e.timestamp,
      value: e.eventData.amount
    }));

    return {
      userId,
      registrationDate,
      currentStage,
      stageHistory,
      milestones,
      conversionEvents
    };
  }

  private generateRetentionActions(
    churnRisk: 'low' | 'medium' | 'high',
    riskFactors: string[],
    engagement: EngagementMetrics
  ): string[] {
    const actions: string[] = [];

    if (churnRisk === 'high') {
      actions.push('Send immediate personalized re-engagement email');
      actions.push('Offer extended trial or discount');
      actions.push('Schedule personal onboarding call');
    }

    if (churnRisk === 'medium') {
      actions.push('Send helpful tips and tutorials');
      actions.push('Highlight unused features');
      actions.push('Send social proof testimonials');
    }

    if (riskFactors.includes('No conversations started')) {
      actions.push('Send conversation starter suggestions');
      actions.push('Provide upload tutorial');
    }

    if (riskFactors.includes('Inactive for more than 7 days')) {
      actions.push('Send "We miss you" email with new features');
      actions.push('Offer limited-time bonus features');
    }

    if (engagement.conversationCount > 0 && churnRisk === 'low') {
      actions.push('Send milestone celebration');
      actions.push('Request testimonial or review');
    }

    return actions;
  }

  private async getUserEvents(userId: string, days?: number): Promise<UserEvent[]> {
    // This would typically fetch from database
    // Placeholder implementation
    return [];
  }

  private calculateTotalTimeSpent(events: UserEvent[]): number {
    // Calculate total time spent based on page view events
    const pageViews = events.filter(e => e.eventType === 'page_view');
    return pageViews.reduce((total, event) => total + (event.eventData.timeSpent || 0), 0);
  }

  private calculateStreak(events: UserEvent[]): number {
    // Calculate consecutive days of activity
    const dates = [...new Set(events.map(e => e.timestamp.toDateString()))];
    let streak = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < 30; i++) {
      const dateString = currentDate.toDateString();
      if (dates.includes(dateString)) {
        streak++;
      } else if (streak > 0) {
        break;
      }
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  }

  private isCriticalEvent(eventType: string): boolean {
    return [
      'user_signup',
      'subscription_created',
      'user_churned',
      'payment_failed',
      'support_ticket_created'
    ].includes(eventType);
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private async processEvent(event: UserEvent): Promise<void> {
    // Process immediate actions for critical events
    switch (event.eventType) {
      case 'user_signup':
        await this.triggerWelcomeSequence(event.userId);
        break;
      case 'subscription_created':
        await this.triggerSubscriptionOnboarding(event.userId);
        break;
      case 'user_churned':
        await this.triggerWinBackSequence(event.userId);
        break;
    }
  }

  private async triggerWelcomeSequence(userId: string): Promise<void> {
    // Trigger welcome email sequence
    console.log(`Triggering welcome sequence for user ${userId}`);
  }

  private async triggerSubscriptionOnboarding(userId: string): Promise<void> {
    // Trigger subscription onboarding
    console.log(`Triggering subscription onboarding for user ${userId}`);
  }

  private async triggerWinBackSequence(userId: string): Promise<void> {
    // Trigger win-back campaign
    console.log(`Triggering win-back sequence for user ${userId}`);
  }

  private startEventProcessor(): void {
    this.flushInterval = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flushEvents();
      }
    }, 5000); // Process events every 5 seconds
  }

  private async flushEvents(): Promise<void> {
    const events = [...this.eventQueue];
    this.eventQueue = [];
    
    try {
      // Batch send events to analytics service
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events })
      });
    } catch (error) {
      console.error('Failed to flush events:', error);
      // Re-queue events on failure
      this.eventQueue.unshift(...events);
    }
  }

  // Public method to manually flush events
  public async flush(): Promise<void> {
    if (this.eventQueue.length > 0) {
      await this.flushEvents();
    }
  }

  // Cleanup
  public destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flush(); // Final flush
  }
}