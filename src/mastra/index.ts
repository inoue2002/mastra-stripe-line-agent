import { Mastra } from '@mastra/core/mastra';
import { weatherAgent } from './agents/weather-agent';
import { createLineWebhookRoutes } from './routes/line-webhook';

export const mastra = new Mastra({
  agents: { weatherAgent },
  server: {
    apiRoutes: createLineWebhookRoutes(),
  },
});
