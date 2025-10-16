import { messagingApi, WebhookEvent } from '@line/bot-sdk';
import type { Handler } from 'hono';
import { StripeMessageFormatter } from '../../../line/formatters/stripe-formatter';
import { AgentResponseSchema, type AgentResponse } from '../../agents/types';

const client = new messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
});

const stripeFormatter = new StripeMessageFormatter();

/**
 * エージェントの応答をパースして構造化データを取得（オプション）
 */
const parseAgentResponse = (result: any): AgentResponse | null => {
  try {
    const textResponse = result?.text || '';

    // JSONブロック（```json ... ```）が含まれている場合は抽出
    const jsonMatch = textResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      return AgentResponseSchema.parse(parsed);
    }

    // JSON形式かチェック（{で始まり}で終わる）
    if (textResponse.trim().startsWith('{') && textResponse.trim().endsWith('}')) {
      const parsed = JSON.parse(textResponse);
      return AgentResponseSchema.parse(parsed);
    }

    // JSON形式でない場合はnullを返す
    return null;
  } catch (error) {
    console.warn('[parseAgentResponse] Not a structured response, using fallback');
    return null;
  }
};

const handleTextMessage = async (event: WebhookEvent, agent: any) => {
  if (event.type !== 'message' || event.message.type !== 'text') return null;

  const userMessage = event.message.text;

  let replyText: string;
  let flexMessage: any = null;

  try {
    const result = await agent.generate(userMessage);

    // デバッグ: エージェント実行結果を出力
    console.log('[Agent Result]', JSON.stringify(result, null, 2));

    // 構造化された応答かチェック
    const structuredResponse = parseAgentResponse(result);

    if (structuredResponse) {
      // 構造化された応答の場合
      console.log('[Structured Response]', JSON.stringify(structuredResponse, null, 2));
      replyText = structuredResponse.message;
      flexMessage = stripeFormatter.formatStructuredResponse(structuredResponse, result);
    } else {
      // 通常のテキスト応答の場合
      replyText = result?.text || 'エラーが発生しました。';
      // 従来のformatAgentResultを使用（toolCallsから自動検出）
      flexMessage = stripeFormatter.formatAgentResult(result);
    }

    if (flexMessage) {
      console.log('[Flex Message Created]', JSON.stringify(flexMessage, null, 2));
    }
  } catch (err: any) {
    // errがErrorオブジェクトの場合と文字列の場合の両方に対応
    replyText = `エラー: ${err?.message || err}`;
  }

  try {
    const messages: any[] = [{ type: 'text', text: replyText }];

    // Flexメッセージがあれば追加
    if (flexMessage) {
      messages.push(flexMessage);
    }

    await client.replyMessage({
      replyToken: event.replyToken,
      messages,
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
  if ('source' in event && event.source && 'userId' in event.source) {
    await client.showLoadingAnimation({
      chatId: event.source.userId as string,
    });
  }
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
    const agent = await mastra.getAgent('stripeAgent');

    const logger = mastra.getLogger();
    logger.info('Line webhook received!');

    const body = await c.req.json();
    const events: WebhookEvent[] = body.events;

    await Promise.all(events.map((event) => handleEventHandler(event, agent)));
  } catch (err) {
    console.error(`Error: ${err}`);
  }

  return c.json({ message: 'ok!' });
};
