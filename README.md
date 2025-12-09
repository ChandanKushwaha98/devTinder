# DevTinder

A production-ready dating application backend built with Node.js, Express, and MongoDB.

## Features

- User authentication (signup, login, logout)
- Profile management
- Connection requests (interested, ignored, accepted, rejected)
- User feed with pagination
- Password change functionality
- Secure JWT-based authentication
- Rate limiting for API protection
- Production-ready security features

## Tech Stack

- **Node.js** - Runtime environment
- **Express v5** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **morgan** - Request logging
- **compression** - Response compression
- **Custom sanitization middleware** - NoSQL injection prevention (Express v5 compatible)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd devTinder
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your configuration

```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
PORT=7777
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:5173
COOKIE_MAX_AGE=86400000
```

**Important:** Generate a secure JWT secret for production:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Running the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

or with NODE_ENV set:
```bash
npm run prod
```

## API Endpoints

### Authentication
- `POST /signup` - Register a new user (rate limited: 5 requests per 15 minutes)
- `POST /login` - Login user (rate limited: 5 requests per 15 minutes)
- `POST /logout` - Logout user

### Profile
- `GET /profile/view` - View current user profile (authenticated)
- `PATCH /profile/edit` - Update profile (authenticated)
- `PATCH /profile/password` - Change password (authenticated)

### Connection Requests
- `POST /request/send/:status/:userId` - Send connection request (authenticated)
  - status: `interested` or `ignored`
- `POST /request/review/:status/:requestId` - Review connection request (authenticated)
  - status: `accepted` or `rejected`

### User Routes
- `GET /user/requests/received` - Get pending connection requests (authenticated)
- `GET /user/connections` - Get accepted connections (authenticated)
- `GET /feed` - Get user feed with pagination (authenticated)
  - Query params: `page` (default: 1), `limit` (default: 10)

### Health Check
- `GET /health` - Check server status

## Security Features

### Implemented Security Measures

1. **Helmet** - Sets secure HTTP headers
2. **Rate Limiting** - Prevents brute force attacks
   - General API: 100 requests per 15 minutes
   - Auth endpoints: 5 requests per 15 minutes
3. **CORS** - Configured for specific frontend origin
4. **NoSQL Injection Prevention** - Sanitizes user input
5. **Secure Cookies** - httpOnly, secure (in production), sameSite
6. **Password Hashing** - bcrypt with salt rounds
7. **JWT Authentication** - Secure token-based auth
8. **Input Validation** - Strong password requirements
9. **Request Body Size Limiting** - Max 10kb
10. **Compression** - Gzip compression for responses
11. **Request Logging** - Morgan for request tracking
12. **Graceful Shutdown** - Proper cleanup on process termination

### Production Checklist

Before deploying to production:

- [ ] Update `JWT_SECRET` with a strong random key
- [ ] Update `MONGODB_URI` with production database
- [ ] Set `NODE_ENV=production`
- [ ] Update `FRONTEND_URL` with production frontend URL
- [ ] Review and adjust rate limiting values
- [ ] Set up proper logging (consider external service)
- [ ] Configure MongoDB indexes for performance
- [ ] Set up monitoring and alerting
- [ ] Configure SSL/TLS certificates
- [ ] Review CORS settings
- [ ] Set up database backups
- [ ] Configure CI/CD pipeline
- [ ] Review error messages (no sensitive data exposure)

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| PORT | Server port | 7777 | No |
| NODE_ENV | Environment mode | development | No |
| MONGODB_URI | MongoDB connection string | - | Yes |
| JWT_SECRET | Secret key for JWT | - | Yes |
| JWT_EXPIRES_IN | JWT expiration time | 1d | No |
| FRONTEND_URL | Frontend application URL | http://localhost:5173 | No |
| COOKIE_MAX_AGE | Cookie expiration (ms) | 86400000 | No |

## Error Handling

The application includes centralized error handling with:
- Proper HTTP status codes
- Meaningful error messages
- Stack traces in development mode
- Graceful error responses in production

## Development

### Code Structure
```
devTinder/
├── src/
│   ├── app.js              # Main application file
│   ├── config/
│   │   └── database.js     # Database configuration
│   ├── middlewares/
│   │   └── auth.js         # Authentication middleware
│   ├── models/
│   │   ├── user.js         # User model
│   │   └── connectRequest.js # Connection request model
│   ├── routes/
│   │   ├── auth.js         # Authentication routes
│   │   ├── profile.js      # Profile routes
│   │   ├── request.js      # Connection request routes
│   │   └── user.js         # User routes
│   └── utils/
│       ├── validation.js   # Input validation
│       └── constants.js    # Constants
├── .env                    # Environment variables (not in repo)
├── .env.example           # Example environment variables
├── .gitignore             # Git ignore rules
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## License

ISC

## Author

Chandan
