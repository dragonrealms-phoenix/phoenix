import { EuiConfirmModal } from '@elastic/eui';
import { type ReactNode, useCallback } from 'react';
import { useListCharacters } from '../../../hooks/list-characters.jsx';

export interface ModalRemoveAccountInitialData {
  accountName: string;
}

export interface ModalRemoveAccountConfirmData {
  accountName: string;
}

export interface ModalRemoveAccountProps {
  initialData: ModalRemoveAccountInitialData;
  onClose: () => void;
  onConfirm: (data: ModalRemoveAccountConfirmData) => void;
}

export const ModalRemoveAccount: React.FC<ModalRemoveAccountProps> = (
  props: ModalRemoveAccountProps
): ReactNode => {
  const { initialData, onClose, onConfirm } = props;

  const characters = useListCharacters({
    accountName: initialData.accountName,
  });

  const onModalClose = useCallback(
    (_event?: React.UIEvent) => {
      onClose();
    },
    [onClose]
  );

  const onModalConfirm = useCallback(
    (_event: React.UIEvent) => {
      onConfirm({ accountName: initialData.accountName });
    },
    [initialData, onConfirm]
  );

  return (
    <EuiConfirmModal
      title={<>Log out of account {initialData.accountName}?</>}
      onCancel={onModalClose}
      onConfirm={onModalConfirm}
      cancelButtonText="Cancel"
      confirmButtonText="Log out"
      buttonColor="danger"
      defaultFocusedButton="cancel"
    >
      Associated characters will also be removed.
      <ul>
        {characters.map(({ characterName }) => {
          return <li key={characterName}>{characterName}</li>;
        })}
      </ul>
    </EuiConfirmModal>
  );
};

ModalRemoveAccount.displayName = 'ModalRemoveAccount';
