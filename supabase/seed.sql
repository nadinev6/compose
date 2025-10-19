-- Seed data for development
-- This file contains example templates and data for testing

-- Note: This seed data will only work after users are created through authentication
-- The user_id values below are examples and should be replaced with actual user IDs

-- Example template data (commented out since we need real user IDs)
/*
-- Example marketing email template
INSERT INTO templates (user_id, name, html, subject, metadata) VALUES (
    '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
    'Welcome Email',
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Compose</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px;">
          <tr>
            <td style="padding: 40px 30px;">
              <h1 style="color: #333333; font-family: Arial, sans-serif; font-size: 28px; margin: 0 0 20px 0;">Welcome to Compose!</h1>
              <p style="color: #666666; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for joining Compose, the AI-powered email composition platform. We''re excited to help you create beautiful, professional emails with ease.
              </p>
              <table border="0" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td style="background-color: #2563eb; border-radius: 6px; padding: 12px 24px;">
                    <a href="#" style="color: #ffffff; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none;">Get Started</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
    'Welcome to Compose - Let''s Get Started!',
    '{"templateType": "marketing", "imageUrls": [], "generationPrompt": "Create a welcome email for new users"}'::jsonb
);

-- Example newsletter template
INSERT INTO templates (user_id, name, html, subject, metadata) VALUES (
    '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
    'Monthly Newsletter',
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Monthly Newsletter</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff;">
          <tr>
            <td style="background-color: #1f2937; padding: 20px 30px; text-align: center;">
              <h1 style="color: #ffffff; font-family: Arial, sans-serif; font-size: 24px; margin: 0;">Monthly Update</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #333333; font-family: Arial, sans-serif; font-size: 20px; margin: 0 0 15px 0;">What''s New This Month</h2>
              <p style="color: #666666; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Here are the latest updates and features we''ve been working on to make your email composition experience even better.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
    'Monthly Newsletter - What''s New',
    '{"templateType": "newsletter", "imageUrls": [], "generationPrompt": "Create a monthly newsletter template"}'::jsonb
);
*/

-- Function to create example templates for a user (call this after authentication)
CREATE OR REPLACE FUNCTION create_example_templates(target_user_id UUID)
RETURNS void AS $$
BEGIN
    -- Welcome email template
    INSERT INTO templates (user_id, name, html, subject, metadata) VALUES (
        target_user_id,
        'Welcome Email Template',
        '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px;">
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <h1 style="color: #333333; font-family: Arial, sans-serif; font-size: 28px; margin: 0 0 20px 0;">Welcome!</h1>
              <p style="color: #666666; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Thank you for joining us. We''re excited to have you on board!
              </p>
              <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #2563eb; border-radius: 6px; padding: 12px 24px;">
                    <a href="#" style="color: #ffffff; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none;">Get Started</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
        'Welcome to our platform!',
        '{"templateType": "transactional", "imageUrls": [], "generationPrompt": "Create a welcome email for new users"}'::jsonb
    );

    -- Simple newsletter template
    INSERT INTO templates (user_id, name, html, subject, metadata) VALUES (
        target_user_id,
        'Simple Newsletter',
        '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Newsletter</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff;">
          <tr>
            <td style="background-color: #1f2937; padding: 20px 30px; text-align: center;">
              <h1 style="color: #ffffff; font-family: Arial, sans-serif; font-size: 24px; margin: 0;">Newsletter</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #333333; font-family: Arial, sans-serif; font-size: 20px; margin: 0 0 15px 0;">Latest Updates</h2>
              <p style="color: #666666; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0;">
                Here''s what''s new this month...
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
        'Monthly Newsletter',
        '{"templateType": "newsletter", "imageUrls": [], "generationPrompt": "Create a simple newsletter template"}'::jsonb
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;