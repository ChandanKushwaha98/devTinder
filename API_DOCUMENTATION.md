# DevTinder API Documentation

This document provides information on accessing and using the Swagger API documentation for the DevTinder application.

## Accessing the Documentation

Once the server is running, you can access the interactive API documentation at:

```
http://localhost:7777/api-docs
```

In production:
```
https://devtinderonline.in/api-docs
```

## Features

The Swagger UI provides:

- **Interactive Testing**: Test API endpoints directly from the browser
- **Request/Response Examples**: See example payloads for all endpoints
- **Authentication**: Easily test authenticated endpoints using cookies
- **Schema Definitions**: View detailed data models and validation rules

## API Endpoints Summary

### Authentication
- `POST /signup` - Register a new user
- `POST /login` - Login user
- `POST /logout` - Logout user

### Profile Management
- `GET /profile/view` - View current user profile (requires auth)
- `PATCH /profile/edit` - Update profile (requires auth)
- `PATCH /profile/password` - Change password (requires auth)

### Connection Requests
- `POST /request/send/{status}/{userId}` - Send connection request (requires auth)
- `POST /request/review/{status}/{requestId}` - Accept/reject connection request (requires auth)

### User Discovery & Connections
- `GET /user/requests/received` - Get pending connection requests (requires auth)
- `GET /user/connections` - Get accepted connections (requires auth)
- `GET /feed` - Get user feed with pagination (requires auth)

### Chat
- `GET /chat/{targetUserId}` - Get chat history with a user (requires auth)
- Socket.io events are used for real-time messaging

### Health Check
- `GET /health` - Check server status

## Authentication

Most endpoints require authentication via JWT token stored in an httpOnly cookie. To test authenticated endpoints in Swagger:

1. First call the `/login` endpoint with valid credentials
2. The JWT token will be automatically stored in your browser cookies
3. Subsequent requests will include this cookie automatically
4. Use `/logout` to clear the authentication cookie

## Testing in Swagger UI

1. Navigate to `http://localhost:7777/api-docs`
2. Expand any endpoint to see its details
3. Click "Try it out" button
4. Fill in the required parameters
5. Click "Execute" to make the request
6. View the response below

## Swagger Configuration

The Swagger documentation is configured in:
- `src/config/swagger.js` - Main Swagger configuration
- Route files contain JSDoc comments that define the API specifications

## Adding New Endpoints

When adding new API endpoints, document them using JSDoc comments:

```javascript
/**
 * @swagger
 * /your-endpoint:
 *   get:
 *     summary: Short description
 *     description: Longer description
 *     tags: [TagName]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: paramName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/your-endpoint', ...)
```

## Rate Limiting

Be aware of rate limits when testing:
- General API endpoints: 100 requests per 15 minutes
- Authentication endpoints: 5 requests per 15 minutes

## Need Help?

For more information on using Swagger/OpenAPI:
- [Swagger Documentation](https://swagger.io/docs/)
- [OpenAPI Specification](https://swagger.io/specification/)
