import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { flexBubbleSchema } from '../schema/flexMessageSchema';
import { messagingApi } from "@line/bot-sdk";

const client = new messagingApi.MessagingApiClient({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
});
// .env で設定したユーザーIDに固定でPushします。
const LINE_DIST_USER_ID = process.env.LINE_DESTINATION_USER_ID || '';

export const pushFlexMessageTool = createTool({
      id: 'push-flex-message',
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
        const cMessage = { ...{contents: context.context.bubble}, type: 'flex', altText: 'AIがFlex Messageを送信しました' } as messagingApi.Message;
        try {
          // Push Message API を使用して、固定のユーザーにメッセージを送信する
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

export const lineTools = {
  pushFlexMessageTool,
};