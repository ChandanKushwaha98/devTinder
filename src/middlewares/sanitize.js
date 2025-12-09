/**
 * Custom NoSQL injection sanitization middleware
 * Compatible with Express v5
 * Removes MongoDB operators from user input
 */

const sanitizeObject = (obj) => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    const sanitized = {};
    for (const key in obj) {
        // Remove keys that start with $ (MongoDB operators)
        if (key.startsWith('$')) {
            continue;
        }

        // Recursively sanitize nested objects
        sanitized[key] = sanitizeObject(obj[key]);
    }

    return sanitized;
};

const sanitizeMiddleware = (req, res, next) => {
    try {
        // Sanitize request body
        if (req.body && typeof req.body === 'object') {
            req.body = sanitizeObject(req.body);
        }

        // Sanitize query parameters
        if (req.query && typeof req.query === 'object') {
            req.query = sanitizeObject(req.query);
        }

        // Sanitize URL parameters
        if (req.params && typeof req.params === 'object') {
            req.params = sanitizeObject(req.params);
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = sanitizeMiddleware;
