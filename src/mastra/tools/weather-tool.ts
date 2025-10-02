import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const weatherTool = createTool({
  id: 'get-weather',
  description: '指定した場所の現在の天気を取得する',
  inputSchema: z.object({
    location: z.string().describe('都市名'),
  }),
  outputSchema: z.object({
    output: z.string(),
  }),
  execute: async () => {
    return {
      output: '天気は晴れです',
    };
  },
});
