# Email Service API Documentation

## Base URL
```
http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api
```

## Authentication
All endpoints (except `/api/test`) require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

The token should be generated using the `AUTH_KEY` environment variable.

---

## Test Endpoint

### Test API Health
**GET** `/api/test`

Check if the service is running.

**cURL Example:**
```bash
curl -X GET http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/test
```

**Response:**
```json
{
  "message": "Email Service API is working!"
}
```

---

## Email Management

### Add Single Email
**POST** `/api/emails`

Add a single email address manually.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**cURL Example:**
```bash
curl -X POST http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/emails \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email_address": "user@example.com"
  }'
```

**Request Body:**
```json
{
  "email_address": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Email added successfully",
  "email": {
    "id": 1,
    "email_address": "user@example.com",
    "user_id": 5,
    "source_type": "MANUAL",
    "status": "ACTIVE",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Import Emails from CSV
**POST** `/api/emails/import/csv`

Import multiple emails from a CSV file.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**cURL Example:**
```bash
curl -X POST http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/emails/import/csv \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/emails.csv" \
  -F "groupId=1"
```

**Request Body (form-data):**
- `file`: CSV file (required)
- `groupId`: Optional group ID to add emails to

**CSV Format:**
The CSV file should have an `email`, `Email`, or `EMAIL` column.

**Response:**
```json
{
  "message": "Emails imported successfully",
  "imported_count": 50,
  "errors": [],
  "total_processed": 50
}
```

---

### Import Emails from Excel
**POST** `/api/emails/import/excel`

Import multiple emails from an Excel file (.xlsx or .xls).

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**cURL Example:**
```bash
curl -X POST http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/emails/import/excel \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/emails.xlsx" \
  -F "groupId=1"
```

**Request Body (form-data):**
- `file`: Excel file (required)
- `groupId`: Optional group ID to add emails to

**Excel Format:**
The Excel file should have an `email`, `Email`, or `EMAIL` column.

**Response:**
```json
{
  "message": "Emails imported successfully",
  "imported_count": 50,
  "errors": [],
  "total_processed": 50
}
```

---

### Import Emails from TownTicks Followers
**POST** `/api/emails/import/townticks`

Import emails from TownTicks followers.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**cURL Example:**
```bash
curl -X POST http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/emails/import/townticks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": 1
  }'
```

**Request Body:**
```json
{
  "groupId": 1
}
```

**Response:**
```json
{
  "message": "Followers imported successfully",
  "imported_count": 25
}
```

---

### Get All Emails
**GET** `/api/emails`

Retrieve all emails for the authenticated user with pagination.

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `source_type`: Filter by source type (MANUAL, CSV, EXCEL, TOWNTICKS) - optional
- `status`: Filter by status (ACTIVE, UNSUBSCRIBED) - optional
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)

**cURL Examples:**
```bash
# Get all emails (default pagination)
curl -X GET http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/emails \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get emails with filters and pagination
curl -X GET "http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/emails?page=1&limit=50&status=ACTIVE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "message": "Emails retrieved successfully",
  "emails": [
    {
      "id": 1,
      "email_address": "user@example.com",
      "source_type": "MANUAL",
      "status": "ACTIVE",
      "created_at": "2024-01-01T00:00:00.000Z",
      "groups": [
        {
          "id": 1,
          "name": "Newsletter Subscribers"
        }
      ]
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "pages": 2
  }
}
```

---

### Update Email Status
**PUT** `/api/emails/:id/status`

Update the status of an email (e.g., unsubscribe).

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**cURL Example:**
```bash
curl -X PUT http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/emails/1/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "UNSUBSCRIBED"
  }'
