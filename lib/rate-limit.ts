import { Types } from "mongoose";
const requestTracker = {
    ipToRequestCount: new Map<Types.ObjectId, { count: number, windowStart: number, lockoutStart?: number }>(),
    userIdToRequestCount: new Map<Types.ObjectId, { count: number, windowStart: number, lockoutStart?: number }>(),
};

type RateLimitOptions = {
    windowSize?: number;
    maxRequests?: number;
    lockoutPeriod?: number;
}

export const rateLimit = (
    identifier: Types.ObjectId,
    isAuthenticated: boolean,
    options: RateLimitOptions = {}
) => {
    const {
        windowSize = 5 * 60 * 1000,    
        maxRequests = 5,
        lockoutPeriod = 5 * 60 * 1000,  
    } = options;

    const now = Date.now();

    const requestCountMap = isAuthenticated
        ? requestTracker.userIdToRequestCount
        : requestTracker.ipToRequestCount;

    let userData = requestCountMap.get(identifier);

    // First time user
    if (!userData) {
        userData = { count: 1, windowStart: now };
        requestCountMap.set(identifier, userData);
        return { success: "Request allowed." };
    }

    // If user is locked out
    if (userData.lockoutStart && now - userData.lockoutStart < lockoutPeriod) {
        const timeLeft = Math.ceil((lockoutPeriod - (now - userData.lockoutStart)) / 1000);
        return { error: `Too many attempts, please try again in ${timeLeft} seconds.` };
    }

    // Lockout expired, reset state
    if (userData.lockoutStart && now - userData.lockoutStart >= lockoutPeriod) {
        userData.count = 0;
        userData.lockoutStart = undefined;
        userData.windowStart = now;
    }

    const isNewWindow = now - userData.windowStart > windowSize;
    if (isNewWindow) {
        userData.count = 1;
        userData.windowStart = now;
    } else {
        userData.count += 1;
    }

    // Hit the limit
    if (userData.count > maxRequests) {
        userData.lockoutStart = now;
        requestCountMap.set(identifier, userData);
        return { error: `Too many attempts, please try again in ${Math.ceil(lockoutPeriod / 1000)} seconds.` };
    }

    requestCountMap.set(identifier, userData);
    return { success: "Request allowed." };
};
