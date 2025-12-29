// Simple in-memory cache for admin data
// Persists data across tab navigations within the same session

interface CacheItem<T> {
    data: T;
    timestamp: number;
    key: string;
}

class AdminCache {
    private cache = new Map<string, CacheItem<any>>();
    private TTL = 5 * 60 * 1000; // 5 minutes default TTL

    // Generate cache key from params
    private makeKey(endpoint: string, params: Record<string, any>): string {
        const sortedParams = Object.keys(params)
            .sort()
            .filter(k => params[k] !== undefined && params[k] !== null && params[k] !== '')
            .map(k => `${k}=${params[k]}`)
            .join('&');
        return `${endpoint}:${sortedParams}`;
    }

    // Get cached data if valid
    get<T>(endpoint: string, params: Record<string, any>): T | null {
        const key = this.makeKey(endpoint, params);
        const item = this.cache.get(key);

        if (!item) return null;

        // Check if expired
        if (Date.now() - item.timestamp > this.TTL) {
            this.cache.delete(key);
            return null;
        }

        return item.data as T;
    }

    // Cache data
    set<T>(endpoint: string, params: Record<string, any>, data: T): void {
        const key = this.makeKey(endpoint, params);
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            key
        });
    }

    // Invalidate specific endpoint
    invalidate(endpoint: string): void {
        for (const [key] of this.cache) {
            if (key.startsWith(endpoint)) {
                this.cache.delete(key);
            }
        }
    }

    // Clear all cache
    clear(): void {
        this.cache.clear();
    }

    // Get cache stats (for debugging)
    stats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Singleton instance
export const adminCache = new AdminCache();
