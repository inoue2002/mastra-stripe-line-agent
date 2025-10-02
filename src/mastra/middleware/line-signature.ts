import type { MiddlewareConfig } from '@line/bot-sdk';
import { middleware } from '@line/bot-sdk';
import type { MiddlewareHandler } from 'hono';

export const lineSignatureMiddleware: MiddlewareHandler = async (c, next) => {
  const middlewareConfig: MiddlewareConfig = {
    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
  };
  middleware(middlewareConfig);
  await next();
};
