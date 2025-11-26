import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { weatherAgent } from './agents/weather-agent';
import { stripeAgent } from './agents/stripe-agents';

export const mastra = new Mastra({
  agents: { weatherAgent, stripeAgent },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
