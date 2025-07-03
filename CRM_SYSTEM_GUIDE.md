# 📧 Talkers Internal CRM System

A comprehensive email campaign management and customer relationship system built for Talkers. This system allows you to create, manage, and automate email campaigns with advanced tracking and analytics.

## 🚀 Quick Start

### 1. Setup the CRM System

```bash
# First, ensure your database is running and migrated
npm run db:migrate

# Set up the CRM system with sample data
npm run crm:setup
```

### 2. Add Required Environment Variables

Add these to your `.env.local` file:

```env
# Admin access for CRM operations
ADMIN_EMAIL_KEY=your-super-secret-admin-key

# Automation key for scheduled email processing
AUTOMATION_KEY=your-automation-secret-key

# Resend API (already configured)
RESEND_API_KEY=your-resend-api-key
NEXTAUTH_URL=http://localhost:3000
```

### 3. Access the CRM Dashboard

Visit: `http://localhost:3000/crm`

## 🏗️ System Architecture

### Database Schema

The CRM system adds these new tables to your existing schema:

#### EmailCampaign

- Stores campaign information, targeting, and statistics
- Tracks sent, opened, clicked metrics
- Supports different target types (all users, verified, trial, premium, etc.)

#### EmailCampaignLog

- Individual email send records for each user/campaign
- Tracks delivery status, open/click events
- Stores Resend email IDs for tracking

#### EmailSequence

- Multi-step email sequences within campaigns
- Configurable delays between emails
- Order-based progression through sequences

#### EmailSequenceLog

- Scheduled and sent sequence emails
- Automated follow-up email tracking

#### EmailTemplate

- Reusable email templates with variables
- Different types (Welcome, Follow-up, Trial reminder, etc.)
- HTML and text versions

### Enums

- `CampaignStatus`: DRAFT, SCHEDULED, RUNNING, PAUSED, COMPLETED, CANCELLED
- `CampaignTargetType`: ALL_USERS, VERIFIED_USERS, TRIAL_USERS, PREMIUM_USERS, INACTIVE_USERS, CUSTOM_CRITERIA
- `EmailLogStatus`: PENDING, SENT, DELIVERED, OPENED, CLICKED, BOUNCED, FAILED, UNSUBSCRIBED
- `EmailType`: WELCOME, FOLLOW_UP, TRIAL_REMINDER, UPGRADE_PROMPT, FEATURE_ANNOUNCEMENT, NEWSLETTER, REACTIVATION, CUSTOM

## 📊 Features

### Campaign Management

- **Create Campaigns**: Design email campaigns with custom targeting
- **Launch Campaigns**: Send emails to targeted user segments
- **Track Performance**: Monitor open rates, click rates, delivery success
- **A/B Testing**: Test different email versions (planned feature)

### Email Sequences

- **Multi-step Campaigns**: Create sequences of emails sent over time
- **Automated Follow-ups**: Automatic scheduling of follow-up emails
- **Conditional Logic**: Skip users based on previous interactions (planned)

### Advanced Targeting

- **User Segmentation**: Target by subscription status, trial status, activity level
- **Custom Criteria**: JSON-based custom targeting rules
- **Smart Exclusions**: Automatically exclude bounced/unsubscribed users

### Analytics & Reporting

- **Campaign Performance**: Detailed metrics for each campaign
- **User Engagement**: Track individual user interactions
- **Trend Analysis**: Email sending and user growth trends
- **Top Performers**: Identify most successful campaigns

### Automation

- **Scheduled Processing**: Automatic processing of scheduled sequence emails
- **Smart Delays**: Configure delays between sequence emails
- **Error Handling**: Robust error handling and retry logic

## 🛠️ API Endpoints

### Campaign Management

#### `GET /api/crm/campaigns`

List all email campaigns with pagination and filtering.

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by campaign status
- `type`: Filter by campaign type

#### `POST /api/crm/campaigns`

Create a new email campaign.

**Request Body:**

