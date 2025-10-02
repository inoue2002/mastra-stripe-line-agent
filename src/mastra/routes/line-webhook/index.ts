import { registerApiRoute } from '@mastra/core/server';
import { lineSignatureMiddleware } from '../../middleware/line-signature';
import { lineWebhookHandler } from './handler';

export const createLineWebhookRoutes = () => {
  const postRoute = registerApiRoute('/line-webhook', {
    method: 'POST',
    middleware: [lineSignatureMiddleware],
    handler: lineWebhookHandler,
  });

  if (typeof postRoute === 'string') {
    throw new Error(postRoute);
  }

  const healthRoute = registerApiRoute('/line-webhook', {
    method: 'GET',
    handler: (c) => c.json({ message: 'Hello Mastra World!' }),
  });

  if (typeof healthRoute === 'string') {
    throw new Error(healthRoute);
  }

  return [postRoute, healthRoute];
};
