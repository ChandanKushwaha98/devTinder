const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'DevTinder API Documentation',
        version: '1.0.0',
        description: 'API documentation for DevTinder - A dating application backend',
        contact: {
            name: 'Chandan',
        },
        license: {
            name: 'ISC',
        },
    },
    servers: [
        {
            url: `http://localhost:${process.env.PORT || 7777}`,
            description: 'Development server',
        },
        {
            url: 'https://devtinderonline.in',
            description: 'Production server',
        },
    ],
    components: {
        securitySchemes: {
            cookieAuth: {
                type: 'apiKey',
                in: 'cookie',
                name: 'token',
                description: 'JWT token stored in httpOnly cookie',
            },
        },
        schemas: {
            User: {
                type: 'object',
                required: ['firstName', 'emailId', 'password'],
                properties: {
                    _id: {
                        type: 'string',
                        description: 'User ID',
                    },
                    firstName: {
                        type: 'string',
                        description: 'User first name',
                    },
                    lastName: {
                        type: 'string',
                        description: 'User last name',
                    },
                    emailId: {
                        type: 'string',
                        format: 'email',
                        description: 'User email address',
                    },
                    age: {
                        type: 'number',
                        description: 'User age',
                    },
                    gender: {
                        type: 'string',
                        enum: ['male', 'female', 'other'],
                        description: 'User gender',
                    },
                    photoUrl: {
                        type: 'string',
                        format: 'uri',
                        description: 'User photo URL',
                    },
                    about: {
                        type: 'string',
                        description: 'User bio/about section',
                    },
                    skills: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                        description: 'User skills',
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Account creation timestamp',
                    },
                    updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Last update timestamp',
                    },
                },
            },
            ConnectionRequest: {
                type: 'object',
                properties: {
                    _id: {
                        type: 'string',
                        description: 'Request ID',
                    },
                    fromUserId: {
                        type: 'string',
                        description: 'ID of user sending the request',
                    },
                    toUserId: {
                        type: 'string',
                        description: 'ID of user receiving the request',
                    },
                    status: {
                        type: 'string',
                        enum: ['interested', 'ignored', 'accepted', 'rejected'],
                        description: 'Connection request status',
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Request creation timestamp',
                    },
                },
            },
            Error: {
                type: 'object',
                properties: {
                    status: {
                        type: 'string',
                        example: 'error',
                    },
                    statusCode: {
                        type: 'number',
                        example: 400,
                    },
                    message: {
                        type: 'string',
                        example: 'Error message',
                    },
                },
            },
        },
    },
    tags: [
        {
            name: 'Authentication',
            description: 'User authentication endpoints',
        },
        {
            name: 'Profile',
            description: 'User profile management endpoints',
        },
        {
            name: 'Connections',
            description: 'Connection request endpoints',
        },
        {
            name: 'Users',
            description: 'User discovery and connections',
        },
        {
            name: 'Chat',
            description: 'Chat messaging endpoints',
        },
        {
            name: 'Health',
            description: 'Health check endpoints',
        },
    ],
};

const options = {
    swaggerDefinition,
    // Path to the API routes files
    apis: [
        './src/routes/*.js',
        './src/app.js',
    ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
