import type {
  FlexMessage,
  FlexBubble,
  FlexCarousel,
  FlexComponent,
  FlexBox,
} from './types';

export type Product = {
  id?: string;
  name?: string;
  description?: string;
  active: boolean;
};

export type Price = {
  id?: string;
  nickname?: string;
  currency?: string;
  unitAmount?: number;
  active: boolean;
};

/**
 * 単一商品のFlexBubbleを作成
 */
export function createProductBubble(product: Product): FlexBubble {
  const statusColor = product.active ? '#06C755' : '#999999';
  const statusText = product.active ? '販売中' : '停止中';

  return {
    type: 'bubble',
    size: 'micro',
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: product.name || '商品名なし',
              weight: 'bold',
              size: 'md',
              wrap: true,
              flex: 1,
            },
          ],
        },
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: statusText,
              size: 'xs',
              color: statusColor,
              weight: 'bold',
            },
          ],
          margin: 'sm',
        },
        ...(product.description
          ? [
              {
                type: 'separator' as const,
                margin: 'md' as const,
              },
              {
                type: 'box' as const,
                layout: 'vertical' as const,
                contents: [
                  {
                    type: 'text' as const,
                    text: product.description,
                    size: 'xs' as const,
                    color: '#666666',
                    wrap: true,
                    maxLines: 3,
                  },
                ],
                margin: 'md' as const,
              },
            ]
          : []),
        {
          type: 'separator',
          margin: 'md',
        },
        {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: `ID: ${product.id || 'N/A'}`,
              size: 'xxs',
              color: '#AAAAAA',
              wrap: true,
            },
          ],
          margin: 'md',
        },
      ],
      paddingAll: '15px',
    },
  };
}

/**
 * 商品一覧のFlexメッセージを作成
 */
export function createProductListFlex(products: Product[]): FlexMessage {
  const displayProducts = products.slice(0, 4);

  const productCards: FlexComponent[] = displayProducts.flatMap((product, index) => {
    const card = createProductSummaryCard(product);
    const isLast = index === displayProducts.length - 1;

    return isLast
      ? [card]
      : [card, { type: 'separator', margin: 'md', color: '#E3E7E3' }];
  });

  const bodyContents: FlexComponent[] = [
    {
      type: 'text',
      text: 'Stripeダッシュボードの最新商品一覧です。',
      size: 'sm',
      color: '#555555',
      wrap: true,
    },
    {
      type: 'separator',
      margin: 'lg',
    },
  ];

  if (productCards.length === 0) {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: '表示できる商品がありません。',
          size: 'sm',
          color: '#888888',
          align: 'center',
          wrap: true,
        },
      ],
      backgroundColor: '#F4F7F4',
      cornerRadius: 'md',
      paddingAll: '16px',
      margin: 'md',
    });
  } else {
    bodyContents.push(...productCards);

    if (products.length > displayProducts.length) {
      const remainingCount = products.length - displayProducts.length;
      bodyContents.push({
        type: 'text',
        text: `他 ${remainingCount} 件はStripeダッシュボードで確認してください。`,
        size: 'xs',
        color: '#888888',
        margin: 'lg',
        wrap: true,
      });
    }
  }

  bodyContents.push(
    {
      type: 'separator',
      margin: 'xl',
    },
    {
      type: 'text',
      text: '最新の在庫状況はStripeの管理画面をご確認ください。',
      size: 'xxs',
      color: '#AAAAAA',
      align: 'center',
      wrap: true,
    },
  );

  const bubble: FlexBubble = {
    type: 'bubble',
    size: 'mega',
    header: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: 'Stripe 商品情報',
          color: '#FFFFFF',
          size: 'lg',
          weight: 'bold',
        },
        {
          type: 'text',
          text: `登録商品: ${products.length}件`,
          color: '#D9F7DF',
          size: 'xs',
          margin: 'sm',
        },
      ],
      paddingAll: '20px',
      backgroundColor: '#06C755',
      spacing: 'xs',
    },
    body: {
      type: 'box',
      layout: 'vertical',
      contents: bodyContents,
      spacing: 'md',
      paddingAll: '20px',
    },
    styles: {
      header: {
        separator: false,
      },
      body: {
        backgroundColor: '#FFFFFF',
      },
    },
  };

  return {
    type: 'flex',
    altText: products.length
      ? `Stripeの商品一覧 (${products.length}件)`
      : '登録されている商品が見つかりません',
    contents: bubble,
  };
}

