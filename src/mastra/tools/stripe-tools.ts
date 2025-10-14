import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { StripeAgentToolkit } from '@stripe/agent-toolkit/langchain';

type StripeToolkitMethod =
  | 'create_payment_link'
  | 'list_products'
  | 'list_prices'
  | 'create_customer';

let cachedToolkit: StripeAgentToolkit | null = null;
let cachedSecretKey: string | null = null;

const ensureToolkit = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }

  if (!cachedToolkit || cachedSecretKey !== secretKey) {
    cachedToolkit = new StripeAgentToolkit({
      secretKey,
      configuration: {
        actions: {
          paymentLinks: { create: true },
          products: { read: true },
          prices: { read: true },
          customers: { create: true },
        },
      },
    });
    cachedSecretKey = secretKey;
  }

  return cachedToolkit;
};

const getToolkitMethod = (method: StripeToolkitMethod) => {
  const tool = ensureToolkit()
    .getTools()
    .find((stripeTool) => stripeTool.method === method);

  if (!tool) {
    throw new Error(`Stripe toolkit method not available: ${method}`);
  }

  return tool;
};

const invokeToolkit = async <T>(method: StripeToolkitMethod, params: Record<string, unknown>) => {
  const tool = getToolkitMethod(method);
  const raw = await tool.invoke(params);

  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as T;
    } catch (error) {
      console.warn(`[stripeTool] failed to parse JSON response for ${method}`, error);
      return raw as T;
    }
  }

  return raw as T;
};

// const createPaymentLinkInput = z.object({
//   priceId: z.string().describe('StripeのPrice ID'),
//   quantity: z.number().int().min(1).max(100).optional().describe('購入数量'),
//   redirectUrl: z.string().url().optional().describe('決済完了時に遷移させるURL'),
// });

// const createCustomerInput = z.object({
//   name: z.string().describe('顧客の氏名'),
//   email: z.string().email().optional().describe('顧客のメールアドレス'),
// });

const listProductsInput = z.object({
  limit: z.number().int().min(1).max(100).optional().describe('取得する件数 (最大100件)'),
});

const listPricesInput = z.object({
  productId: z.string().optional().describe('対象のProduct ID'),
  limit: z.number().int().min(1).max(100).optional().describe('取得する件数 (最大100件)'),
});


// const createPaymentLink = async (input: z.infer<typeof createPaymentLinkInput>) => {
//     const { priceId, quantity = 1, redirectUrl } = input;

//     const result = await invokeToolkit<
//       { id?: string; url?: string } | string
//     >('create_payment_link', {
//       price: priceId,
//       quantity,
//       ...(redirectUrl ? { redirect_url: redirectUrl } : {}),
//     });

//     if (!result || typeof result === 'string') {
//       throw new Error(
//         typeof result === 'string'
//           ? result
//           : 'Stripe toolkit did not return a payment link',
//       );
//     }

//     const { id, url } = result;

//     if (!id || !url) {
//       throw new Error('Stripe toolkit returned an incomplete payment link response');
//     }

//     return {
//       paymentLink: url,
//       paymentLinkId: id,
//       success: true,
//     } as const;
// };

// const createCustomer = async (input: z.infer<typeof createCustomerInput>) => {
//     const result = await invokeToolkit<{ id?: string } | string>('create_customer', {
//       name: input.name,
//       ...(input.email ? { email: input.email } : {}),
//     });

//     if (!result || typeof result === 'string') {
//       throw new Error(
//         typeof result === 'string' ? result : 'Stripe toolkit failed to create customer',
//       );
//     }

//     return {
//       customerId: result.id,
//       name: input.name,
//       email: input.email,
//       success: true,
//     } as const;
// };

const listProducts = async (input: z.infer<typeof listProductsInput>) => {
    const result = await invokeToolkit<any>('list_products', {
      ...(input.limit ? { limit: input.limit } : {}),
    });

    if (!Array.isArray(result)) {
      throw new Error(
        typeof result === 'string' ? result : 'Stripe toolkit failed to list products',
      );
    }

    const products = result.map((product) => ({
      id: product?.id,
      name: product?.name,
      description: product?.description ?? undefined,
      active: Boolean(product?.active),
    }));

    return {
      products,
      success: true,
    } as const;
};

const listPrices = async (input: z.infer<typeof listPricesInput>) => {
    const result = await invokeToolkit<any>('list_prices', {
      ...(input.productId ? { product: input.productId } : {}),
      ...(input.limit ? { limit: input.limit } : {}),
    });

    if (!Array.isArray(result)) {
      throw new Error(
        typeof result === 'string' ? result : 'Stripe toolkit failed to list prices',
      );
    }

    const prices = result.map((price) => ({
      id: price?.id,
      nickname: price?.nickname ?? undefined,
      currency: price?.currency,
      unitAmount: price?.unit_amount ?? undefined,
      active: Boolean(price?.active),
    }));

    return {
      prices,
      success: true,
    } as const;
};


// export const createPaymentLinkTool = createTool({
//   id: 'stripe-create-payment-link',
//   description: 'StripeのPrice IDから決済リンクを生成する',
//   inputSchema: createPaymentLinkInput,
//   outputSchema: z.object({
//     paymentLink: z.string(),
//     paymentLinkId: z.string(),
//     success: z.literal(true),
//   }),
//   execute: async ({ context }) => createPaymentLink(context),
// });

// export const createCustomerTool = createTool({
//   id: 'stripe-create-customer',
//   description: 'Stripeで新規顧客を作成する',
//   inputSchema: createCustomerInput,
//   outputSchema: z.object({
//     customerId: z.string(),
//     name: z.string(),
//     email: z.string().email().optional(),
//     success: z.literal(true),
//   }),
//   execute: async ({ context }) => createCustomer(context),
// });

export const listProductsTool = createTool({
  id: 'stripe-list-products',
  description: 'Stripeに登録されている商品一覧を取得する',
  inputSchema: listProductsInput,
  outputSchema: z.object({
    products: z.array(
      z.object({
        id: z.string().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        active: z.boolean(),
      }),
    ),
    success: z.literal(true),
  }),
  execute: async ({ context }) => listProducts(context),
});

export const listPricesTool = createTool({
  id: 'stripe-list-prices',
  description: 'StripeのPrice一覧を取得する',
  inputSchema: listPricesInput,
  outputSchema: z.object({
    prices: z.array(
      z.object({
        id: z.string().optional(),
        nickname: z.string().optional(),
        currency: z.string().optional(),
        unitAmount: z.number().optional(),
        active: z.boolean(),
      }),
    ),
    success: z.literal(true),
  }),
  execute: async ({ context }) => listPrices(context),
});


export const stripeTools = {
  // createPaymentLinkTool,
  // createCustomerTool,
  listProductsTool,
  listPricesTool,
};
