# Vasundhara API Documentation

## Overview

The Vasundhara API provides endpoints for managing food waste, user authentication, household management, and AI-powered predictions.

## Base URL

- Development: `http://localhost:5000`
- Production: `https://api.vasundhara.app`

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z"
  },
  "tokens": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

#### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  },
  "tokens": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

#### POST /api/auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

#### GET /api/auth/me
Get current user profile.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "preferences": {
      "notifications": true,
      "alerts": true,
      "gamification": true,
      "language": "en",
      "timezone": "UTC"
    }
  }
}
```

### ML Service Integration

#### POST /api/ml/predict-expiry
Predict food expiry date using AI.

**Request Body:**
```json
{
  "product_name": "Strawberries",
  "category": "berries",
  "purchase_date": "2025-10-15",
  "storage": "fridge",
  "packaging": "clamshell",
  "household_usage_rate_per_week": 0.5,
  "temperature_c": 4
}
```

**Response:**
```json
{
  "predicted_expiry_date": "2025-10-19",
  "confidence": 0.82,
  "spoilage_curve": [
    {"date": "2025-10-16", "prob_spoiled": 0.02},
    {"date": "2025-10-17", "prob_spoiled": 0.06},
    {"date": "2025-10-18", "prob_spoiled": 0.18},
    {"date": "2025-10-19", "prob_spoiled": 0.48},
    {"date": "2025-10-20", "prob_spoiled": 0.74}
  ],
  "factors": {
    "category": "berries",
    "storage_method": "fridge",
    "packaging_type": "clamshell",
    "usage_rate": 0.5,
    "base_shelf_life_days": 7,
    "predicted_shelf_life_days": 4
  },
  "recommendations": [
    "Store in refrigerator to extend shelf life",
    "Use within the next few days or freeze for later use"
  ],
  "model_version": "1.0.0-rule-based",
  "prediction_timestamp": "2023-01-01T00:00:00.000Z"
}
```

## Error Responses

All error responses follow this format:

```json
{
  "error": {
    "message": "Error description",
    "statusCode": 400,
    "timestamp": "2023-01-01T00:00:00.000Z",
    "path": "/api/endpoint"
  }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Rate Limiting

API requests are rate limited to 100 requests per 15 minutes per IP address.

## Pagination

List endpoints support pagination using query parameters:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `sort` - Sort field
- `order` - Sort order (asc/desc)

## Filtering

Many endpoints support filtering using query parameters:

- `status` - Filter by status
- `category` - Filter by category
- `date_from` - Filter from date
- `date_to` - Filter to date

## Examples

### cURL Examples

#### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### Get user profile
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <access-token>"
```

#### Predict expiry
```bash
curl -X POST http://localhost:5000/api/ml/predict-expiry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access-token>" \
  -d '{
    "product_name": "Strawberries",
    "category": "berries",
    "purchase_date": "2025-10-15",
    "storage": "fridge",
    "packaging": "clamshell",
    "household_usage_rate_per_week": 0.5,
    "temperature_c": 4
  }'
```

## SDKs

### JavaScript/TypeScript
```bash
npm install @vasundhara/api-client
```

```typescript
import { VasundharaAPI } from '@vasundhara/api-client';

const api = new VasundharaAPI({
  baseURL: 'https://api.vasundhara.app',
  apiKey: 'your-api-key'
});

// Register user
const user = await api.auth.register({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe'
});

// Predict expiry
const prediction = await api.ml.predictExpiry({
  product_name: 'Strawberries',
  category: 'berries',
  purchase_date: '2025-10-15',
  storage: 'fridge',
  packaging: 'clamshell',
  household_usage_rate_per_week: 0.5,
  temperature_c: 4
});
```

### Python
```bash
pip install vasundhara-api
```

```python
from vasundhara import VasundharaAPI

api = VasundharaAPI(
    base_url='https://api.vasundhara.app',
    api_key='your-api-key'
)

# Register user
user = api.auth.register(
    email='user@example.com',
    password='password123',
    first_name='John',
    last_name='Doe'
)

# Predict expiry
prediction = api.ml.predict_expiry(
    product_name='Strawberries',
    category='berries',
    purchase_date='2025-10-15',
    storage='fridge',
    packaging='clamshell',
    household_usage_rate_per_week=0.5,
    temperature_c=4
)
```

## Support

For API support and questions:
- Email: api-support@vasundhara.app
- Documentation: https://docs.vasundhara.app
- GitHub Issues: https://github.com/vasundhara/issues
