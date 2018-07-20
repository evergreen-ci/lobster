declare module 'react-router-bootstrap' {
  declare type Props = {
    children: React$Node,
    onClick?: Function,
    replace?: boolean,
    to: string | Object,
    exact?: bool,
    strict?: bool,
    className?: string,
    activeClassName?: string,
    style?: Object,
    activeStyle?: Object,
    isActive?: Function
  };

  declare export class LinkContainer extends React$Component<Props> {}
  declare export class IndexLinkContainer extends React$Component<Props> {}
}