```json
{
  "name": "Campaign Name",
  "description": "Campaign description",
  "subject": "Email subject with {{variables}}",
  "emailTemplate": {
    "html": "HTML content with {{userName}} variables",
    "text": "Plain text version"
  },
  "targetType": "VERIFIED_USERS",
  "scheduledFor": "2024-01-01T10:00:00Z" // Optional
}
```

#### `POST /api/crm/campaigns/[id]/launch`

Launch a campaign and send emails to all targeted users.

### Templates

#### `GET /api/crm/templates`

List all email templates.

**Query Parameters:**

- `type`: Filter by template type
- `active`: Filter by active status

#### `POST /api/crm/templates`

Create a new email template.

### Analytics

#### `GET /api/crm/analytics`

Get comprehensive analytics data including:

- Campaign statistics
- User growth trends
- Email sending trends
- Top performing campaigns

### Automation

#### `POST /api/crm/automation/process-sequences`

Process scheduled sequence emails (used by automation system).

**Request Body:**

```json
{
  "automationKey": "your-automation-secret-key"
}
```

## 🎯 Email Personalization

### Available Variables

All email templates support these variables:

- `{{userName}}` - User's name or "there"
- `{{userEmail}}` - User's email address
- `{{brandName}}` - "Talkers"
- `{{supportEmail}}` - "support@talkers.pro"
- `{{baseUrl}}` - Your app's base URL
- `{{accountAge}}` - Days since user registered
- `{{subscriptionStatus}}` - User's subscription status

### Example Usage

```html
<h2>Hi {{userName}}! 👋</h2>
<p>Welcome to {{brandName}}! You've been with us for {{accountAge}} days.</p>
<a href="{{baseUrl}}/dashboard">Visit Dashboard</a>
<p>Questions? Contact us at {{supportEmail}}</p>
```

## 🔄 Automation Setup

### Scheduled Email Processing

Set up a cron job or scheduled task to process email sequences:

```bash
# Process every 15 minutes
*/15 * * * * npm run crm:process-sequences

# Or use the API directly
curl -X POST http://localhost:3000/api/crm/automation/process-sequences \
  -H "Content-Type: application/json" \
  -d '{"automationKey":"your-automation-secret-key"}'
```

### Automation Features

1. **Smart Scheduling**: Automatically schedules next emails in sequences
2. **Rate Limiting**: Built-in delays to avoid hitting email service limits
3. **Error Recovery**: Failed emails are logged with detailed error messages
4. **User Protection**: Automatically skips users who have bounced or unsubscribed

## 📈 Dashboard Features

### Main Dashboard

- **Campaign Overview**: Total campaigns, active campaigns, emails sent
- **Performance Metrics**: Average open rates, user statistics
- **Quick Actions**: Create new campaigns, view analytics

### Campaign Management

- **Campaign List**: View all campaigns with status, metrics, and actions
- **Launch Controls**: One-click campaign launching
- **Performance Tracking**: Real-time metrics for each campaign

### Analytics Dashboard

- **Performance Charts**: Visual representation of campaign performance
- **User Growth**: Track user acquisition over time
- **Email Trends**: Monitor email sending patterns

## 🎨 Pre-built Templates

The system comes with several pre-built email templates:

### 1. Follow-up Template

- **Purpose**: Ask users about their experience
- **Variables**: userName, brandName, supportEmail, baseUrl
- **Design**: Beautiful gradient design matching Talkers branding

### 2. Welcome Template

- **Purpose**: Welcome new users
- **Variables**: userName, brandName, baseUrl
- **Design**: Clean, professional welcome email

### 3. Trial Reminder Template

- **Purpose**: Remind users about trial expiration
- **Variables**: userName, brandName, daysLeft, baseUrl
- **Design**: Urgency-focused with clear upgrade CTA

## 🔧 Advanced Configuration

### Custom Targeting

Create custom targeting criteria using JSON:

```json
{
  "createdAt": {
    "gte": "2024-01-01T00:00:00Z"
  },
  "subscriptionStatus": "free",
  "isTrialActive": false
}
```

