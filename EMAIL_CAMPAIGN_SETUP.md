# Follow-up Email Campaign Setup

This guide will help you send beautiful follow-up emails to all your Talkers users asking for feedback about their experience.

## 🚀 Quick Setup

### 1. Add Admin Email Key to Environment

Add this line to your `.env.local` file:

```env
ADMIN_EMAIL_KEY=your-super-secret-admin-key-here
```

Replace `your-super-secret-admin-key-here` with a secure random string.

### 2. Make Sure Resend is Configured

Ensure you have your Resend API key in `.env.local`:

```env
RESEND_API_KEY=your-resend-api-key
NEXTAUTH_URL=http://localhost:3000
```

## 📧 Send Follow-up Emails

Run the following command to send follow-up emails to all verified users:

```bash
npm run email:followup
```

## 📊 What the Email Includes

The email features:

- **Beautiful HTML design** matching your existing Talkers branding
- **Purple/blue gradient** consistent with your brand colors
- **Interactive feedback buttons** with pre-filled email subjects:
  - 😍 Loving it!
  - 👍 Pretty good
  - 🤔 Could be better
  - 😕 Having issues
- **Main CTA button** for detailed feedback
- **Mobile responsive** design
- **Personal tone** asking about their experience
- **Clear value proposition** about how feedback helps

## 🎯 Email Content Preview

**Subject:** "How has your Talkers experience been? 💜"

**From:** Talkers <noreply@talkers.pro>

The email asks users:

- How their experience has been
- What they love about the platform
- What could be improved
- Any suggestions they have
- Optional story sharing

## 🔒 Security Features

- Admin authentication required via `ADMIN_EMAIL_KEY`
- Only sends to email-verified users
- Proper error handling and reporting
- Detailed success/failure logging

## 📈 Campaign Results

After running, you'll see:

- Total users contacted
- Number of emails successfully sent
- Number of failed sends (with reasons)
- List of all recipient email addresses

## 🎨 Email Design Features

The email template includes:

- Animated floating elements
- Gradient backgrounds
- Hover effects on buttons
- Mobile-first responsive design
- Professional typography
- Consistent brand colors
- Clean, modern layout

## 🔄 Alternative Sending Methods

You can also send emails by making a direct API call:

```bash
curl -X POST http://localhost:3000/api/send-followup-email \
  -H "Content-Type: application/json" \
  -d '{"adminKey":"your-super-secret-admin-key-here"}'
```

## 📝 Notes

- Only sends to users with verified email addresses
- Uses your existing Resend configuration
- Each email is personalized with the user's name
- All CTAs lead to pre-filled support emails for easy response
- Campaign runs once - no automatic recurring sends

---

**Ready to get feedback from your users?**

Run `npm run email:followup` and let your users share their Talkers experience! 💜
