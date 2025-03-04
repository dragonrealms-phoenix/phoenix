import {
  EuiButton,
  EuiCallOut,
  EuiLink,
  EuiPanel,
  EuiSpacer,
} from '@elastic/eui';
import isEqual from 'lodash-es/isEqual.js';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import type { Character } from '../../../../common/account/types.js';
import { useGetHasAccounts } from '../../../hooks/accounts.jsx';
import {
  usePlayCharacter,
  useQuitCharacter,
  useRemoveCharacter,
  useSaveCharacter,
} from '../../../hooks/characters.jsx';
import { useShowSidebarAccounts } from '../../../hooks/sidebar.jsx';
import { runInBackground } from '../../../lib/async/run-in-background.js';
import { TableListCharacters } from '../characters/table-list-characters.jsx';
import type { ModalAddCharacterConfirmData } from './modal-add-character.jsx';
import { ModalAddCharacter } from './modal-add-character.jsx';
import { ModalEditCharacter } from './modal-edit-character.jsx';
import {
  ModalRemoveCharacter,
  type ModalRemoveCharacterConfirmData,
} from './modal-remove-character.jsx';

export const SidebarItemCharacters: React.FC = (): ReactNode => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showRemoveModal, setShowRemoveModal] = useState<boolean>(false);

  // Has user added any accounts from which to manage characters?
  const hasAccounts = useGetHasAccounts();

  // Hooks to manage characters.
  const playCharacter = usePlayCharacter();
  const quitCharacter = useQuitCharacter();
  const saveCharacter = useSaveCharacter();
  const removeCharacter = useRemoveCharacter();

  // The contextual character being managed.
  const [character, setCharacter] = useState<Character>();

  const showSidebarAccounts = useShowSidebarAccounts();

  const closeModals = useCallback(() => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowRemoveModal(false);
  }, []);

  const onAddCharacterClick = useCallback(() => {
    closeModals();
    setCharacter(undefined);
    setShowAddModal(true);
  }, [closeModals]);

  const onEditCharacterClick = useCallback(
    (character: Character) => {
      closeModals();
      setCharacter(character);
      setShowEditModal(true);
    },
    [closeModals]
  );

  const onRemoveCharacterClick = useCallback(
    (character: Character) => {
      closeModals();
      setCharacter(character);
      setShowRemoveModal(true);
    },
    [closeModals]
  );

  const onPlayCharacterClick = useCallback(
    (character: Character) => {
      runInBackground(async () => {
        closeModals();
        setCharacter(character);
        await playCharacter(character);
      });
    },
    [closeModals, playCharacter]
  );

  const onQuitCharacterClick = useCallback(
    (character: Character) => {
      runInBackground(async () => {
        closeModals();
        setCharacter(character);
        await quitCharacter();
      });
    },
    [closeModals, quitCharacter]
  );

  const onCharacterSaveConfirm = useCallback(
    (data: ModalAddCharacterConfirmData) => {
      runInBackground(async () => {
        // Characters are identified by their attributes.
        // If the user edits the character, that creates a new unique entry.
        // We need to remove the old entry and save the new one.
        if (character) {
          if (!isEqual(character, data)) {
            await removeCharacter({
              accountName: character.accountName,
              characterName: character.characterName,
              gameCode: character.gameCode,
            });
          }
        }
        await saveCharacter({
          accountName: data.accountName,
          characterName: data.characterName,
          gameCode: data.gameCode,
        });
        closeModals();
        setCharacter(undefined);
      });
    },
    [character, closeModals, removeCharacter, saveCharacter]
  );

  const onCharacterRemoveConfirm = useCallback(
    (data: ModalRemoveCharacterConfirmData) => {
      runInBackground(async () => {
        await removeCharacter({
          accountName: data.accountName,
          characterName: data.characterName,
          gameCode: data.gameCode,
        });
      });
      closeModals();
      setCharacter(undefined);
    },
    [closeModals, removeCharacter]
  );

  return (
    <EuiPanel paddingSize="none">
      <EuiCallOut title="My Characters" iconType="user" size="s">
        Use the <EuiLink onClick={showSidebarAccounts}>Accounts menu</EuiLink>{' '}
        to add your DragonRealms accounts, then add and play your characters
        here.
      </EuiCallOut>

      <EuiPanel paddingSize="s" hasShadow={false}>
        <EuiButton
          size="s"
          onClick={() => onAddCharacterClick()}
          disabled={!hasAccounts}
        >
          Add Character
        </EuiButton>

        <EuiSpacer size="m" />

        <TableListCharacters
          onPlayCharacterClick={onPlayCharacterClick}
          onQuitCharacterClick={onQuitCharacterClick}
          onEditCharacterClick={onEditCharacterClick}
          onRemoveCharacterClick={onRemoveCharacterClick}
        />

        <EuiSpacer size="m" />

        {showAddModal && (
          <ModalAddCharacter
            onClose={closeModals}
            onConfirm={onCharacterSaveConfirm}
          />
        )}

        {showEditModal && character && (
          <ModalEditCharacter
            initialData={character}
            onClose={closeModals}
            onConfirm={onCharacterSaveConfirm}
          />
        )}

        {showRemoveModal && character && (
          <ModalRemoveCharacter
            initialData={character}
            onClose={closeModals}
            onConfirm={onCharacterRemoveConfirm}
          />
        )}
      </EuiPanel>
    </EuiPanel>
  );
};

SidebarItemCharacters.displayName = 'SidebarItemCharacters';
