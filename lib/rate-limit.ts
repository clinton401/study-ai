import { Redis } from '@upstash/redis';
import { Types } from "mongoose";
// --- Configuration & Types ---


type RateLimitOptions = {
    windowSize?: number; // in ms
    maxRequests?: number;
    lockoutPeriod?: number; // in ms
};

type RateLimitResult =
    | { success: string; error?: never }
    | { error: string; success?: never };

type UserData = {
    count: number;
    windowStart: number;
    lockoutStart?: number;
};

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Optimized Redis Rate Limiter
 */
export const rateLimit = async (
    identifier: Types.ObjectId,
    options: RateLimitOptions = {},
    isAuthenticated = true,
    scope: string = "GENERAL"
): Promise<RateLimitResult> => {
    const {

        windowSize = 5 * 60 * 1000,    

        maxRequests = 5,

        lockoutPeriod = 5 * 60 * 1000,  

    } = options;



    const now = Date.now();
    const namespace = isAuthenticated ? 'user' : 'ip';
    const key = `rate_limit:${scope}:${namespace}:${identifier}`;

    try {
        const userData = await redis.get<UserData>(key);

        // 1. Initial State
        if (!userData) {
            const data: UserData = { count: 1, windowStart: now };
            // Set TTL to window + lockout so we don't leak memory
            await redis.set(key, data, { px: windowSize + lockoutPeriod });
            return { success: "Allowed" };
        }

        // 2. Lockout Check
        if (userData.lockoutStart) {
            const timeElapsed = now - userData.lockoutStart;
            if (timeElapsed < lockoutPeriod) {
                const timeLeft = Math.ceil((lockoutPeriod - timeElapsed) / 1000);
                return { error: `Too many attempts. Try again in ${timeLeft}s.` };
            }
            // Lockout expired: fall through to reset logic
        }

        // 3. Logic: Windowing & Incrementing
        const isNewWindow = now - userData.windowStart > windowSize;
        const isLockoutExpired = userData.lockoutStart && (now - userData.lockoutStart >= lockoutPeriod);

        let newCount = isNewWindow || isLockoutExpired ? 1 : userData.count + 1;
        let newWindowStart = isNewWindow || isLockoutExpired ? now : userData.windowStart;
        let newLockoutStart = undefined;

        // 4. Threshold Check
        if (newCount > maxRequests) {
            newLockoutStart = now;
            const data: UserData = { count: newCount, windowStart: newWindowStart, lockoutStart: newLockoutStart };
            await redis.set(key, data, { px: lockoutPeriod + 1000 }); // Keep key until lockout ends
            return { error: `Limit reached. Try again in ${Math.ceil(lockoutPeriod / 1000)}s.` };
        }

        // 5. Update State
        const updatedData: UserData = {
            count: newCount,
            windowStart: newWindowStart,
            lockoutStart: newLockoutStart
        };

        // Calculate remaining time for the window to set TTL
        const remainingWindow = Math.max(1000, windowSize - (now - newWindowStart));
        await redis.set(key, updatedData, { px: remainingWindow });

        return { success: "Allowed" };

    } catch (error) {
        console.error(`rateLimit error: ${error}`);
        // Failsafe: if Redis is down, we usually allow the request in production 
        // to avoid locking out all users.
        return { success: "Allowed (failsafe)" };
    }
};