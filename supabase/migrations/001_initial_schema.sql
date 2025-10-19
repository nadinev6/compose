-- Initial database schema for Compose
-- Email template composition and sending platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    html TEXT NOT NULL,
    template_type TEXT DEFAULT 'custom',
    images JSONB DEFAULT '[]'::jsonb,
    generation_prompt TEXT,
    validation_score INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT templates_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT templates_html_not_empty CHECK (length(trim(html)) > 0),
    CONSTRAINT templates_subject_not_empty CHECK (length(trim(subject)) > 0),
    CONSTRAINT templates_name_length CHECK (length(name) <= 255),
    CONSTRAINT templates_validation_score_range CHECK (validation_score >= 0 AND validation_score <= 100)
);

-- Create email_sends table for tracking sent emails
CREATE TABLE IF NOT EXISTS email_sends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    recipients JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    mailgun_message_id TEXT,
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT email_sends_status_valid CHECK (status IN ('pending', 'sent', 'failed')),
    CONSTRAINT email_sends_subject_not_empty CHECK (length(trim(subject)) > 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON templates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_templates_updated_at ON templates(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_sends_user_id ON email_sends(user_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_created_at ON email_sends(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for templates table
CREATE TRIGGER update_templates_updated_at 
    BEFORE UPDATE ON templates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;

-- Templates RLS policies
CREATE POLICY "Users can view their own templates" ON templates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates" ON templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" ON templates
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" ON templates
    FOR DELETE USING (auth.uid() = user_id);

-- Email sends RLS policies
CREATE POLICY "Users can view their own email sends" ON email_sends
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email sends" ON email_sends
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email sends" ON email_sends
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create a view for template statistics
CREATE OR REPLACE VIEW template_stats AS
SELECT 
    t.id,
    t.user_id,
    t.name,
    t.created_at,
    t.updated_at,
    COUNT(es.id) as send_count,
    COUNT(CASE WHEN es.status = 'sent' THEN 1 END) as successful_sends,
    COUNT(CASE WHEN es.status = 'failed' THEN 1 END) as failed_sends,
    MAX(es.sent_at) as last_sent_at
FROM templates t
LEFT JOIN email_sends es ON t.id = es.template_id
GROUP BY t.id, t.user_id, t.name, t.created_at, t.updated_at;

-- Grant access to the view
GRANT SELECT ON template_stats TO authenticated;