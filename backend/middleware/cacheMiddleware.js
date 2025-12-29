const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes default

exports.cache = (duration = CACHE_DURATION) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const key = `__express__${req.originalUrl || req.url}`;
        const cachedResponse = cache.get(key);

        if (cachedResponse) {
            const { body, timestamp } = cachedResponse;
            if (Date.now() - timestamp < duration) {
                // Cache hit
                res.set('X-Cache', 'HIT');
                return res.send(body); // Use send to handle objects or strings
            } else {
                cache.delete(key);
            }
        }

        // Cache miss - hijack res.send/res.json
        res.set('X-Cache', 'MISS');
        const originalSend = res.send;
        res.send = (body) => {
            // Store in cache
            cache.set(key, {
                body,
                timestamp: Date.now()
            });
            // Restore original send and call it
            originalSend.call(res, body);
        };

        next();
    };
};

// Helper to clear cache (e.g., after POST/PUT)
exports.clearCache = (pattern) => {
    if (!pattern) {
        cache.clear();
        return;
    }
    for (const key of cache.keys()) {
        if (key.includes(pattern)) {
            cache.delete(key);
        }
    }
};
