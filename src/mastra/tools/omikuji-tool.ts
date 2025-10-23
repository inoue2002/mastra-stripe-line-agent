import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const omikujiTool = createTool({
  id: 'get-omikuji',
  description: 'おみくじを引いて運勢を占う',
  inputSchema: z.object({
    category: z.string().optional().describe('占いたいカテゴリ（恋愛、仕事、健康など）'),
  }),
  outputSchema: z.object({
    fortune: z.string().describe('運勢の結果'),
    description: z.string().describe('運勢の詳細説明'),
    advice: z.string().describe('アドバイス'),
  }),
  execute: async ({ category }) => {
    // おみくじの結果の配列
    const fortunes = [
      {
        fortune: '大吉',
        description: '非常に良い運勢です。新しいことを始めるのに最適な時期です。',
        advice: '積極的に行動することで、素晴らしい結果が期待できます。'
      },
      {
        fortune: '中吉',
        description: '良い運勢です。着実に物事が進展するでしょう。',
        advice: '焦らず一歩ずつ進めることで、確実な成果が得られます。'
      },
      {
        fortune: '小吉',
        description: 'まずまずの運勢です。小さな幸せを見つけられるでしょう。',
        advice: '周りの人への感謝を忘れずに、日々を大切に過ごしましょう。'
      },
      {
        fortune: '吉',
        description: '良い運勢です。努力が報われる時期が近づいています。',
        advice: '継続は力なり。今の取り組みを続けることが大切です。'
      },
      {
        fortune: '末吉',
        description: '後半に向けて運勢が上昇します。辛抱強く待つことが大切です。',
        advice: '今は準備の時期。基礎を固めることで、後の成功につながります。'
      },
      {
        fortune: '凶',
        description: '注意が必要な時期です。慎重に行動しましょう。',
        advice: '無理をせず、周りの人の助言に耳を傾けることが重要です。'
      }
    ];

    // カテゴリ別の特別なアドバイス
    const categoryAdvice: { [key: string]: string } = {
      '恋愛': 'お相手とのコミュニケーションを大切にしましょう。',
      '仕事': 'チームワークを意識して取り組むと良い結果が期待できます。',
      '健康': '規則正しい生活を心がけ、無理をしないことが大切です。',
      '金運': '計画的な支出を心がけ、無駄遣いは控えましょう。',
      '学業': '基礎をしっかりと身につけることで、応用力が向上します。'
    };

    // ランダムにおみくじを選択
    const randomIndex = Math.floor(Math.random() * fortunes.length);
    const selectedFortune = fortunes[randomIndex];

    // カテゴリが指定されている場合は、専用のアドバイスを追加
    let finalAdvice = selectedFortune.advice;
    if (category && categoryAdvice[category]) {
      finalAdvice += ` ${categoryAdvice[category]}`;
    }

    return {
      fortune: selectedFortune.fortune,
      description: selectedFortune.description,
      advice: finalAdvice,
    };
  },
});