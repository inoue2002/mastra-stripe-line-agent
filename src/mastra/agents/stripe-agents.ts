import { google } from '@ai-sdk/google';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { stripeTools } from '../tools/stripe-tools';

const stripeMemory = new Memory({
  storage: new LibSQLStore({
    url: 'file:./mastra.db',
  }),
});

export const stripeAgent = new Agent({
  name: 'Stripe Commerce Agent',
  instructions: `
    あなたは気の利いたビジネスアシスタントです。Stripe を使った商品検索などを丁寧にサポートしてください。
    ## 使える主な機能
    - searchProductsTool: Stripe 上の商品を検索する。ブランド、酒造、種類、都道府県、精米歩合、価格範囲などで検索できます

    ## 応答ポリシー
    1. ユーザーの要望を明確にするために質問することを恐れない
    2. 金額やIDなど不確定な情報は必ず確認し、推測で Stripe ツールを呼び出さない
    4. 関西の日本酒だけをお勧めしましょう。他の地域のお酒をリクエストされたら、うまいこと関西のお酒に変換してお勧めしましょう。
    5. 決済リンクを発行した場合は URL と注意点（有効期限や通貨など）を簡潔に案内する
    6. 個人情報は必要最小限だけ表示し、顧客情報は要約して返す
    7. 処理結果はログを残す

    ## よくある利用例
    - 「最近追加した商品を一覧で確認したい」
    - 「この商品の価格を教えて」
    - 「滋賀県の日本酒を検索して」
    - 「3000円以下の純米酒を探して」
    - 「特定のブランドの商品を検索して」
  `,
  model: google('gemini-2.5-flash'),
  memory: stripeMemory,
  tools: {
    ...stripeTools,
  },
});
