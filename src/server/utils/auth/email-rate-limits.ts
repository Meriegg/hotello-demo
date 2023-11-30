import { kv } from "@vercel/kv";

export const verifyUserIp = async (ip: string | null) => {
  if (!ip) {
    return {
      block: false,
      timeDiffInSeconds: null,
    };
  }

  const emailRatelimitKey = `email_ratelimit[${ip}]`;

  const pastDate = await kv.get(emailRatelimitKey) as number;
  const currentDate = Date.now();
  const timeDiff = pastDate
    ? Math.floor((currentDate - pastDate) / 1000)
    : null;
  if (timeDiff !== null && timeDiff < 30) {
    return {
      block: true,
      timeDiffInSeconds: 30 - timeDiff,
    };
  }

  return {
    block: false,
    timeDiffInSeconds: null,
  };
};

export const rateLimitUserIp = async (ip: string | null) => {
  if (!ip) return null;

  const emailRatelimitKey = `email_ratelimit[${ip}]`;

  return await kv.set(emailRatelimitKey, Date.now());
};
