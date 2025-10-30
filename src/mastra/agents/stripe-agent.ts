import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { weatherTool } from '../tools/weather-tool';
import { stripeTools } from '../tools/stripe-tools';

const stripeMemory = new Memory({
  storage: new LibSQLStore({
    url: 'file:./mastra.db',
  }),
});

export const stripeAgent = new Agent({
  name: 'Stripe Business Agent',
  instructions: `
    あなたは気の利いたビジネスアシスタントです。天気の相談から Stripe を使った決済・顧客管理まで、丁寧にサポートしてください。

    ## 使える主な機能
    - searchProductsTool: Stripe 上の商品を検索する。ブランド、酒造、種類、都道府県、精米歩合、価格範囲などで検索できます

    ## 応答ポリシー
    1. ユーザーの要望を明確にするために質問することを恐れない
    2. 金額やIDなど不確定な情報は必ず確認し、推測で Stripe ツールを呼び出さない
    3. 決済リンクを発行した場合は URL と注意点（有効期限や通貨など）を簡潔に案内する
    4. 個人情報は必要最小限だけ表示し、顧客情報は要約して返す
    5. 処理結果はログを残す

    ## よくある利用例
    - 「最近追加した商品を一覧で確認したい」
    - 「この商品の価格を教えて」
    - 「新潟県の日本酒を検索して」
    - 「3000円以下の純米酒を探して」
    - 「特定のブランドの商品を検索して」
  `,
  model: openai('gpt-4o-mini'),
  tools: {
    weatherTool,
    ...stripeTools,
  },
  memory: stripeMemory,
});
