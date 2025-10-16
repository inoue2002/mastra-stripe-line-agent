import {
  createProductListFlex,
  createPriceListFlex,
  type Product,
  type Price,
} from '../templates/product-flex-message';
import type { FlexMessage } from '../templates/types';
import type { AgentResponse } from '../../mastra/agents/types';

/**
 * エージェント実行結果からツール呼び出しを解析する
 */
export type ToolCall = {
  toolName: string;
  result: any;
};

/**
 * エージェント実行結果の型定義
 */
export type AgentResult = {
  text?: string;
  toolCalls?: ToolCall[];
  // その他のプロパティ
  [key: string]: any;
};

/**
 * Stripeツールの実行結果をLINEメッセージにフォーマット
 */
export class StripeMessageFormatter {
  /**
   * エージェント実行結果からツール呼び出しを抽出
   */
  private extractToolCalls(result: AgentResult): ToolCall[] {
    console.log('[extractToolCalls] Checking result structure:', {
      hasToolCalls: !!result.toolCalls,
      hasSteps: !!result.steps,
      hasToolResults: !!result.toolResults,
      resultKeys: Object.keys(result || {}),
    });

    // toolResultsから抽出を試みる（Mastraの新しい構造）
    if (result.toolResults && Array.isArray(result.toolResults)) {
      console.log('[extractToolCalls] Found toolResults array:', result.toolResults.length);
      console.log('[extractToolCalls] toolResults content:', JSON.stringify(result.toolResults, null, 2));
      const toolCalls: ToolCall[] = result.toolResults.map((tr: any) => ({
        toolName: tr.toolName,
        result: tr.result,
      }));
      if (toolCalls.length > 0) {
        return toolCalls;
      }
    }

    // toolCallsが直接存在する場合
    if (result.toolCalls && Array.isArray(result.toolCalls) && result.toolCalls.length > 0) {
      console.log('[extractToolCalls] Found toolCalls array:', result.toolCalls.length);
      return result.toolCalls;
    }

    // stepsから抽出を試みる
    if (result.steps && Array.isArray(result.steps)) {
      console.log('[extractToolCalls] Found steps array:', result.steps.length);
      console.log('[extractToolCalls] steps content:', JSON.stringify(result.steps, null, 2));
      const toolCalls: ToolCall[] = [];
      for (const step of result.steps) {
        console.log('[extractToolCalls] step type:', step.type, 'stepType:', step.stepType);

        // tool-result タイプをチェック
        if (step.stepType === 'tool-result' || step.type === 'tool-result') {
          console.log('[extractToolCalls] Found tool-result step');
          // このstepからツール情報を抽出する必要がある
        }

        if (step.type === 'tool-call' && step.toolName && step.result) {
          console.log('[extractToolCalls] Found tool-call step:', step.toolName);
          toolCalls.push({
            toolName: step.toolName,
            result: step.result,
          });
        }
      }
      if (toolCalls.length > 0) {
        return toolCalls;
      }
    }

    console.log('[extractToolCalls] No tool calls found');
    return [];
  }

  /**
   * 商品一覧取得の結果をFlexメッセージに変換
   */
  formatProducts(toolResult: any): FlexMessage | null {
    if (!toolResult) return null;

    // toolResult.productsが存在する場合
    if (toolResult.products && Array.isArray(toolResult.products)) {
      const products: Product[] = toolResult.products;
      return createProductListFlex(products);
    }

    return null;
  }

  /**
   * 価格一覧取得の結果をFlexメッセージに変換
   */
  formatPrices(toolResult: any): FlexMessage | null {
    if (!toolResult) return null;

    // toolResult.pricesが存在する場合
    if (toolResult.prices && Array.isArray(toolResult.prices)) {
      const prices: Price[] = toolResult.prices;
      return createPriceListFlex(prices);
    }

    return null;
  }

  /**
   * エージェント実行結果を解析してFlexメッセージを生成（レガシーメソッド）
   */
  formatAgentResult(result: AgentResult): FlexMessage | null {
    const toolCalls = this.extractToolCalls(result);
    console.log('[formatAgentResult] Extracted tool calls:', toolCalls.length);

    for (const toolCall of toolCalls) {
      console.log(`[formatAgentResult] Processing tool: ${toolCall.toolName}`);

      // 商品一覧取得ツール
      if (toolCall.toolName === 'stripe-list-products') {
        const flexMessage = this.formatProducts(toolCall.result);
        if (flexMessage) {
          console.log('[formatAgentResult] Created product flex message');
          return flexMessage;
        }
      }

      // 価格一覧取得ツール
      if (toolCall.toolName === 'stripe-list-prices') {
        const flexMessage = this.formatPrices(toolCall.result);
        if (flexMessage) {
          console.log('[formatAgentResult] Created price flex message');
          return flexMessage;
        }
      }
    }

    console.log('[formatAgentResult] No flex message created');
    return null;
  }

  /**
   * 構造化された応答からFlexメッセージを生成
   */
  formatStructuredResponse(
    agentResponse: AgentResponse,
    result: AgentResult
  ): FlexMessage | null {
    const toolCalls = this.extractToolCalls(result);

    // productsフィールドがある場合
    if (agentResponse.products && agentResponse.products.length > 0) {
      // toolCallsからstripe-list-productsの結果を探す
      for (const toolCall of toolCalls) {
        if (toolCall.toolName === 'stripe-list-products') {
          const allProducts = toolCall.result?.products || [];

          // AgentResponseで指定されたIDのみをフィルタリング
          const filteredProducts = allProducts.filter((product: any) =>
            agentResponse.products?.includes(product.id)
          );

          if (filteredProducts.length > 0) {
            return createProductListFlex(filteredProducts);
          }
        }
      }
    }

    // pricesフィールドがある場合
    if (agentResponse.prices && agentResponse.prices.length > 0) {
      // toolCallsからstripe-list-pricesの結果を探す
      for (const toolCall of toolCalls) {
        if (toolCall.toolName === 'stripe-list-prices') {
          const allPrices = toolCall.result?.prices || [];

          // AgentResponseで指定されたIDのみをフィルタリング
          const filteredPrices = allPrices.filter((price: any) =>
            agentResponse.prices?.includes(price.id)
          );

          if (filteredPrices.length > 0) {
            return createPriceListFlex(filteredPrices);
          }
        }
      }
    }

    // products/pricesが指定されていない場合は、従来通りツール結果全体を使用
    return this.formatAgentResult(result);
  }
}
