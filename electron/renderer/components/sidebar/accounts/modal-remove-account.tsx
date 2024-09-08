import { EuiCode, EuiConfirmModal } from '@elastic/eui';
import type { ReactNode } from 'react';
import { useCallback } from 'react';
import { useListCharacters } from '../../../hooks/characters.jsx';

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
      title="Remove account?"
      onCancel={onModalClose}
      onConfirm={onModalConfirm}
      cancelButtonText="Cancel"
      confirmButtonText="Remove"
      buttonColor="danger"
      defaultFocusedButton="cancel"
    >
      <p>
        <EuiCode>{initialData.accountName}</EuiCode>
      </p>

      {characters.length > 0 && (
        <p>
          Associated characters will also be removed:
          <ul>
            {characters.map(({ characterName }) => {
              return (
                <li key={characterName}>
                  <EuiCode>{characterName}</EuiCode>
                </li>
              );
            })}
          </ul>
        </p>
      )}
    </EuiConfirmModal>
  );
};

ModalRemoveAccount.displayName = 'ModalRemoveAccount';
