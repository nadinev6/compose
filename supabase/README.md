# Database Setup

This directory contains the database schema and migrations for Compose.

## Files

- `migrations/001_initial_schema.sql` - Initial database schema with tables, indexes, and RLS policies
- `seed.sql` - Seed data and utility functions for development

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully initialized
3. Go to Settings > API to get your project URL and API keys

### 2. Configure Environment Variables

Update your `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Run Migrations

You can run the migrations in several ways:

#### Option A: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `migrations/001_initial_schema.sql`
4. Click "Run" to execute the migration

#### Option B: Using Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase in your project
supabase init

# Link to your remote project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

#### Option C: Manual SQL Execution
Connect to your Supabase database using any PostgreSQL client and execute the SQL files manually.

### 4. Verify Setup

After running the migrations, you should see the following tables in your database:
- `templates` - Stores email templates
- `email_sends` - Tracks sent emails
- `template_stats` (view) - Template statistics

### 5. Seed Data (Optional)

To create example templates for testing:

1. Sign up a user through your application
2. Get the user ID from the `auth.users` table
3. Run the seed function:

```sql
SELECT create_example_templates('your-user-id-here');
```

## Database Schema

### Templates Table
- Stores email templates with HTML content
- Includes metadata for template type, images, and generation prompts
- Protected by Row Level Security (RLS)

### Email Sends Table
- Tracks all email sending attempts
- Stores recipient information and delivery status
- Links to templates for analytics

### Security

- **Row Level Security (RLS)** is enabled on all tables
- Users can only access their own data
- All operations are authenticated through Supabase Auth

## Development

### Adding New Migrations

1. Create a new migration file: `migrations/002_your_migration.sql`
2. Include both the migration and rollback SQL
3. Test thoroughly in development before applying to production

### Backup and Recovery

Supabase automatically backs up your database. You can also:
- Export data using the Supabase dashboard
- Use `pg_dump` for manual backups
- Set up automated backups using Supabase's backup features