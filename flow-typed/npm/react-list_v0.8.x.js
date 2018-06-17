declare module 'react-list' {
  import type { Node, Element, Component, Ref } from 'react';

  declare export type ListType = 'simple' | 'variable' | 'uniform';
  declare export type Axis = 'x' | 'y';

  declare export type Cache = {
    [number]: number,
  };

  declare export type ItemsRendererFunction = (element: React$Node) => bool;

  declare export type Props = {
    axis?: Axis,
    initialIndex?: number,
    itemRenderer?: (index: number, key: number) => React$Node,
    itemSizeEstimator?: (index: number, cache: Cache) => number,
    itemSizeGetter?: (index: number) => number,
    itemsRenderer?: (items: React$Node[], ItemsRendererFunction) => React$Node,
    length?: number,
    minSize?: number,
    pageSize?: number,
    scrollParentGetter?: () => React$Node,
    threshold?: number,
    type?: ListType,
    useStaticSize?: bool,
    useTranslate3d?: bool
  }

  declare export default class ReactList extends React$Component<Props> {
    scrollTo: (index: number) => void,
    scrollAround: (index: number) => void,
    getVisibleRange: () => [number, number]
  }
}
