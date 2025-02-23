import { EuiPageTemplate } from '@elastic/eui';
import { type ReactNode, useMemo } from 'react';
import { useMeasure } from '../../hooks/measure.jsx';
import { useWindowSize } from '../../hooks/window-size.jsx';
import type { GridItemContent } from '../../types/grid.types.js';
import { GameBottomBar } from './game-bottom-bar.jsx';
import { GameGrid } from './game-grid.jsx';
import { GameTopBar } from './game-top-bar.jsx';

export interface GameContainerProps {
  contentItems: Array<GridItemContent>;
}

export const GameContainer: React.FC<GameContainerProps> = (
  props: GameContainerProps
): ReactNode => {
  const { contentItems } = props;

  // Calculating the height for the grid is tricky.
  // Something about how `EuiPageTemplate.Section` is styled, the height
  // is not able to be observed or measured. It's always zero.
  // The width, however, does calculate correctly as the page resizes.
  // As a workaround, I take the window height minus other elements in the
  // same column as the grid to approximate the allowed grid height.
  const windowSize = useWindowSize();
  const [topSectionRef, topSectionSize] = useMeasure<HTMLInputElement>();
  const [bottomSectionRef, bottomSectionSize] = useMeasure<HTMLInputElement>();
  const [gridSectionRef, gridSectionSize] = useMeasure<HTMLDivElement>();

  const { height: windowHeight } = windowSize;
  const { height: topSectionHeight } = topSectionSize;
  const { height: bottomSectionHeight } = bottomSectionSize;
  const { width: gridWidth } = gridSectionSize;
  const gridHeight = windowHeight - topSectionHeight - bottomSectionHeight - 1;

  const container = useMemo((): ReactNode => {
    return (
      <EuiPageTemplate
        direction="column"
        paddingSize="s"
        panelled={false}
        grow={true}
        restrictWidth={false}
        responsive={[]}
        css={{ height: '100%', maxWidth: 'unset' }}
      >
        <EuiPageTemplate.Section grow={true} paddingSize="none">
          <div ref={topSectionRef}>
            <GameTopBar />
          </div>
        </EuiPageTemplate.Section>
        <EuiPageTemplate.Section grow={true} paddingSize="none">
          <div ref={gridSectionRef}>
            <GameGrid
              boundary={{
                height: gridHeight,
                width: gridWidth,
              }}
              contentItems={contentItems}
            />
          </div>
        </EuiPageTemplate.Section>
        <EuiPageTemplate.BottomBar paddingSize="none">
          <div ref={bottomSectionRef}>
            <GameBottomBar />
          </div>
        </EuiPageTemplate.BottomBar>
      </EuiPageTemplate>
    );
  }, [
    contentItems,
    gridHeight,
    gridWidth,
    topSectionRef,
    bottomSectionRef,
    gridSectionRef,
  ]);

  return container;
};

GameContainer.displayName = 'GameContainer';
