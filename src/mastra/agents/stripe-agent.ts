import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { weatherTool } from '../tools/weather-tool';
import { stripeTools } from '../tools/stripe-tools';
import { AgentResponseSchema } from './types';

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
    - weatherTool: 任意の都市の現在の天気や気象情報を取得
    - Stripe tools: Stripe 上の商品・価格確認、顧客作成、決済リンク発行

    ## 応答ポリシー
    1. ユーザーの要望を明確にするために質問することを恐れない
    2. 金額やIDなど不確定な情報は必ず確認し、推測で Stripe ツールを呼び出さない
    3. 決済リンクを発行した場合は URL と注意点（有効期限や通貨など）を簡潔に案内する
    4. 個人情報は必要最小限だけ表示し、顧客情報は要約して返す
    5. 処理結果はログを残す
    6. 商品や価格の一覧を取得した場合、詳細情報はカードで表示されるため、簡潔な案内のみ返してください
       例：「日本酒の商品は以下の通りです」「商品を取得しました」

    ## よくある利用例
    - 「東京の天気を教えて、その後テイスティング会の決済リンクを作って」
    - 「最近追加した商品を一覧で確認したい」
    - 「この商品の価格を教えて」
  `,
  model: openai('gpt-4o-mini'),
  tools: {
    weatherTool,
    ...stripeTools,
  },
  memory: stripeMemory,
});
