import { EuiCode, EuiConfirmModal } from '@elastic/eui';
import type { ReactNode } from 'react';
import { useCallback } from 'react';

export interface ModalRemoveCharacterInitialData {
  accountName: string;
  characterName: string;
  gameCode: string;
}

export interface ModalRemoveCharacterConfirmData {
  accountName: string;
  characterName: string;
  gameCode: string;
}

export interface ModalRemoveCharacterProps {
  initialData: ModalRemoveCharacterInitialData;
  onClose: () => void;
  onConfirm: (data: ModalRemoveCharacterConfirmData) => void;
}

export const ModalRemoveCharacter: React.FC<ModalRemoveCharacterProps> = (
  props: ModalRemoveCharacterProps
): ReactNode => {
  const { initialData, onClose, onConfirm } = props;

  const onModalClose = useCallback(
    (_event?: React.UIEvent) => {
      onClose();
    },
    [onClose]
  );

  const onModalConfirm = useCallback(
    (_event: React.UIEvent) => {
      onConfirm(initialData);
    },
    [initialData, onConfirm]
  );

  return (
    <EuiConfirmModal
      title={<>Remove character?</>}
      onCancel={onModalClose}
      onConfirm={onModalConfirm}
      cancelButtonText="Cancel"
      confirmButtonText="Remove"
      buttonColor="danger"
      defaultFocusedButton="cancel"
    >
      <EuiCode>{initialData.characterName}</EuiCode>
    </EuiConfirmModal>
  );
};

ModalRemoveCharacter.displayName = 'ModalRemoveCharacter';