```

**Request Body:**
```json
{
  "status": "UNSUBSCRIBED"
}
```

**Response:**
```json
{
  "message": "Email status updated successfully",
  "email": {
    "id": 1,
    "email_address": "user@example.com",
    "status": "UNSUBSCRIBED",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Delete Email
**DELETE** `/api/emails/:id`

Delete an email address.

**Headers:**
- `Authorization: Bearer <token>`

**cURL Example:**
```bash
curl -X DELETE http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/emails/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "message": "Email deleted successfully"
}
```

---

### Get Email Statistics
**GET** `/api/emails/stats/overview`

Get statistics about emails for the authenticated user.

**Headers:**
- `Authorization: Bearer <token>`

**cURL Example:**
```bash
curl -X GET http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/emails/stats/overview \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "message": "Email statistics retrieved successfully",
  "stats": {
    "total_emails": 500,
    "active_emails": 450,
    "unsubscribed_emails": 50,
    "breakdown": [
      {
        "source_type": "MANUAL",
        "status": "ACTIVE",
        "count": 100
      },
      {
        "source_type": "CSV",
        "status": "ACTIVE",
        "count": 350
      }
    ]
  }
}
```

---

## Email Groups

### Create Email Group
**POST** `/api/email-groups`

Create a new email group.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**cURL Example:**
```bash
curl -X POST http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/email-groups \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Newsletter Subscribers",
    "description": "Users subscribed to our newsletter"
  }'
```

**Request Body:**
```json
{
  "name": "Newsletter Subscribers",
  "description": "Users subscribed to our newsletter"
}
```

**Response:**
```json
{
  "message": "Email group created successfully",
  "group": {
    "id": 1,
    "name": "Newsletter Subscribers",
    "description": "Users subscribed to our newsletter",
    "user_id": 5,
    "total_emails": 0,
    "status": "ACTIVE",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Get All Email Groups
**GET** `/api/email-groups`

Retrieve all email groups for the authenticated user.

**Headers:**
- `Authorization: Bearer <token>`

**cURL Example:**
```bash
curl -X GET http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/email-groups \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "message": "Email groups retrieved successfully",
  "groups": [
    {
      "id": 1,
      "name": "Newsletter Subscribers",
      "description": "Users subscribed to our newsletter",
      "total_emails": 50,
      "status": "ACTIVE",
      "created_at": "2024-01-01T00:00:00.000Z",
      "emails": [
        {
          "id": 1,
          "email_address": "user@example.com",
          "source_type": "MANUAL",
          "status": "ACTIVE"
        }
      ]
    }
  ]
}
```

---

### Get Single Email Group
**GET** `/api/email-groups/:id`

Retrieve a specific email group with all its emails.

**Headers:**
- `Authorization: Bearer <token>`

**cURL Example:**
```bash
curl -X GET http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/email-groups/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "message": "Email group retrieved successfully",
  "group": {
    "id": 1,
    "name": "Newsletter Subscribers",
    "description": "Users subscribed to our newsletter",
    "total_emails": 50,
    "status": "ACTIVE",
    "created_at": "2024-01-01T00:00:00.000Z",
    "emails": [
      {
        "id": 1,
        "email_address": "user@example.com",
        "source_type": "MANUAL",
        "status": "ACTIVE",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### Update Email Group
**PUT** `/api/email-groups/:id`

Update an email group.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**cURL Example:**
```bash
curl -X PUT http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/email-groups/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Group Name",
    "description": "Updated description",
    "status": "ACTIVE"
  }'
```

**Request Body:**
```json
{
  "name": "Updated Group Name",
  "description": "Updated description",
  "status": "ACTIVE"
}
```

**Response:**
```json
{
  "message": "Email group updated successfully",
  "group": {
    "id": 1,
    "name": "Updated Group Name",
    "description": "Updated description",
    "status": "ACTIVE",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Delete Email Group
**DELETE** `/api/email-groups/:id`

Delete an email group (removes all group memberships but not the emails themselves).

**Headers:**
- `Authorization: Bearer <token>`

**cURL Example:**
```bash
curl -X DELETE http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/email-groups/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "message": "Email group deleted successfully"
}
```

---

### Add Email to Group
**POST** `/api/email-groups/:groupId/emails/:emailId`

Add an email to a specific group.

**Headers:**
- `Authorization: Bearer <token>`

**cURL Example:**
```bash
curl -X POST http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/email-groups/1/emails/5 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "message": "Email added to group successfully"
}
```

---

### Remove Email from Group
**DELETE** `/api/email-groups/:groupId/emails/:emailId`

Remove an email from a specific group.

**Headers:**
- `Authorization: Bearer <token>`

**cURL Example:**
```bash
curl -X DELETE http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/email-groups/1/emails/5 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "message": "Email removed from group successfully"
}
```

---

### Get Group Statistics
**GET** `/api/email-groups/stats/overview`

Get statistics about email groups for the authenticated user.

**Headers:**
- `Authorization: Bearer <token>`

**cURL Example:**
```bash
curl -X GET http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/email-groups/stats/overview \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "message": "Group statistics retrieved successfully",
  "stats": {
    "total_groups": 5,
    "total_emails": 500,
    "active_groups": 4,
    "groups": [
      {
        "id": 1,
        "name": "Newsletter Subscribers",
        "total_emails": 200,
        "status": "ACTIVE",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

## Email Campaigns

### Create Email Campaign
**POST** `/api/campaigns`

Create a new email campaign.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**cURL Example:**
```bash
curl -X POST http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/campaigns \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Welcome to Our Newsletter",
    "content": "<h1>Welcome!</h1><p>Thank you for subscribing.</p>",
    "email_group_id": 1,
    "scheduled_at": "2024-01-15T10:00:00.000Z"
  }'
```

**Request Body:**
```json
{
  "subject": "Welcome to Our Newsletter",
  "content": "<h1>Welcome!</h1><p>Thank you for subscribing.</p>",
  "email_group_id": 1,
  "scheduled_at": "2024-01-15T10:00:00.000Z"
}
```

**Note:** `scheduled_at` is optional. If provided, campaign status will be `SCHEDULED`, otherwise `DRAFT`.

**Response:**
```json
{
  "message": "Email campaign created successfully",
  "campaign": {
    "id": 1,
    "subject": "Welcome to Our Newsletter",
    "content": "<h1>Welcome!</h1><p>Thank you for subscribing.</p>",
    "user_id": 5,
    "email_group_id": 1,
    "status": "DRAFT",
    "total_recipients": 50,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Get All Campaigns
**GET** `/api/campaigns`

Retrieve all email campaigns for the authenticated user.

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: Filter by status (DRAFT, SCHEDULED, SENT, FAILED) - optional

**cURL Examples:**
```bash
# Get all campaigns
curl -X GET http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/campaigns \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get campaigns filtered by status
curl -X GET "http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/campaigns?status=SENT" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "message": "Campaigns retrieved successfully",
  "campaigns": [
    {
      "id": 1,
      "subject": "Welcome to Our Newsletter",
      "status": "DRAFT",
      "total_recipients": 50,
      "sent_count": 0,
      "failed_count": 0,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Get Single Campaign
**GET** `/api/campaigns/:id`

Retrieve a specific email campaign.

**Headers:**
- `Authorization: Bearer <token>`

**cURL Example:**
```bash
curl -X GET http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/campaigns/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "message": "Campaign retrieved successfully",
  "campaign": {
    "id": 1,
    "subject": "Welcome to Our Newsletter",
    "content": "<h1>Welcome!</h1><p>Thank you for subscribing.</p>",
    "status": "DRAFT",
    "total_recipients": 50,
    "sent_count": 0,
    "failed_count": 0,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Update Campaign
**PUT** `/api/campaigns/:id`

Update an email campaign.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**cURL Example:**
```bash
curl -X PUT http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/campaigns/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Updated Subject",
    "content": "<h1>Updated Content</h1>",
    "scheduled_at": "2024-01-15T10:00:00.000Z"
  }'
```

**Request Body:**
```json
{
  "subject": "Updated Subject",
  "content": "<h1>Updated Content</h1>",
  "scheduled_at": "2024-01-15T10:00:00.000Z"
}
```

**Response:**
```json
{
  "message": "Campaign updated successfully",
  "campaign": {
    "id": 1,
    "subject": "Updated Subject",
    "content": "<h1>Updated Content</h1>",
    "status": "SCHEDULED",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Send Campaign
**POST** `/api/campaigns/:id/send`

Send an email campaign to all recipients in the associated email group.

**Headers:**
- `Authorization: Bearer <token>`

**cURL Example:**
```bash
curl -X POST http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/campaigns/1/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "message": "Campaign sent successfully",
  "campaign": {
    "id": 1,
    "status": "SENT",
    "sent_count": 45,
    "failed_count": 5,
    "sent_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Delete Campaign
**DELETE** `/api/campaigns/:id`

Delete an email campaign.

**Headers:**
- `Authorization: Bearer <token>`

**cURL Example:**
```bash
curl -X DELETE http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/campaigns/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "message": "Campaign deleted successfully"
}
```

---

### Get Campaign Analytics
**GET** `/api/campaigns/:id/analytics`

Get analytics for a specific campaign.

**Headers:**
- `Authorization: Bearer <token>`

**cURL Example:**
```bash
curl -X GET http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/campaigns/1/analytics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "message": "Campaign analytics retrieved successfully",
  "analytics": {
    "campaign_id": 1,
    "subject": "Welcome to Our Newsletter",
    "total_recipients": 50,
    "sent_count": 45,
    "failed_count": 5,
    "open_rate": 0.0,
    "click_rate": 0.0,
    "status": "SENT",
    "sent_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "errors": [
    {
      "msg": "Email address is required",
      "param": "email_address",
      "location": "body"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "message": "Email not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error adding email"
}
```

---

## Environment Variables

The following environment variables are required for the service:

### Database
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_DATABASE`: Database name
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `DB_DIALECT`: Database dialect (postgres, mysql, etc.)

### Authentication
- `AUTH_KEY`: JWT secret key for token verification

### SMTP Configuration
- `SMTP_HOST`: SMTP server host (e.g., smtp.gmail.com)
- `SMTP_PORT`: SMTP server port (e.g., 587)
- `SMTP_SECURE`: Use secure connection (true/false)
- `SMTP_USER`: SMTP username
- `SMTP_PASS`: SMTP password
- `FROM_EMAIL`: Default from email address
- `REPLY_TO_EMAIL`: Default reply-to email address

### Rate Limiting
- `MAX_EMAILS_PER_HOUR`: Maximum emails per hour (default: 100)
- `MAX_EMAILS_PER_DAY`: Maximum emails per day (default: 1000)

### Application
- `PORT`: Application port (default: 3000)
- `NODE_ENV`: Environment (production, development)

---

## Notes

1. **File Upload Limits**: CSV and Excel file uploads are limited to 5MB.
2. **Email Validation**: All email addresses are validated using a standard email regex pattern.
3. **Rate Limiting**: Email sending is rate-limited based on `MAX_EMAILS_PER_HOUR` and `MAX_EMAILS_PER_DAY`.
4. **Authentication**: All endpoints require a valid JWT token except `/api/test`.
5. **Pagination**: List endpoints support pagination with `page` and `limit` query parameters.

---

## Troubleshooting

### JWT Signature Mismatch Error

If you're receiving a "JWT signature mismatch" error, it means the `AUTH_KEY` used to verify tokens doesn't match the key used to sign the tokens.

**Common Causes:**
1. **Different AUTH_KEY values**: The `AUTH_KEY` in this service's `.env` file must match the key used to sign tokens in your authentication service.
2. **Missing AUTH_KEY**: The `AUTH_KEY` environment variable is not set in your `.env` file or Docker container.
3. **Key name mismatch**: Your authentication service might be using a different environment variable name (e.g., `JWT_SECRET_KEY`) to sign tokens.

**Solutions:**
1. **Verify AUTH_KEY in .env**: Ensure your `.env` file on the server has the `AUTH_KEY` variable set:
   ```bash
   AUTH_KEY=your_actual_secret_key_here
   ```
2. **Match with authentication service**: The `AUTH_KEY` in this service must be identical to the key used to sign tokens in your main authentication service.
3. **Check Docker logs**: After deployment, check the container logs to verify AUTH_KEY is loaded:
   ```bash
   docker logs email-service
   ```
   You should see: `AUTH_KEY configured: Yes (length: XX)`
4. **Restart containers**: After updating `.env`, restart the containers:
   ```bash
   docker-compose down
   docker-compose up -d
   ```
5. **Verify environment variable**: SSH into the server and check if AUTH_KEY is in the `.env` file:
   ```bash
   ssh -i "E:\aws-services-stage.pem" ubuntu@ec2-3-96-139-52.ca-central-1.compute.amazonaws.com
   cd /home/ubuntu/email-service
   grep AUTH_KEY .env
   ```

**Important**: The `AUTH_KEY` must be the same value across all services that need to verify the same JWT tokens.

