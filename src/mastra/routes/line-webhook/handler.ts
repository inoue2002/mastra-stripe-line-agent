import { messagingApi, WebhookEvent } from '@line/bot-sdk';
import type { Handler } from 'hono';

const client = new messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
});

const handleTextMessage = async (event: WebhookEvent, agent: any) => {
  if (event.type !== 'message' || event.message.type !== 'text') return null;

  const userMessage = event.message.text;

  let replyText: string;
  try {
    const result = await agent.generate(userMessage);
    // result.textが存在しない場合のフォールバック
    replyText = result && result.text ? result.text : 'エラーが発生しました。';
  } catch (err: any) {
    // errがErrorオブジェクトの場合と文字列の場合の両方に対応
    replyText = `エラー: ${err?.message || err}`;
  }

  try {
    await client.replyMessage({
      replyToken: event.replyToken,
      messages: [{ type: 'text', text: replyText }],
    });
  } catch (e) {
    console.error('LINEへの返信に失敗しました:', e);
  }
};

const handleMessageEvent = async (event: WebhookEvent, agent: any) => {
  if (event.type !== 'message') return null;
  switch (event.message.type) {
    case 'text':
      return handleTextMessage(event, agent);
  }
  return null;
};

const handleFollowEvent = async (event: WebhookEvent) => {
  if (event.type !== 'follow') return null;
  const welcomeText = '友だち追加ありがとうございます！';

  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [{ type: 'text', text: welcomeText }],
  });
};

const handleEventHandler = async (event: WebhookEvent, agent: any) => {
  switch (event.type) {
    case 'message':
      return handleMessageEvent(event, agent);
    case 'follow':
      return handleFollowEvent(event);
    default:
      return null;
  }
};
export const lineWebhookHandler: Handler = async (c) => {
  try {
    const mastra = c.get('mastra');
    const agent = await mastra.getAgent('weatherAgent');

    const body = await c.req.json();
    const events: WebhookEvent[] = body.events;

    await Promise.all(events.map((event) => handleEventHandler(event, agent)));
  } catch (err) {
    console.error(`Error: ${err}`);
  }

  return c.json({ message: 'ok!' });
};
