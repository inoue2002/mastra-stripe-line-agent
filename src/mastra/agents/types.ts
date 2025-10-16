import { z } from 'zod';

/**
 * エージェントの構造化出力スキーマ
 */
export const AgentResponseSchema = z.object({
  message: z.string().describe('ユーザーへの返信メッセージ'),
  products: z
    .array(z.string())
    .optional()
    .describe('表示する商品IDのリスト（Stripe Product ID）'),
  prices: z
    .array(z.string())
    .optional()
    .describe('表示する価格IDのリスト（Stripe Price ID）'),
  paymentLink: z
    .object({
      url: z.string(),
      description: z.string().optional(),
    })
    .optional()
    .describe('作成した決済リンク情報'),
});

export type AgentResponse = z.infer<typeof AgentResponseSchema>;
