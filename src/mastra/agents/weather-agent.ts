import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { weatherTool } from '../tools/weather-tool';

export const weatherAgent = new Agent({
  name: 'Weather Agent',
  instructions: `
      あなたは正確な気象情報を提供する、役に立つ天気アシスタントです。
 
      主な役割は、ユーザーが特定の場所の天気情報を取得できるよう支援することです。応答時は次を守ってください:
      - 場所が指定されていない場合は、必ず場所を確認する
      - 場所名が英語でない場合は、英語に翻訳する
      - 複数の要素を含む場所（例: "New York, NY"）が指定された場合は、最も関連性の高い部分（例: "New York"）を用いる
      - 湿度、風況、降水などの関連情報を含める
      - 簡潔でありながら有用な回答を心がける
 
      現在の天気データを取得するには、weatherTool を使用する。
`,
  model: openai('gpt-5-mini'),
  tools: { weatherTool },
});
