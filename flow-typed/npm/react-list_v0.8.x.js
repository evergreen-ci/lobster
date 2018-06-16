declare module 'react-list' {
  import type { Element, Component, Ref } from 'react';

  declare export type ListType = 'simple' | 'variable' | 'uniform';
  declare export type Axis = 'x' | 'y';

  declare export type Props = {
    axis?: Axis,
    initialIndex?: number,
    itemRenderer?: Function,
    itemSizeEstimator?: Function,
    itemSizeGetter?: Function,
    itemsRenderer?: Function,
    length?: number,
    minSize?: number,
    pageSize?: number,
    scrollParentGetter?: <T>() => React$Ref<T>,
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
