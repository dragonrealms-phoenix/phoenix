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
import isEqual from 'lodash-es/isEqual.js';
import isNil from 'lodash-es/isNil.js';
import type { ReactElement, ReactNode } from 'react';
import { Fragment, memo, useMemo } from 'react';
import type { Character } from '../../../../common/account/types.js';
import { GameCodeMetaMap } from '../../../../common/game/types.js';
import {
  useListCharacters,
  usePlayingCharacter,
} from '../../../hooks/characters.jsx';

interface TableByGameCode {
  gameCode: string; // e.g. 'DR'
  gameLabel: string; // e.g. 'Prime'
  component: ReactElement; // component to render the table
}

export interface TableListCharactersProps {
  onPlayCharacterClick: (character: Character) => void;
  onQuitCharacterClick: (character: Character) => void;
  onEditCharacterClick: (character: Character) => void;
  onRemoveCharacterClick: (character: Character) => void;
}

export const TableListCharacters: React.FC<TableListCharactersProps> = memo(
  (props: TableListCharactersProps): ReactNode => {
    const {
      onPlayCharacterClick,
      onQuitCharacterClick,
      onEditCharacterClick,
      onRemoveCharacterClick,
    } = props;

    // All characters to display.
    const characters = useListCharacters();

    // Which character is currently being played?
    const playingCharacter = usePlayingCharacter();

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
                  {isEqual(playingCharacter, character) ? (
                    <EuiToolTip content="Quit" position="bottom">
                      <EuiButtonIcon
                        aria-label="Quit"
                        iconType="stopFilled"
                        display="base"
                        color="accent"
                        onClick={() => onQuitCharacterClick(character)}
                      />
                    </EuiToolTip>
                  ) : (
                    <EuiToolTip content="Play" position="bottom">
                      <EuiButtonIcon
                        aria-label="Play"
                        iconType="playFilled"
                        display="base"
                        color="success"
                        onClick={() => onPlayCharacterClick(character)}
                      />
                    </EuiToolTip>
                  )}
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiToolTip content="Edit" position="bottom">
                    <EuiButtonIcon
                      aria-label="Edit"
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
    }, [
      playingCharacter,
      onPlayCharacterClick,
      onQuitCharacterClick,
      onEditCharacterClick,
      onRemoveCharacterClick,
    ]);

    // Create a table for each game code that has characters.
    const tablesByGameCode = useMemo<Array<TableByGameCode>>(() => {
      return Object.entries(GameCodeMetaMap)
        .map(([gameCode, gameMeta]) => {
          const { name: gameLabel } = gameMeta;
          const characters = charactersByGameCode[gameCode];
          if (characters?.length > 0) {
            return {
              gameCode,
              gameLabel,
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
