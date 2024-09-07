import type { EuiBasicTableColumn } from '@elastic/eui';
import {
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable,
  EuiSpacer,
  EuiTitle,
  EuiToolTip,
} from '@elastic/eui';
import groupBy from 'lodash-es/groupBy.js';
import isNil from 'lodash-es/isNil.js';
import type { ReactElement, ReactNode } from 'react';
import { Fragment, memo, useMemo } from 'react';
import { useListCharacters } from '../../../hooks/characters.jsx';
import type { Character } from '../../../types/game.types.js';

const GAME_CODE_LABELS: Record<string, string> = {
  DR: 'Prime',
  DRX: 'Platinum',
  DRF: 'Fallen',
  DRT: 'Test',
  DRD: 'Development',
};

interface TableByGameCode {
  gameCode: string; // e.g. 'DR'
  gameLabel: string; // e.g. 'Prime'
  component: ReactElement; // component to render the table
}

export interface TableListCharactersProps {
  onPlayCharacterClick: (character: Character) => void;
  onEditCharacterClick: (character: Character) => void;
  onRemoveCharacterClick: (character: Character) => void;
}

export const TableListCharacters: React.FC<TableListCharactersProps> = memo(
  (props: TableListCharactersProps): ReactNode => {
    const {
      onPlayCharacterClick,
      onEditCharacterClick,
      onRemoveCharacterClick,
    } = props;

    // All characters to display.
    const characters = useListCharacters();

    // We'll display the characters grouped by game code.
    const charactersByGameCode = useMemo(() => {
      return groupBy(characters, 'gameCode');
    }, [characters]);

    const columns = useMemo<Array<EuiBasicTableColumn<Character>>>(() => {
      return [
        {
          field: 'characterName',
          name: 'Name',
          dataType: 'string',
          truncateText: true,
        },
        {
          field: 'accountName',
          name: 'Account',
          dataType: 'string',
          truncateText: true,
        },
        {
          field: 'actions',
          name: 'Actions',
          width: '30%',
          render: (_value: unknown, character: Character) => {
            return (
              <EuiFlexGroup
                responsive={true}
                gutterSize="s"
                alignItems="center"
              >
                <EuiFlexItem grow={false}>
                  <EuiToolTip content="Play" position="bottom">
                    <EuiButtonIcon
                      aria-label="Play"
                      iconType="play"
                      display="base"
                      color="success"
                      onClick={() => onPlayCharacterClick(character)}
                    />
                  </EuiToolTip>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiToolTip content="Rename" position="bottom">
                    <EuiButtonIcon
                      aria-label="Rename"
                      iconType="pencil"
                      display="base"
                      color="warning"
                      onClick={() => onEditCharacterClick(character)}
                    />
                  </EuiToolTip>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiToolTip content="Remove" position="bottom">
                    <EuiButtonIcon
                      aria-label="Remove"
                      iconType="cross"
                      display="base"
                      color="danger"
                      onClick={() => onRemoveCharacterClick(character)}
                    />
                  </EuiToolTip>
                </EuiFlexItem>
              </EuiFlexGroup>
            );
          },
        },
      ];
    }, [onPlayCharacterClick, onEditCharacterClick, onRemoveCharacterClick]);

    // Create a table for each game code that has characters.
    const tablesByGameCode = useMemo<Array<TableByGameCode>>(() => {
      return Object.keys(GAME_CODE_LABELS)
        .map((gameCode) => {
          const characters = charactersByGameCode[gameCode];
          if (characters?.length > 0) {
            return {
              gameCode,
              gameLabel: GAME_CODE_LABELS[gameCode],
              component: (
                <EuiInMemoryTable
                  key={gameCode}
                  items={characters}
                  columns={columns}
                />
              ),
            };
          }
        })
        .filter((table): table is NonNullable<TableByGameCode> => {
          return !isNil(table);
        });
    }, [charactersByGameCode, columns]);

    return (
      <>
        {tablesByGameCode.map(({ gameCode, gameLabel, component }) => {
          return (
            <Fragment key={gameCode}>
              <EuiTitle size="s">
                <h3>{gameLabel}</h3>
              </EuiTitle>
              {component}
              <EuiSpacer size="l" />
            </Fragment>
          );
        })}
      </>
    );
  }
);

TableListCharacters.displayName = 'TableListCharacters';
