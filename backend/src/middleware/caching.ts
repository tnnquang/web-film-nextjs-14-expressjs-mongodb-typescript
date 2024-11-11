import { Redis } from "ioredis";
import { isEmpty } from "lodash";

export const client = new Redis({
  host: "127.0.0.1",
  port: 6379,
});

// Middleware to cache responses
export const cacheMiddleware = async (req: any, res: any, next: any) => {
  const cacheKey: string = req.originalUrl;
  try {
    // await client.connect();
    const data = await client.get(cacheKey);
    if (!isEmpty(data)) {
    //   await client.quit();
      return res.json(JSON.parse(data as string));
    } else {
      next();
    }
  } catch (error: any) {
    console.log("error caching: ", error);
    next();
  }
};

// Common function for cache invalidation
export const invalidateCache = async (cacheKey: string) => {
//   await client.connect();
  await client.del(cacheKey);
//   await client.quit();
};
