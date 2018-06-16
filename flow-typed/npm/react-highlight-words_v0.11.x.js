// flow-typed signature: 2575813d71e6b3583138635f391d1d93
// flow-typed version: 4f45aca779/react-highlight-words_v0.11.x/flow_>=v0.53.x

declare module "react-highlight-words" {
  import type { Node } from 'react';
  declare type Sanitize = (value: string) => string
  declare type FindChunks = ({
    autoEscape: boolean,
    caseSensitive: boolean,
    sanitize: Sanitize,
    searchWords: Array<string>,
    textToHighlight: string
  }) => Array<string>;

  declare type Props = {
    activeClassName?: string,
    activeIndex?: string,
    autoEscape?: boolean,
    className?: string,
    caseSensitive?: boolean,
    findChunks?: FindChunks,
    highlightClassName?: string,
    highlightStyle?: {[name: string]: string},
    highlightTag?: Node,
    sanitize?: Sanitize,
    searchWords: Array<string>,
    textToHighlight: string,
    unhighlightClassName?: string,
    unhighlightStyle?: {[name: string]: string}
  };

  declare export default class ReactHighlightedWords extends React$Component<Props> {}
}