function createProductSummaryCard(product: Product): FlexBox {
  const contents: FlexComponent[] = [
    {
      type: 'text',
      text: product.name || '商品名なし',
      weight: 'bold',
      size: 'md',
      color: '#111111',
      wrap: true,
    },
  ];

  contents.push(
    product.description
      ? {
          type: 'text',
          text: product.description,
          size: 'xs',
          color: '#666666',
          wrap: true,
          maxLines: 4,
          margin: 'xs',
        }
      : {
          type: 'text',
          text: '説明は登録されていません。',
          size: 'xs',
          color: '#999999',
          wrap: true,
          margin: 'xs',
        },
  );

  contents.push(
    {
      type: 'box',
      layout: 'baseline',
      contents: [
        {
          type: 'text',
          text: '状態',
          size: 'xs',
          color: '#888888',
        },
        {
          type: 'text',
          text: product.active ? '販売中' : '停止中',
          size: 'xs',
          color: product.active ? '#06C755' : '#FF3B30',
          weight: 'bold',
          margin: 'sm',
        },
      ],
      margin: 'md',
    },
    {
      type: 'text',
      text: `ID: ${product.id || 'N/A'}`,
      size: 'xxs',
      color: '#AAAAAA',
      wrap: true,
    },
  );

  return {
    type: 'box',
    layout: 'vertical',
    contents,
    paddingAll: '16px',
    backgroundColor: '#F5FBF5',
    cornerRadius: 'md',
    spacing: 'xs',
  };
}

/**
 * 単一価格のFlexBubbleを作成
 */
export function createPriceBubble(price: Price): FlexBubble {
  const statusColor = price.active ? '#06C755' : '#999999';
  const statusText = price.active ? '有効' : '無効';

  // 金額をフォーマット（最小単位 -> 通常単位）
  const formattedAmount =
    price.unitAmount !== undefined
      ? (price.unitAmount / 100).toLocaleString('ja-JP')
      : 'N/A';

  const currency = price.currency?.toUpperCase() || '';

  return {
    type: 'bubble',
    size: 'micro',
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: price.nickname || 'プライス',
              weight: 'bold',
              size: 'md',
              wrap: true,
              flex: 1,
            },
          ],
        },
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: statusText,
              size: 'xs',
              color: statusColor,
              weight: 'bold',
            },
          ],
          margin: 'sm',
        },
        {
          type: 'separator',
          margin: 'md',
        },
        {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: `${formattedAmount} ${currency}`,
              size: 'xl',
              weight: 'bold',
              color: '#111111',
            },
          ],
          margin: 'md',
        },
        {
          type: 'separator',
          margin: 'md',
        },
        {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: `ID: ${price.id || 'N/A'}`,
              size: 'xxs',
              color: '#AAAAAA',
              wrap: true,
            },
          ],
          margin: 'md',
        },
      ],
      paddingAll: '15px',
    },
  };
}

/**
 * 価格一覧のFlexメッセージを作成
 */
export function createPriceListFlex(prices: Price[]): FlexMessage {
  if (prices.length === 0) {
    return {
      type: 'flex',
      altText: '価格がありません',
      contents: {
        type: 'bubble',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '価格がありません',
              weight: 'bold',
              size: 'md',
            },
          ],
        },
      },
    };
  }

  // 最大10件まで表示（Carouselの制限）
  const displayPrices = prices.slice(0, 10);

  const carouselContents: FlexCarousel = {
    type: 'carousel',
    contents: displayPrices.map(createPriceBubble),
  };

  return {
    type: 'flex',
    altText: `価格一覧 (${prices.length}件)`,
    contents: carouselContents,
  };
}
