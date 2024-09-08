import {
  EuiButton,
  EuiCallOut,
  EuiLink,
  EuiPanel,
  EuiSpacer,
} from '@elastic/eui';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import {
  usePlayCharacter,
  useRemoveCharacter,
  useSaveCharacter,
} from '../../../hooks/characters.jsx';
import { usePubSub } from '../../../hooks/pubsub.jsx';
import { runInBackground } from '../../../lib/async/run-in-background.js';
import type { Character } from '../../../types/game.types.js';
import { SidebarId } from '../../../types/sidebar.types.js';
import { TableListCharacters } from '../characters/table-list-characters.jsx';
import type { ModalAddCharacterConfirmData } from './modal-add-character.jsx';
import { ModalAddCharacter } from './modal-add-character.jsx';
import { ModalEditCharacter } from './modal-edit-character.jsx';
import {
  ModalRemoveCharacter,
  type ModalRemoveCharacterConfirmData,
} from './modal-remove-character.jsx';

export const SidebarItemCharacters: React.FC = (): ReactNode => {
  const { publish } = usePubSub();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  // Hooks to manage characters.
  const playCharacter = usePlayCharacter();
  const saveCharacter = useSaveCharacter();
  const removeCharacter = useRemoveCharacter();

  // The contextual character being managed.
  const [character, setCharacter] = useState<Character>();

  const switchToSidebarAccounts = useCallback(() => {
    publish('sidebar:show', SidebarId.Accounts);
  }, [publish]);

  const closeModals = useCallback(() => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowRemoveModal(false);
    setCharacter(undefined);
  }, []);

  const onAddCharacterClick = useCallback(() => {
    closeModals();
    setShowAddModal(true);
  }, [closeModals]);

  const onEditCharacterClick = useCallback(
    (character: Character) => {
      closeModals();
      setCharacter(character);
      setShowEditModal(true);
    },
    [setCharacter, closeModals]
  );

  const onRemoveCharacterClick = useCallback(
    (character: Character) => {
      closeModals();
      setCharacter(character);
      setShowRemoveModal(true);
    },
    [setCharacter, closeModals]
  );

  const onPlayCharacterClick = useCallback(
    (character: Character) => {
      closeModals();
      setCharacter(character);
      // TODO play the character
      alert('Play character: ' + character.characterName);
    },
    [setCharacter, closeModals]
  );

  const onCharacterSaveConfirm = useCallback(
    (data: ModalAddCharacterConfirmData) => {
      closeModals();
      runInBackground(async () => {
        await saveCharacter({
          accountName: data.accountName,
          characterName: data.characterName,
          gameCode: data.gameCode,
        });
      });
    },
    [closeModals, saveCharacter]
  );

  const onCharacterRemoveConfirm = useCallback(
    (data: ModalRemoveCharacterConfirmData) => {
      closeModals();
      runInBackground(async () => {
        await removeCharacter({
          accountName: data.accountName,
          characterName: data.characterName,
          gameCode: data.gameCode,
        });
      });
    },
    [closeModals, removeCharacter]
  );

  return (
    <EuiPanel>
      <EuiCallOut title="My Characters" iconType="user" size="s">
        Use the{' '}
        <EuiLink onClick={switchToSidebarAccounts}>Accounts menu</EuiLink> to
        add your DragonRealms accounts, then add and play your characters here.
      </EuiCallOut>

      <EuiSpacer size="m" />

      <EuiButton size="s" onClick={() => onAddCharacterClick()}>
        Add Character
      </EuiButton>

      <EuiSpacer size="m" />

      <TableListCharacters
        onPlayCharacterClick={onPlayCharacterClick}
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
  );
};

SidebarItemCharacters.displayName = 'SidebarItemCharacters';
