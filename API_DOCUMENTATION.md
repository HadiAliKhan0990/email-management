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

Campaigns support two sending modes:
- **GROUP** — Send to all active emails in an email group (bulk send)
- **SINGLE** — Send to one individual recipient (not grouped with others)

You must provide **either** `email_group_id` (for group send) **or** `recipient_email_address` (for single send), but **not both**.

---

### Create Email Campaign — Group Send
**POST** `/api/campaigns`

Create a campaign that targets an entire email group.

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

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subject` | string | Yes | Email subject line (1–255 chars) |
| `content` | string | Yes | Email body (HTML supported) |
| `email_group_id` | integer | Yes (for group) | ID of the email group to send to |
| `scheduled_at` | ISO 8601 date | No | Schedule for future send; must be in the future. If omitted, status is `DRAFT` |

**Response:**
```json
{
  "message": "Email campaign created successfully",
  "campaign": {
    "id": 1,
    "subject": "Welcome to Our Newsletter",
    "content": "<h1>Welcome!</h1><p>Thank you for subscribing.</p>",
    "user_id": 5,
    "send_type": "GROUP",
    "email_group_id": 1,
    "recipient_email_id": null,
    "status": "DRAFT",
    "total_recipients": 50,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Create Email Campaign — Single Recipient
**POST** `/api/campaigns`

Create a campaign that sends to a single recipient. Just provide the email address directly — no group ID or email ID needed. If the email address doesn't already exist in the system, it will be auto-created.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**cURL Example:**
```bash
curl -X POST http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/campaigns \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Your Invoice #1234",
    "content": "<p>Hi, please find your invoice attached.</p>",
    "recipient_email_address": "john@example.com"
  }'
```

**Request Body:**
```json
{
  "subject": "Your Invoice #1234",
  "content": "<p>Hi, please find your invoice attached.</p>",
  "recipient_email_address": "john@example.com"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subject` | string | Yes | Email subject line (1–255 chars) |
| `content` | string | Yes | Email body (HTML supported) |
| `recipient_email_address` | string (email) | Yes (for single) | The recipient's email address |
| `scheduled_at` | ISO 8601 date | No | Schedule for future send |

**Response:**
```json
{
  "message": "Email campaign created successfully",
  "campaign": {
    "id": 2,
    "subject": "Your Invoice #1234",
    "content": "<p>Hi, please find your invoice attached.</p>",
    "user_id": 5,
    "send_type": "SINGLE",
    "email_group_id": null,
    "recipient_email_id": 42,
    "status": "DRAFT",
    "total_recipients": 1,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Create Campaign — Validation Rules

You must provide **exactly one** of the following:

| Option | Field to provide | What it does |
|--------|-----------------|--------------|
| Group send | `email_group_id` | Sends to all active emails in the group |
| Single send | `recipient_email_address` | Sends to that one email address only |

**Error if both are provided:**
```json
{
  "errors": [
    {
      "msg": "Provide either email_group_id or recipient_email_address, not both"
    }
  ]
}
```

**Error if neither is provided:**
```json
{
  "errors": [
    {
      "msg": "Either email_group_id (for group send) or recipient_email_address (for single send) is required"
    }
  ]
}
```

---

### Get All Campaigns
**GET** `/api/campaigns`

Retrieve all email campaigns for the authenticated user. Response includes `send_type` and the associated group or single recipient info.

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: Filter by status (DRAFT, SCHEDULED, SENDING, SENT, FAILED) - optional
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**cURL Examples:**
```bash
# Get all campaigns
curl -X GET http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/campaigns \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get campaigns filtered by status
curl -X GET "http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/campaigns?status=SENT" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (Group campaign):**
```json
{
  "message": "Campaigns retrieved successfully",
  "campaigns": [
    {
      "id": 1,
      "subject": "Welcome to Our Newsletter",
      "send_type": "GROUP",
      "status": "DRAFT",
      "total_recipients": 50,
      "sent_count": 0,
      "failed_count": 0,
      "email_group_id": 1,
      "recipient_email_id": null,
      "group": {
        "id": 1,
        "name": "Newsletter Subscribers"
      },
      "recipientEmail": null,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

**Response (Single recipient campaign):**
```json
{
  "message": "Campaigns retrieved successfully",
  "campaigns": [
    {
      "id": 2,
      "subject": "Your Invoice #1234",
      "send_type": "SINGLE",
      "status": "DRAFT",
      "total_recipients": 1,
      "sent_count": 0,
      "failed_count": 0,
      "email_group_id": null,
      "recipient_email_id": 42,
      "group": null,
      "recipientEmail": {
        "id": 42,
        "email_address": "john@example.com"
      },
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

---

### Get Single Campaign
**GET** `/api/campaigns/:id`

Retrieve a specific email campaign with full details.

**Headers:**
- `Authorization: Bearer <token>`

**cURL Example:**
```bash
curl -X GET http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/campaigns/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (Group campaign):**
```json
{
  "message": "Campaign retrieved successfully",
  "campaign": {
    "id": 1,
    "subject": "Welcome to Our Newsletter",
    "content": "<h1>Welcome!</h1><p>Thank you for subscribing.</p>",
    "send_type": "GROUP",
    "status": "SENT",
    "total_recipients": 50,
    "sent_count": 45,
    "failed_count": 5,
    "email_group_id": 1,
    "recipient_email_id": null,
    "group": {
      "id": 1,
      "name": "Newsletter Subscribers",
      "total_emails": 50
    },
    "recipientEmail": null,
    "logs": [
      {
        "status": "SENT",
        "sent_at": "2024-01-01T00:00:00.000Z",
        "delivered_at": null,
        "opened_at": null,
        "error_message": null,
        "email": {
          "email_address": "user@example.com"
        }
      }
    ],
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Single recipient campaign):**
```json
{
  "message": "Campaign retrieved successfully",
  "campaign": {
    "id": 2,
    "subject": "Your Invoice #1234",
    "content": "<p>Hi, please find your invoice attached.</p>",
    "send_type": "SINGLE",
    "status": "SENT",
    "total_recipients": 1,
    "sent_count": 1,
    "failed_count": 0,
    "email_group_id": null,
    "recipient_email_id": 42,
    "group": null,
    "recipientEmail": {
      "id": 42,
      "email_address": "john@example.com"
    },
    "logs": [
      {
        "status": "SENT",
        "sent_at": "2024-01-01T00:00:00.000Z",
        "delivered_at": null,
        "opened_at": null,
        "error_message": null,
        "email": {
          "email_address": "john@example.com"
        }
      }
    ],
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Update Campaign
**PUT** `/api/campaigns/:id`

Update an email campaign. Cannot update campaigns that have already been sent.

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

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subject` | string | No | Updated subject line |
| `content` | string | No | Updated email body |
| `scheduled_at` | ISO 8601 date | No | Updated schedule time |
| `status` | string | No | One of: DRAFT, SCHEDULED, SENDING, SENT, FAILED |

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

Send an email campaign. Works for both **GROUP** and **SINGLE** campaigns:
- **GROUP**: Sends individual emails to every active email in the associated group.
- **SINGLE**: Sends one email to the single recipient only — not in any group or CC list.

**Headers:**
- `Authorization: Bearer <token>`

**cURL Example:**
```bash
curl -X POST http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006/api/campaigns/1/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (Group send):**
```json
{
  "message": "Campaign sent successfully to group",
  "campaign": {
    "id": 1,
    "send_type": "GROUP",
    "sent_count": 45,
    "failed_count": 5,
    "total_recipients": 50
  }
}
```

**Response (Single send):**
```json
{
  "message": "Email sent successfully to single recipient",
  "campaign": {
    "id": 2,
    "send_type": "SINGLE",
    "sent_count": 1,
    "failed_count": 0,
    "total_recipients": 1
  }
}
```

**Error — Campaign already sent:**
```json
{
  "message": "Campaign already sent"
}
```

**Error — Single recipient not found:**
```json
{
  "message": "Single recipient email not found or has been deleted"
}
```

**Error — Group has no active recipients:**
```json
{
  "message": "Email group has no active recipients"
}
```

---

### Delete Campaign
**DELETE** `/api/campaigns/:id`

Delete an email campaign. Cannot delete campaigns that have already been sent.

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

Get analytics for a specific campaign (works for both GROUP and SINGLE campaigns).

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
    "total_recipients": 50,
    "sent_count": 45,
    "failed_count": 5,
    "delivery_rate": "90.00",
    "open_count": 20,
    "click_count": 10,
    "bounce_count": 2
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
6. **Single vs Group Send**: Campaigns support two modes — `SINGLE` (one recipient) and `GROUP` (all active emails in a group). When sending to a single recipient, the email is delivered individually and is never grouped with other recipients. Provide `email_group_id` for group send, or `recipient_email_address` for single send.
7. **Auto-Create on Single Send**: When using `recipient_email_address` for a single send, if the email address doesn't already exist in the system, it will be automatically created as a MANUAL source with ACTIVE status.

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

