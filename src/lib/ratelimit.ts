import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

//UpSTASH RATELIMITING

export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(20, "10s"), //10 requests per 10 seconds
});