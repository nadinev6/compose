# Email API Routes

This directory contains API routes for email sending and tracking functionality.

## Routes

### POST /api/email/send

Sends an email using a template through Mailgun.

**Authentication:** Required (Bearer token in Authorization header)

**Request Body:**
```json
{
  "templateId": "uuid",
  "recipients": {
    "to": ["email@example.com"],
    "cc": ["cc@example.com"],
    "bcc": ["bcc@example.com"]
  },
  "subject": "Email Subject",
  "customizations": {
    "name": "John Doe",
    "company": "Acme Inc"
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "sendId": "uuid",
  "mailgunMessageId": "<mailgun-id>",
  "message": "Email sent successfully"
}
```

**Response (Error):**
```json
{
  "error": "Error message",
  "details": "Detailed error information",
  "validationErrors": ["Array of validation errors if applicable"]
}
```

**Status Codes:**
- `200` - Email sent successfully
- `400` - Invalid request (missing fields, validation errors)
- `401` - Unauthorized (no valid session)
- `404` - Template not found
- `500` - Server error (Mailgun error, database error)

---

### GET /api/email/tracking

Sends an email using a template through Mailgun.

**Authentication:** Required (Bearer token in Authorization header)

**Request Body:**
```json
{
  "templateId": "uuid",
  "recipients": {
    "to": ["email@example.com"],
    "cc": ["cc@example.com"],
    "bcc": ["bcc@example.com"]
  },
  "subject": "Email Subject",
  "customizations": {
    "name": "John Doe",
    "company": "Acme Inc"
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "sendId": "uuid",
  "mailgunMessageId": "<mailgun-id>",
  "message": "Email sent successfully"
}
```

**Response (Error):**
```json
{
  "error": "Error message",
  "details": "Detailed error information",
  "validationErrors": ["Array of validation errors if applicable"]
}
```

**Status Codes:**
- `200` - Email sent successfully
- `400` - Invalid request (missing fields, validation errors)
- `401` - Unauthorized (no valid session)
- `404` - Template not found
- `500` - Server error (Mailgun error, database error)

**Process Flow:**
1. Validate session token
2. Validate request body
3. Fetch template from database
4. Validate template HTML
5. Apply customizations (if provided)
6. Create email send record (status: pending)
7. Send email through Mailgun
8. Update email send record (status: sent/failed)
9. Return response

**Features:**
- Template validation before sending
- Customization support (replace {{variables}})
- Automatic status tracking
- Mailgun integration with tracking
- Error handling and recovery

## Environment Variables

Required environment variables:

```env
# Mailgun Configuration
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
MAILGUN_API_BASE_URL=https://api.mailgun.net/v3

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Usage Example

```typescript
// Client-side usage
const sendEmail = async (templateId: string, recipients: EmailRecipients, subject: string) => {
  const response = await fetch('/api/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({
      templateId,
      recipients,
      subject,
      customizations: {
        name: 'John Doe',
        company: 'Acme Inc'
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return await response.json();
};
```

## Error Handling

The API handles various error scenarios:

1. **Authentication Errors** (401)
   - No session token
   - Invalid session token
   - Expired session

2. **Validation Errors** (400)
   - Missing required fields
   - Invalid email addresses
   - Template validation failures
   - Empty recipient list

3. **Not Found Errors** (404)
   - Template doesn't exist
   - Template doesn't belong to user

4. **Mailgun Errors** (500)
   - Invalid API key
   - Domain not configured
   - Rate limit exceeded
   - Network errors

5. **Database Errors** (500)
   - Failed to create send record
   - Failed to update send record

## Testing

To test the API route:

1. Ensure Mailgun credentials are configured
2. Create a template in the database
3. Get a valid session token
4. Make a POST request with valid data

```bash
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "templateId": "YOUR_TEMPLATE_ID",
    "recipients": {
      "to": ["test@example.com"]
    },
    "subject": "Test Email"
  }'
```

## Security Considerations

- All requests require authentication
- Users can only send emails using their own templates
- Email addresses are validated before sending
- Template HTML is validated for compatibility
- Rate limiting should be implemented at the infrastructure level
- Mailgun API key is stored securely in environment variables

## Monitoring

Monitor the following:
- Email send success/failure rates
- Mailgun API response times
- Database query performance
- Error rates by type
- Template validation failures

## Future Enhancements

- [ ] Rate limiting per user
- [ ] Scheduled email sending
- [ ] Batch email sending
- [ ] Email preview before sending
- [ ] A/B testing support
- [ ] Unsubscribe link injection
- [ ] Email template versioning


Gets tracking data for email sends with delivery statistics.

**Authentication:** Required (session cookie)

**Query Parameters:**
- `sendIds` (optional) - Comma-separated list of send IDs to track
- `days` (optional) - Number of days for statistics (default: 30)

**Response (Success):**
```json
{
  "success": true,
  "tracking": [
    {
      "sendId": "uuid",
      "status": "sent",
      "events": [
        {
          "event": "delivered",
          "timestamp": 1234567890,
          "recipient": "user@example.com",
          "description": "Email successfully delivered"
        }
      ],
      "lastUpdated": "2025-10-17T12:00:00Z",
      "deliveryRate": 100,
      "openRate": 25,
      "clickRate": 10
    }
  ],
  "stats": {
    "totalSent": 100,
    "delivered": 95,
    "failed": 5,
    "bounced": 0,
    "deliveryRate": 95,
    "recentActivity": []
  },
  "emailSends": []
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `500` - Server error

---

### GET /api/email/status/[sendId]

Gets detailed tracking status for a specific email send.

**Authentication:** Required (session cookie)

**Path Parameters:**
- `sendId` - The email send ID

**Response (Success):**
```json
{
  "success": true,
  "emailSend": {
    "id": "uuid",
    "subject": "Email Subject",
    "status": "sent",
    "recipients": {
      "to": ["user@example.com"]
    },
    "sent_at": "2025-10-17T12:00:00Z"
  },
  "tracking": {
    "sendId": "uuid",
    "status": "sent",
    "events": [],
    "lastUpdated": "2025-10-17T12:00:00Z",
    "deliveryRate": 100
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - Email send not found
- `500` - Server error

---

### POST /api/email/webhook

Mailgun webhook endpoint for real-time email delivery events.

**Authentication:** Mailgun signature verification

**Request Body:** Mailgun webhook event payload

**Response:**
```json
{
  "received": true,
  "event": "delivered",
  "sendId": "uuid"
}
```

**Webhook Configuration:**
1. Set `MAILGUN_WEBHOOK_SIGNING_KEY` in environment variables
2. Configure webhook URL in Mailgun dashboard: `https://your-domain.com/api/email/webhook`
3. Subscribe to events: delivered, failed, complained, unsubscribed

**Status Codes:**
- `200` - Event received and processed
- `401` - Invalid signature

---

## Original Documentation

### POST /api/email/send (Detailed)