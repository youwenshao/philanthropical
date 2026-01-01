# Philanthropical API Documentation

## Base URL

- Production: `https://philanthropical.app/api`
- Development: `http://localhost:3000/api`

## API Versioning

The API supports versioning through URL paths:
- v1 (default): `/api/*`
- v2: `/api/v2/*`

Version is indicated in response headers: `X-API-Version`

## Authentication

Most endpoints are public. Admin endpoints require authentication via wallet signature.

## Rate Limiting

- Public endpoints: 100 requests per minute per IP
- Authenticated endpoints: 1000 requests per minute per user

Rate limit headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time when limit resets

## Endpoints

### Donations

#### GET /api/donations

Get list of donations.

**Query Parameters:**
- `donor` (string, optional): Filter by donor address
- `charity` (string, optional): Filter by charity address
- `limit` (number, optional): Number of results (default: 100, max: 1000)
- `offset` (number, optional): Pagination offset (default: 0)

**Response:**
```json
[
  {
    "id": "uuid",
    "donation_id": "123",
    "donor_address": "0x...",
    "charity_address": "0x...",
    "amount": "1000000000",
    "token_address": "0x...",
    "transaction_hash": "0x...",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### GET /api/v2/donations

Enhanced version with pagination metadata.

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "total": 1000,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  }
}
```

### Charities

#### GET /api/charities

Get list of charities.

**Response:**
```json
[
  {
    "address": "0x...",
    "name": "Charity Name",
    "description": "...",
    "reputation_score": 100,
    "verification_status": "approved"
  }
]
```

### Batch Requests

#### POST /api/batch

Execute multiple API requests in a single call.

**Request Body:**
```json
{
  "requests": [
    {
      "endpoint": "donations",
      "method": "GET",
      "params": {
        "limit": 10
      }
    },
    {
      "endpoint": "charities",
      "method": "GET"
    }
  ]
}
```

**Response:**
```json
{
  "results": [
    { "success": true, "data": [...] },
    { "success": true, "data": [...] }
  ],
  "total": 2,
  "successful": 2,
  "failed": 0
}
```

### Analytics

#### GET /api/analytics

Get analytics data.

**Query Parameters:**
- `start` (string, optional): Start date (ISO 8601)
- `end` (string, optional): End date (ISO 8601)

**Response:**
```json
{
  "totalDonations": 1000,
  "totalAmount": 50000,
  "activeCharities": 50,
  "verificationRate": 85.5,
  "donationsOverTime": [...],
  "charityPerformance": [...],
  "verificationStatus": [...],
  "fraudAlerts": [...]
}
```

### Export

#### GET /api/export

Export data in various formats.

**Query Parameters:**
- `format` (string): `csv` | `json` | `pdf`
- `type` (string): `donations` | `charities` | `verifications`

**Response:** File download

### Health & Metrics

#### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "checks": {
    "database": "healthy",
    "api": "ok"
  }
}
```

#### GET /api/metrics

Application metrics.

**Response:**
```json
{
  "uptime": 3600,
  "memory": {
    "used": 100,
    "total": 512
  },
  "database": {
    "donations": 1000,
    "charities": 50
  }
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "details": {...},
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Status Codes:**
- `200`: Success
- `400`: Bad Request (validation error)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error

## Caching

API responses include cache headers:
- `Cache-Control`: Cache directives
- `ETag`: Entity tag for conditional requests

## Webhooks

(To be implemented)

## SDKs

(To be implemented)

