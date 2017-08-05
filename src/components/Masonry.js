// @flow

import React, { Component } from 'react';
import placeStones from '../utils/placeStones';
import normalizeGutter from '../utils/normalizeGutter';
import type { Position, Stone, Gutter } from '../utils/types';

class Masonry extends Component {
  constructor(props: any) {
    super(props);

    this.setRef = (ref = null) => {
      this.node = ref;
    };
  }

  node: HTMLElement | null;
  stoneNodes: Array<HTMLElement>;
  setRef: () => void;

  state = {
    loaded: {},
    positions: [],
    containerHeight: 0,
  };

  state: {
    loaded: any,
    positions: Position[] | null,
  };

  static defaultProps = {
    gutter: 10,
    transition: 'fade',
  };

  props: {
    children: any,
    style: {},
    gutter: Gutter | number,
    transition: 'fade' | 'move' | 'fadeMove' | boolean,
  };

  stones = [];
  stones: Stone[];

  componentDidMount() {
    this.placeStones();
  }

  getStones() {
    return this.stoneNodes.map(stone => ({
      width: stone.offsetWidth,
      height: stone.offsetHeight,
    }));
  }

  placeStones() {
    if (this.node === null) {
      return;
    }
    const containerSize = this.node.offsetWidth;
    const stones = this.getStones();
    const gutter = normalizeGutter(this.props.gutter);

    const { positions, containerHeight } = placeStones({
      containerSize,
      stones,
      gutter,
    });

    this.setState({
      positions,
      containerHeight,
    });
  }

  getPositionStyle(index: number) {
    let positionStyle;
    if (this.state.positions) {
      positionStyle = this.state.positions[index];
    }
    if (positionStyle) {
      positionStyle = { ...positionStyle, opacity: 1 };
    } else {
      positionStyle = {
        opacity: 0,
      };
    }

    return positionStyle;
  }

  handleImageLoad(index: number) {
    // after each image reposition stones
    this.placeStones();
    this.setState(prevState => ({
      ...prevState,
      loaded: {
        ...prevState.loaded,
        [index]: true,
      },
    }));
  }

  renderStones() {
    // keep refs
    this.stoneNodes = [];
    return [...this.props.children].map((child, index) => {
      const positionStyle = this.getPositionStyle(index);

      // if an image add onLoad
      let visibilityStyle;
      let imageLoadHandler = null;
      if (child.type === 'img') {
        imageLoadHandler = {
          onLoad: (event) => {
            this.handleImageLoad(index);
            if (typeof child.props.onLoad === 'function') {
              child.props.onLoad(event);
            }
          },
        };
      }

      const style = {
        ...child.props.style,
        position: 'absolute',
        ...positionStyle,
        ...visibilityStyle,
      };

      if (this.props.transition === 'fade' || this.props.transition === 'fadeMove') {
        style.transition = '300ms opacity ease';
      }

      return React.cloneElement(child, {
        ref: (ref) => {
          this.stoneNodes[index] = ref;
        },
        style,
        ...imageLoadHandler,
      });
    });
  }

  render() {
    return (
      <div style={{ ...this.props.style, position: 'relative', minHeight: this.state.containerHeight }} ref={this.setRef}>
        {this.renderStones()}
      </div>
    );
  }
}

export default Masonry;
