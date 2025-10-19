# Compose - Setup & Testing Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Add Tambo API Key
Edit `.env.local` and add your Tambo AI API key:
```env
NEXT_PUBLIC_TAMBO_API_KEY=your_tambo_api_key_here
```

**Note**: Supabase and Mailgun are already configured!

### Step 3: Run Database Migration
The database schema is in `supabase/migrations/001_initial_schema.sql`

Apply it through:
- Supabase Dashboard → SQL Editor → Paste and run the migration
- OR use Supabase CLI: `supabase db push`

### Step 4: Start the Application
```bash
npm run dev
```

### Step 5: Open Browser
Navigate to: **http://localhost:3000**

## ✅ Testing the Application

### 1. Authentication Flow
1. Go to http://localhost:3000
2. You'll be redirected to `/login`
3. Click "Continue with Google" or "Continue with GitHub"
4. Authorize the application
5. You'll be redirected back to the main page

### 2. Compose Email with AI
1. You'll start in the "Compose" tab
2. Type a message to the AI (e.g., "Create a welcome email for new customers")
3. AI will generate an email template
4. The app automatically switches to the "Editor" tab

### 3. Edit Template
1. In the "Editor" tab, you can:
   - View the visual preview
   - Switch to "HTML Code" tab to edit directly
   - See validation score (0-100)
   - Save changes
2. Click "Continue to Send" when ready

### 4. Send Email
1. In the "Send" tab:
   - Enter recipient email addresses
   - Add CC/BCC if needed
   - Preview the email
   - Click "Send Email"
2. After sending, you'll be redirected to "Tracking"

### 5. Track Delivery
1. In the "Tracking" tab:
   - View all sent emails
   - See delivery status
   - Click on an email to expand details
   - View delivery events timeline
   - Auto-refreshes every 30 seconds

## 📋 Pre-Configured Services

### Supabase (Database & Auth)
- **URL**: https://wiogzpkmqybkajogauyl.supabase.co
- **Status**: ✅ Already configured
- **OAuth Providers**: Google, GitHub (configure in Supabase dashboard)

### Mailgun (Email Sending)
- **Domain**: sandboxfd4b7c67e96343dc8a6c299c7746456e.mailgun.org
- **Status**: ✅ Already configured
- **Note**: Sandbox domain - can only send to authorized recipients

### Tambo AI (AI Composition)
- **Status**: ⚠️ Requires your API key
- **Get Key**: https://tambo.ai/
- **Add to**: `.env.local`

## 🏗️ Application Structure

### Main Views
1. **Compose** - Chat with AI to generate emails
2. **Editor** - Edit HTML with live preview
3. **Send** - Send emails with recipient management
4. **Tracking** - Monitor delivery and engagement

### Key Features
- ✅ OAuth authentication (Google, GitHub)
- ✅ AI-powered email generation
- ✅ Visual HTML editor with validation
- ✅ Email compatibility scoring (0-100)
- ✅ Professional email sending via Mailgun
- ✅ Real-time delivery tracking
- ✅ Template management
- ✅ Responsive design

## 🔧 Configuration Details

### Environment Variables (.env.local)
```env
# Tambo AI - ADD YOUR KEY HERE
NEXT_PUBLIC_TAMBO_API_KEY=your_key_here

# Supabase - Already configured
NEXT_PUBLIC_SUPABASE_URL=https://wiogzpkmqybkajogauyl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Mailgun - Already configured
MAILGUN_API_KEY=a936882b68ae361bca927f339968f864
MAILGUN_DOMAIN=sandboxfd4b7c67e96343dc8a6c299c7746456e.mailgun.org
MAILGUN_API_BASE_URL=https://api.mailgun.net/v3
```

### Database Tables
- `templates` - Email templates with metadata
- `email_sends` - Send records with tracking
- `template_stats` - Statistics view

## 🚨 Troubleshooting

### "Tambo API key not configured"
- Add `NEXT_PUBLIC_TAMBO_API_KEY` to `.env.local`
- Restart the dev server

### "Unauthorized" on login
- Configure OAuth providers in Supabase dashboard
- Add redirect URLs: `http://localhost:3000/auth/callback`

### Email sending fails
- Mailgun sandbox can only send to authorized recipients
- Add recipient email in Mailgun dashboard
- Or upgrade to a verified domain

### Database errors
- Run the migration in `supabase/migrations/001_initial_schema.sql`
- Check Supabase project is active

## 📱 Testing Checklist

- [ ] Login with OAuth works
- [ ] Can access main page after login
- [ ] Compose tab loads Tambo AI interface
- [ ] Can generate email template with AI
- [ ] Editor tab shows template
- [ ] Can edit HTML and see preview
- [ ] Validation score displays
- [ ] Can navigate to Send tab
- [ ] Can enter recipients
- [ ] Can send email (to authorized recipient)
- [ ] Tracking tab shows sent emails
- [ ] Can view delivery status

## 🎯 Next Steps

1. **Configure OAuth Providers**
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable Google and/or GitHub
   - Add redirect URL: `http://localhost:3000/auth/callback`

2. **Add Authorized Recipients** (for Mailgun sandbox)
   - Go to Mailgun Dashboard → Sending → Authorized Recipients
   - Add your test email addresses

3. **Get Tambo API Key**
   - Visit https://tambo.ai/
   - Sign up and get your API key
   - Add to `.env.local`

4. **Test the Full Workflow**
   - Login → Compose → Edit → Send → Track

## 📚 Additional Resources

- **API Documentation**: `app/api/email/README.md`
- **Tambo Integration Rules**: `.kiro/steering/tambo-rules.md`
- **Component Documentation**: Check README files in component directories

## 🆘 Need Help?

1. Check browser console for errors
2. Check terminal for server errors
3. Review the troubleshooting section above
4. Check Supabase logs in dashboard
5. Check Mailgun logs in dashboard

---

**Ready to test!** Start with `npm run dev` and navigate to http://localhost:3000
