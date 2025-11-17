import { messagingApi, WebhookEvent } from '@line/bot-sdk';
import { registerApiRoute } from '@mastra/core/server';
import type { Handler } from 'hono';
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

const client = new messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
});

// ユーザーのメッセージにAgentで応答する処理
const handleTextMessage = async (event: WebhookEvent, agent: any) => {
  if (event.type !== 'message' || event.message.type !== 'text') return null;

  const userMessage = event.message.text;

  let replyText: string;
  try {
    // stripeAgent を呼び出し、Toolの使用有無を含めた応答を生成
    const result = await agent.generate(userMessage);
    replyText = result && result.text ? result.text : 'エラーが発生しました。';
  } catch (err: any) {
    replyText = `エラー: ${err?.message || err}`;
  }

  try {
    // Reply Message API を使用して、ユーザーのイベントに返信
    await client.replyMessage({
      replyToken: event.replyToken,
      messages: [{ type: 'text', text: replyText }],
    });
  } catch (e) {
    console.error('LINEへの返信に失敗しました:', e);
  }
};

// 友だち追加イベントにテキストで応答する処理
const handleFollowEvent = async (event: WebhookEvent) => {
  if (event.type !== 'follow') return null;
  
  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [{ type: 'text', text: '友だち追加ありがとうございます！' }],
  });
};

// 全てのWebhookイベントを処理するメイン関数
const handleEvent = async (event: WebhookEvent, agent: any) => {
  // ユーザーに処理中であることを知らせる（ローディングアニメーション表示）
  if ('source' in event && event.source && 'userId' in event.source) {
    await client.showLoadingAnimation({
      chatId: event.source.userId as string,
    });
  }

  switch (event.type) {
    case 'message':
      if (event.message.type === 'text') {
        return handleTextMessage(event, agent);
      }
      break;
    case 'follow':
      return handleFollowEvent(event);
  }
  return null;
};

// Hono の API Route ハンドラ
const lineWebhookHandler: Handler = async (c) => {
  try {
    const mastra = c.get('mastra');
    // Stripe連携機能を含むAgentを使用
    const agent = await mastra.getAgent('stripeAgent');
    const logger = mastra.getLogger();
    
    logger.info('Line webhook received!');
    
    const body = await c.req.json();
    const events: WebhookEvent[] = body.events;

    // 全てのイベントを並行処理
    await Promise.all(events.map((event) => handleEvent(event, agent)));
  } catch (err) {
    console.error(`Error: ${err}`);
  }

  return c.json({ message: 'ok!' });
};

// ルート定義
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
    handler: (c: any) => c.json({ message: 'Hello Mastra World!' }),
  });

  if (typeof healthRoute === 'string') {
    throw new Error(healthRoute);
  }

  return [postRoute, healthRoute];
};