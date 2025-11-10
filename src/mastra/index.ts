import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { weatherAgent } from './agents/weather-agent';

export const mastra = new Mastra({
  agents: { weatherAgent },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