### Sequence Configuration

Configure email sequences with precise timing:

```json
{
  "sequences": [
    {
      "name": "Initial Follow-up",
      "delayDays": 3,
      "delayHours": 0,
      "subject": "How's it going?",
      "emailTemplate": { ... }
    },
    {
      "name": "Second Follow-up",
      "delayDays": 7,
      "delayHours": 0,
      "subject": "We'd love to hear from you",
      "emailTemplate": { ... }
    }
  ]
}
```

## 🛡️ Security Features

### Authentication

- Admin-only access to CRM dashboard
- API key protection for automation endpoints
- User session validation for all operations

### Data Protection

- No sensitive user data in email logs
- Secure handling of email content
- Audit trail for all campaign actions

### Rate Limiting

- Built-in delays between email sends
- Automatic batching of large campaigns
- Protection against email service rate limits

## 📝 Usage Examples

### 1. Send Welcome Email to New Users

```javascript
// Create welcome campaign
const campaign = await fetch('/api/crm/campaigns', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'New User Welcome',
    subject: 'Welcome to {{brandName}}! 🎉',
    targetType: 'VERIFIED_USERS',
    emailTemplate: {
      html: welcomeTemplateHTML,
      text: welcomeTemplateText
    }
  })
});

// Launch immediately
await fetch(`/api/crm/campaigns/${campaign.id}/launch`, {
  method: 'POST'
});
```

### 2. Create Follow-up Sequence

```javascript
const campaign = await fetch('/api/crm/campaigns', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'User Experience Follow-up',
    subject: 'How has your experience been?',
    targetType: 'TRIAL_USERS',
    emailTemplate: followUpTemplate,
    sequences: [
      {
        name: 'Reminder',
        delayDays: 7,
        subject: 'We\'d still love to hear from you',
        emailTemplate: reminderTemplate
      }
    ]
  })
});
```

### 3. Analyze Campaign Performance

```javascript
const analytics = await fetch('/api/crm/analytics');
const data = await analytics.json();

console.log(`Total emails sent: ${data.stats.totalEmailsSent}`);
console.log(`Average open rate: ${data.stats.averageOpenRate}%`);
console.log(`Top campaign: ${data.topCampaigns[0].name}`);
```

## 🚨 Troubleshooting

### Common Issues

#### TypeScript Errors

If you see Prisma client errors, regenerate the client:

```bash
npx prisma generate
```

#### Email Sending Failures

1. Check Resend API key configuration
2. Verify email templates are valid
3. Check rate limiting settings
4. Review error logs in campaign logs

#### Automation Not Running

1. Verify AUTOMATION_KEY is set
2. Check cron job configuration
3. Review server logs for errors
4. Test manual processing endpoint

### Logs and Monitoring

The system provides detailed logging:

- Campaign launch results
- Individual email send status
- Sequence processing logs
- Error messages with context

## 🔮 Future Enhancements

### Planned Features

- **A/B Testing**: Test different email versions
- **Advanced Analytics**: Conversion tracking, revenue attribution
- **Dynamic Content**: Personalized content blocks
- **Integration APIs**: Connect with external services
- **Email Builder**: Visual email template editor
- **Webhook Support**: Real-time delivery notifications

### Extensibility

The system is designed to be extensible:

- Add new email types and templates
- Implement custom targeting logic
- Integrate with external analytics
- Add custom automation triggers

---

## 🎉 You're All Set!

Your Talkers CRM system is now ready to:

✅ **Track every email interaction**
✅ **Automate follow-up sequences**
✅ **Segment users intelligently**
✅ **Monitor campaign performance**
✅ **Scale email operations**

**Ready to launch your first campaign?**

1. Run `npm run crm:setup` to initialize
2. Visit `/crm` to access the dashboard
3. Create your first campaign
4. Watch the analytics roll in!

Need help? The system includes sample templates and campaigns to get you started immediately. 💜
