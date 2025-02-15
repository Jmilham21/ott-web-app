import classNames from 'classnames';
import React, { type ReactNode, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import styles from './TileDock.module.scss';

export type CycleMode = 'stop' | 'restart' | 'endless';
type Direction = 'left' | 'right';
type Position = { x: number; y: number };

export type TileDockProps<T> = {
  items: T[];
  cycleMode?: CycleMode;
  tilesToShow?: number;
  spacing?: number;
  tileHeight?: number;
  minimalTouchMovement?: number;
  showControls?: boolean;
  showDots?: boolean;
  animationModeOverride?: boolean;
  wrapWithEmptyTiles?: boolean;
  transitionTime?: string;
  renderTile: (item: T, isInView: boolean) => ReactNode;
  renderLeftControl?: (handleClick: () => void) => ReactNode;
  renderRightControl?: (handleClick: () => void) => ReactNode;
  renderPaginationDots?: (index: number, pageIndex: number) => ReactNode;
};

type Tile<T> = {
  item: T;
  key: string;
};

const makeTiles = <T,>(originalList: T[], slicedItems: T[]): Tile<T>[] => {
  const itemIndices: string[] = [];

  return slicedItems.map((item) => {
    let key = `tile_${originalList.indexOf(item)}`;
    while (itemIndices.includes(key)) {
      key += '_';
    }
    itemIndices.push(key);
    return { item, key };
  });
};

const sliceItems = <T,>(items: T[], isMultiPage: boolean, index: number, tilesToShow: number, cycleMode: CycleMode): Tile<T>[] => {
  if (!isMultiPage) return makeTiles(items, items);

  const sliceFrom: number = index;
  const sliceTo: number = index + tilesToShow * 3;

  const cycleModeEndlessCompensation: number = cycleMode === 'endless' ? tilesToShow : 0;
  const listStartClone: T[] = items.slice(0, tilesToShow + cycleModeEndlessCompensation + 1);
  const listEndClone: T[] = items.slice(0 - (tilesToShow + cycleModeEndlessCompensation + 1));

  const itemsWithClones: T[] = [...listEndClone, ...items, ...listStartClone];
  const itemsSlice: T[] = itemsWithClones.slice(sliceFrom, sliceTo + 2);

  return makeTiles(items, itemsSlice);
};

function TileDock<T>({
  items,
  tilesToShow = 6,
  cycleMode = 'endless',
  spacing = 12,
  minimalTouchMovement = 30,
  showControls = true,
  animationModeOverride,
  transitionTime = '0.6s',
  wrapWithEmptyTiles = false,
  showDots = false,
  renderTile,
  renderLeftControl,
  renderRightControl,
  renderPaginationDots,
}: TileDockProps<T>) {
  const [index, setIndex] = useState(0);
  const [slideToIndex, setSlideToIndex] = useState(0);
  const [transform, setTransform] = useState(-100);
  // Prevent animation mode from changing after first load
  const [isAnimated] = useState(animationModeOverride ?? !window.matchMedia('(prefers-reduced-motion)').matches);
  const [isAnimationDone, setIsAnimationDone] = useState(false);
  const [isAnimationRunning, setIsAnimationRunning] = useState(false);

  const frameRef = useRef<HTMLUListElement>() as React.MutableRefObject<HTMLUListElement>;
  const tileWidth: number = 100 / tilesToShow;
  const isMultiPage: boolean = items?.length > tilesToShow;
  const transformWithOffset: number = isMultiPage ? 100 - tileWidth * (tilesToShow + 1) + transform : wrapWithEmptyTiles ? -100 : 0;
  const pages = items.length / tilesToShow;
  const tileList: Tile<T>[] = useMemo(() => {
    return sliceItems<T>(items, isMultiPage, index, tilesToShow, cycleMode);
  }, [items, isMultiPage, index, tilesToShow, cycleMode]);

  const transitionBasis: string = isMultiPage && isAnimated && isAnimationRunning ? `transform ${transitionTime} ease` : '';

  const needControls: boolean = showControls && isMultiPage;
  const showLeftControl: boolean = needControls && !(cycleMode === 'stop' && index === 0);
  const showRightControl: boolean = needControls && !(cycleMode === 'stop' && index === items.length - tilesToShow);

  const slide = useCallback(
    (direction: Direction): void => {
      // Debounce slide events based on if the animation is running
      if (isAnimationRunning) {
        return;
      }

      const directionFactor = direction === 'right' ? 1 : -1;
      let nextIndex: number = index + tilesToShow * directionFactor;

      if (nextIndex < 0) {
        if (cycleMode === 'stop') nextIndex = 0;
        if (cycleMode === 'restart') nextIndex = index === 0 ? 0 - tilesToShow : 0;
      }

      if (nextIndex > items.length - tilesToShow) {
        if (cycleMode === 'stop') nextIndex = items.length - tilesToShow;
        if (cycleMode === 'restart') nextIndex = index >= items.length - tilesToShow ? items.length : items.length - tilesToShow;
      }

      const steps: number = Math.abs(index - nextIndex);
      const movement: number = steps * tileWidth * (0 - directionFactor);

      setSlideToIndex(nextIndex);
      setTransform(-100 + movement);

      // If this is an animated slider, start the animation 'slide'
      if (isAnimated) {
        setIsAnimationRunning(true);
      }
      // If not anmiated, trigger the post animation code right away
      else {
        setIsAnimationDone(true);
      }
    },
    [isAnimated, cycleMode, index, items.length, tileWidth, tilesToShow, isAnimationRunning],
  );

  const handleTouchStart = useCallback(
    (event: React.TouchEvent): void => {
      const touchPosition: Position = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };

      function handleTouchMove(this: Document, event: TouchEvent): void {
        const newPosition: Position = {
          x: event.changedTouches[0].clientX,
          y: event.changedTouches[0].clientY,
        };
        const movementX: number = Math.abs(newPosition.x - touchPosition.x);
        const movementY: number = Math.abs(newPosition.y - touchPosition.y);

        if (movementX > movementY && movementX > 10) {
          event.preventDefault();
          event.stopPropagation();
        }
      }

      function handleTouchEnd(this: Document, event: TouchEvent): void {
        const newPosition = {
          x: event.changedTouches[0].clientX,
          y: event.changedTouches[0].clientY,
        };

        const movementX: number = Math.abs(newPosition.x - touchPosition.x);
        const movementY: number = Math.abs(newPosition.y - touchPosition.y);
        const direction: Direction = newPosition.x < touchPosition.x ? 'right' : 'left';

        if (movementX > minimalTouchMovement && movementX > movementY) {
          slide(direction);
        }

        cleanup();
      }

      function handleTouchCancel() {
        cleanup();
      }

      function cleanup() {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('touchcancel', handleTouchCancel);
      }

      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      document.addEventListener('touchcancel', handleTouchCancel);
    },
    [minimalTouchMovement, slide],
  );

  // Run code after the slide animation to set the new index
  useLayoutEffect(() => {
    const postAnimationCleanup = (): void => {
      let resetIndex: number = slideToIndex;

      resetIndex = resetIndex >= items.length ? slideToIndex - items.length : resetIndex;
      resetIndex = resetIndex < 0 ? items.length + slideToIndex : resetIndex;

      if (resetIndex !== slideToIndex) {
        setSlideToIndex(resetIndex);
      }

      setIndex(resetIndex);
      setTransform(-100);
      setIsAnimationRunning(false);
      setIsAnimationDone(false);
    };

    if (isAnimationDone) {
      postAnimationCleanup();
    }
  }, [isAnimationDone, index, items.length, slideToIndex, tileWidth, tilesToShow, transitionBasis]);

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLUListElement>) => {
    if (event.target === frameRef.current) {
      setIsAnimationDone(true);
    }
  };

  const ulStyle = {
    transform: `translate3d(${transformWithOffset}%, 0, 0)`,
    // prettier-ignore
    'WebkitTransform': `translate3d(${transformWithOffset}%, 0, 0)`,
    transition: transitionBasis,
    marginLeft: -spacing / 2,
    marginRight: -spacing / 2,
  };

  const slideOffset = index - slideToIndex;

  const paginationDots = () => {
    if (showDots && isMultiPage && !!renderPaginationDots) {
      const length = pages;

      return (
        <div className={styles.dots}>
          {Array.from({ length }, (_, pageIndex) => {
            return renderPaginationDots(index, pageIndex);
          })}
        </div>
      );
    }
  };

  return (
    <div>
      <div className={styles.tileDock}>
        {showLeftControl && !!renderLeftControl && <div className={styles.leftControl}>{renderLeftControl(() => slide('left'))}</div>}
        <ul ref={frameRef} style={ulStyle} onTouchStart={handleTouchStart} onTransitionEnd={handleTransitionEnd}>
          {wrapWithEmptyTiles ? (
            <li
              className={styles.emptyTile}
              style={{
                width: `${tileWidth}%`,
                paddingLeft: spacing / 2,
                paddingRight: spacing / 2,
                boxSizing: 'border-box',
              }}
            />
          ) : null}
          {tileList.map((tile: Tile<T>, listIndex) => {
            const isInView = !isMultiPage || (listIndex > tilesToShow - slideOffset && listIndex < tilesToShow * 2 + 1 - slideOffset);

            return (
              <li
                key={tile.key}
                className={classNames({ [styles.notInView]: !isInView })}
                style={{
                  width: `${tileWidth}%`,
                  paddingLeft: spacing / 2,
                  paddingRight: spacing / 2,
                  boxSizing: 'border-box',
                  transition: !isInView ? 'opacity .2s ease-in 0s' : '',
                }}
              >
                {renderTile(tile.item, isInView)}
              </li>
            );
          })}
          {wrapWithEmptyTiles ? (
            <li
              className={styles.emptyTile}
              style={{
                width: `${tileWidth}%`,
                paddingLeft: spacing / 2,
                paddingRight: spacing / 2,
                boxSizing: 'border-box',
              }}
            />
          ) : null}
        </ul>
        {showRightControl && !!renderRightControl && <div className={styles.rightControl}>{renderRightControl(() => slide('right'))}</div>}
      </div>
      {paginationDots()}
    </div>
  );
}

export default TileDock;
