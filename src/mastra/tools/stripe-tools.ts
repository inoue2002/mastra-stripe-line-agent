import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import Stripe from 'stripe';

import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import Stripe from 'stripe';

// Stripe Query Languageでの検索クエリを構築
function buildQuery(options: {
  brand?: string;
  brewery?: string;
  type?: string;
  prefecture?: string;
  ricePolishingRate?: string;
}) {
  const conditions: string[] = [];

  if (options.brand) {
    conditions.push(`metadata['brand']:'${options.brand}'`);
  }

  if (options.brewery) {
    conditions.push(`metadata['brewery']:'${options.brewery}'`);
  }

  if (options.type) {
    conditions.push(`metadata['type']:'${options.type}'`);
  }

  if (options.prefecture) {
    conditions.push(`metadata['prefecture']:'${options.prefecture}'`);
  }

  if (options.ricePolishingRate) {
    conditions.push(`metadata['ricePolishingRate']:'${options.ricePolishingRate}'`);
  }

  return conditions.join(' AND ');
}




export const searchProductsTool = createTool({
  id: 'search-products',
  description: 'Stripeで商品を検索する。ブランド、酒造、種類、都道府県、精米歩合、価格範囲などで検索できます。',
  inputSchema: z.object({
    brand: z.string().optional().describe('ブランド名'),
    brewery: z.string().optional().describe('酒造名'),
    type: z.string().optional().describe('種類（例: 純米吟醸）'),
    prefecture: z.string().optional().describe('都道府県'),
    ricePolishingRate: z.string().optional().describe('精米歩合'),
    limit: z.number().optional().default(10).describe('取得件数（デフォルト: 10）'),
  }),
  outputSchema: z.object({
    products: z.array(
      z.object({
        id: z.string().describe('Product ID'),
        name: z.string().describe('商品名'),
        description: z.string().nullable().describe('商品説明'),
        price: z.number().nullable().describe('価格（円）'),
        priceId: z.string().nullable().describe('Price ID'),
        metadata: z.record(z.string()).describe('メタデータ'),
      })
    ).describe('検索結果の商品一覧'),
    count: z.number().describe('検索結果件数'),
  }),
  execute: async (context: any) => {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    
    if (!apiKey) {
      throw new Error('Stripe API キーが設定されていません。環境変数 STRIPE_SECRET_KEY または STRIPE_API_KEY を設定してください。');
    }

    const stripe = new Stripe(apiKey, {
      apiVersion: '2025-10-29.clover',
    });

    const { brand, brewery, type, prefecture, ricePolishingRate, limit = 10 } = context;
    try {
      // あとで検索クエリを作成する
      const query = buildQuery({ brand, brewery, type, prefecture, ricePolishingRate });

      const searchParams = query
        ? ({
            limit: limit,
            query: query,
          } as Stripe.ProductSearchParams)
        : ({
            limit: limit,
          } as any);

      // Product検索（クエリがない場合は list を使用）
      const products = query && query.length > 0
        ? await stripe.products.search(searchParams)
        : await stripe.products.list({ limit: limit });

    //   // Stripeにあるデータを取得・検索する
    //   const products = await stripe.products.list({ limit: limit });

      // フィルタリング処理を後で追加する
      let filteredProducts: Stripe.Product[] = products.data;
      
      // 結果を整形
      const formattedProducts = filteredProducts.map((product: Stripe.Product) => {
        const price = product.default_price;
        const priceAmount =
          typeof price === 'object' && price?.unit_amount ? price.unit_amount : null;
        const priceId =
          typeof price === 'string' ? price : typeof price === 'object' ? price?.id || null : null;

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: priceAmount,
          priceId: priceId,
          metadata: product.metadata || {},
        };
      });

      return {
        products: formattedProducts,
        count: formattedProducts.length,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Stripe商品検索エラー: ${error.message}`);
      }
      throw error;
    }
  },
});

export const stripeTools = {
  searchProductsTool,
};
