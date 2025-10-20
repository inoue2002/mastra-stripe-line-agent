import { messagingApi, WebhookEvent } from '@line/bot-sdk';
import type { Handler } from 'hono';

const client = new messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
});

// キャラクター選択関数
const selectCharacter = (text: string) => {
  const lowerText = text.toLowerCase();
  
  // 天気の状態に応じてキャラクターを選択
  if (lowerText.includes('晴れ') || lowerText.includes('sunny') || lowerText.includes('clear')) {
    return { name: '☀️ ひなたちゃん' };
  } else if (lowerText.includes('雨') || lowerText.includes('rain') || lowerText.includes('rainy')) {
    return { name: '☔ あめちゃん' };
  } else if (lowerText.includes('曇り') || lowerText.includes('cloud') || lowerText.includes('cloudy')) {
    return { name: '☁️ くもりん' };
  } else if (lowerText.includes('雪') || lowerText.includes('snow') || lowerText.includes('snowy')) {
    return { name: '⛄ ゆきちゃん' };
  } else if (lowerText.includes('風') || lowerText.includes('wind') || lowerText.includes('windy')) {
    return { name: '🌀 かぜまる' };
  } else if (lowerText.includes('エラー') || lowerText.includes('error')) {
    return { name: '⚠️ サポート' };
  }
  
  // デフォルト
  return { name: '🌤️ お天気案内' };
};

const handleTextMessage = async (event: WebhookEvent, agent: any) => {
  if (event.type !== 'message' || event.message.type !== 'text') return null;

  const userMessage = event.message.text;

  let replyText: string;
  try {
    const result = await agent.generateVNext(userMessage);
    // result.textが存在しない場合のフォールバック
    replyText = result && result.text ? result.text : 'エラーが発生しました。';
  } catch (err: any) {
    // errがErrorオブジェクトの場合と文字列の場合の両方に対応
    replyText = `エラー: ${err?.message || err}`;
  }

  // 返信を複数メッセージに分割
  const messages: any[] = [];
  
  // 1つ目: メインの天気情報（該当するキャラクター）
  const mainCharacter = selectCharacter(replyText);
  messages.push({
    type: 'text',
    text: replyText,
    sender: mainCharacter
  });

  // 2つ目: 追加情報（お天気案内キャラ）
  messages.push({
    type: 'text',
    text: '何か他にお知りになりたいことはありますか？',
    sender: { name: '🌤️ お天気案内' }
  });

  try {
    await client.replyMessage({
      replyToken: event.replyToken,
      messages: messages,
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
    const agent = await mastra.getAgent('weatherAgent');

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