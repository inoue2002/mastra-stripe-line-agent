/**
 * LINE Flex Message型定義
 * 参考: https://developers.line.biz/ja/reference/messaging-api/#flex-message
 */

export type FlexMessage = {
  type: 'flex';
  altText: string;
  contents: FlexBubble | FlexCarousel;
};

export type FlexCarousel = {
  type: 'carousel';
  contents: FlexBubble[];
};

export type FlexBubble = {
  type: 'bubble';
  size?: 'nano' | 'micro' | 'kilo' | 'mega' | 'giga';
  header?: FlexBox;
  hero?: FlexComponent;
  body?: FlexBox;
  footer?: FlexBox;
  styles?: FlexBubbleStyles;
};

export type FlexBubbleStyles = {
  header?: FlexBlockStyle;
  hero?: FlexBlockStyle;
  body?: FlexBlockStyle;
  footer?: FlexBlockStyle;
};

export type FlexBlockStyle = {
  backgroundColor?: string;
  separator?: boolean;
  separatorColor?: string;
};

export type FlexBox = {
  type: 'box';
  layout: 'horizontal' | 'vertical' | 'baseline';
  contents: FlexComponent[];
  spacing?: FlexSpacing;
  margin?: FlexSpacing;
  paddingAll?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingStart?: string;
  paddingEnd?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: string;
  cornerRadius?: string;
  width?: string;
  height?: string;
  flex?: number;
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'center' | 'flex-end';
};

export type FlexComponent =
  | FlexBox
  | FlexButton
  | FlexImage
  | FlexText
  | FlexIcon
  | FlexSeparator
  | FlexFiller
  | FlexSpacer;

export type FlexButton = {
  type: 'button';
  action: FlexAction;
  style?: 'primary' | 'secondary' | 'link';
  color?: string;
  height?: 'sm' | 'md';
  margin?: FlexSpacing;
};

export type FlexImage = {
  type: 'image';
  url: string;
  size?:
    | 'xxs'
    | 'xs'
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | 'xxl'
    | '3xl'
    | '4xl'
    | '5xl'
    | 'full';
  aspectRatio?: string;
  aspectMode?: 'cover' | 'fit';
  backgroundColor?: string;
  margin?: FlexSpacing;
  align?: 'start' | 'end' | 'center';
  gravity?: 'top' | 'bottom' | 'center';
  action?: FlexAction;
};

export type FlexText = {
  type: 'text';
  text: string;
  size?:
    | 'xxs'
    | 'xs'
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | 'xxl'
    | '3xl'
    | '4xl'
    | '5xl';
  weight?: 'regular' | 'bold';
  color?: string;
  align?: 'start' | 'end' | 'center';
  gravity?: 'top' | 'bottom' | 'center';
  wrap?: boolean;
  maxLines?: number;
  margin?: FlexSpacing;
  flex?: number;
  style?: 'normal' | 'italic';
  decoration?: 'none' | 'underline' | 'line-through';
  action?: FlexAction;
};

export type FlexIcon = {
  type: 'icon';
  url: string;
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | '3xl' | '4xl' | '5xl';
  aspectRatio?: string;
  margin?: FlexSpacing;
};

export type FlexSeparator = {
  type: 'separator';
  margin?: FlexSpacing;
  color?: string;
};

export type FlexFiller = {
  type: 'filler';
  flex?: number;
};

export type FlexSpacer = {
  type: 'spacer';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
};

export type FlexAction =
  | {
      type: 'uri';
      uri: string;
      label?: string;
    }
  | {
      type: 'message';
      text: string;
      label?: string;
    }
  | {
      type: 'postback';
      data: string;
      label?: string;
      displayText?: string;
    };

export type FlexSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
