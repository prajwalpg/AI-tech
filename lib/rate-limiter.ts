export const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(identifier: string) {
  const limit = parseInt(process.env.RATE_LIMIT_REQUESTS || '20', 10);
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
  const now = Date.now();

  let userLimit = rateLimitStore.get(identifier);

  if (!userLimit) {
    userLimit = { count: 1, resetAt: now + windowMs };
    rateLimitStore.set(identifier, userLimit);
    return { allowed: true, remaining: limit - 1, resetIn: windowMs };
  }

  if (now > userLimit.resetAt) {
    userLimit.count = 1;
    userLimit.resetAt = now + windowMs;
    return { allowed: true, remaining: limit - 1, resetIn: windowMs };
  }

  if (userLimit.count >= limit) {
    return { allowed: false, remaining: 0, resetIn: userLimit.resetAt - now };
  }

  userLimit.count += 1;
  return { allowed: true, remaining: limit - userLimit.count, resetIn: userLimit.resetAt - now };
}
