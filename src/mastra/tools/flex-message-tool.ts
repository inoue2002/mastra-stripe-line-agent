import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { flexBubbleSchema } from './flexMessageSchema';
import { messagingApi } from "@line/bot-sdk";

const client = new messagingApi.MessagingApiClient({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
});
const LINE_DIST_USER_ID = process.env.LINE_DESTINATION_USER_ID || '';

export const pushFlexMessageTool = createTool({
      id: 'push_flex_message',
      description: 'LINEにFlex Messageを送信する',
      inputSchema: z.object({
        bubble: flexBubbleSchema.describe(
          "Push a highly customizable flex message to a user via LINE." +
          "All constraints and validation rules are defined in the message schema.")

      }),
      outputSchema: z.object({
          success: z.boolean().describe('送信ステータス'),
          message: z.string().describe('メッセージ')
      }),
      execute: async (context) => {
        let response = null
        const cMessage = { ...{contents: context.context.bubble}, type: 'flex', altText: 'おみくじの結果' } as messagingApi.Message;
        try {

          response = await client.pushMessage({
            to: LINE_DIST_USER_ID,
            messages: [cMessage],
          });
          return ({
            success: response.sentMessages.length !== 0,
            message: JSON.stringify(cMessage)
          })
        } catch (error) {
          return ({
            success: false,
            message: `Error: ${error}, uid; ${LINE_DIST_USER_ID}`
          })
        }
      }
});
