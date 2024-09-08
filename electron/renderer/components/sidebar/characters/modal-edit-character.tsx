import type { EuiSelectOption } from '@elastic/eui';
import {
  EuiConfirmModal,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiSelect,
} from '@elastic/eui';
import sortBy from 'lodash-es/sortBy.js';
import { useCallback, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useListAccounts } from '../../../hooks/accounts.jsx';
import { runInBackground } from '../../../lib/async/run-in-background.js';
import { GameCodeSelectOptions } from '../../../lib/game/game-code-labels.js';

export interface ModalEditCharacterInitialData {
  accountName: string;
  characterName: string;
  gameCode: string;
}

export interface ModalEditCharacterConfirmData {
  accountName: string;
  characterName: string;
  gameCode: string;
}

export interface ModalEditCharacterProps {
  initialData: Partial<ModalEditCharacterInitialData>;
  onClose: () => void;
  onConfirm: (data: ModalEditCharacterConfirmData) => void;
}

export const ModalEditCharacter: React.FC<ModalEditCharacterProps> = (
  props: ModalEditCharacterProps
): ReactNode => {
  const { initialData, onClose, onConfirm } = props;

  const accounts = useListAccounts();

  const accountNameOptions = useMemo<Array<EuiSelectOption>>(() => {
    const sortedAccounts = sortBy(accounts, 'accountName');
    return [
      {
        text: 'Select an account...',
        value: '',
      },
      ...sortedAccounts.map(({ accountName }) => {
        return {
          text: accountName,
          value: accountName,
          selected: accountName === initialData.accountName,
        };
      }),
    ];
  }, [accounts, initialData]);

  const gameCodeOptions = useMemo<Array<EuiSelectOption>>(() => {
    return [
      {
        text: 'Select an instance...',
        value: '',
      },
      ...GameCodeSelectOptions.map(({ label, value }) => {
        return {
          text: `${label} (${value})`,
          value,
          selected: value === initialData.gameCode,
        };
      }),
    ];
  }, [initialData]);

  const form = useForm<ModalEditCharacterConfirmData>();

  useEffect(() => {
    form.reset(initialData);
  }, [form, initialData]);

  const onModalClose = useCallback(
    (_event?: React.UIEvent) => {
      onClose();
    },
    [onClose]
  );

  const onModalConfirm = useCallback(
    (event: React.UIEvent) => {
      runInBackground(async () => {
        const handler = form.handleSubmit(
          (data: ModalEditCharacterConfirmData) => {
            onConfirm(data);
          }
        );
        await handler(event);
      });
    },
    [form, onConfirm]
  );

  return (
    <EuiConfirmModal
      title="Edit Character"
      onCancel={onModalClose}
      onConfirm={onModalConfirm}
      cancelButtonText="Cancel"
      confirmButtonText="Save"
      buttonColor="primary"
    >
      <EuiForm component="form">
        <EuiFormRow
          label="Name"
          isInvalid={!!form.formState.errors.characterName}
        >
          <Controller
            name="characterName"
            control={form.control}
            rules={{ required: true }}
            render={({ field, fieldState }) => {
              return (
                <EuiFieldText
                  name={field.name}
                  defaultValue={field.value}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  isInvalid={fieldState.invalid}
                  autoFocus={true}
                />
              );
            }}
          />
        </EuiFormRow>
        <EuiFormRow
          label="Account"
          isInvalid={!!form.formState.errors.accountName}
        >
          <Controller
            name="accountName"
            control={form.control}
            rules={{ required: true }}
            render={({ field, fieldState }) => {
              return (
                <EuiSelect
                  name={field.name}
                  defaultValue={field.value}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  isInvalid={fieldState.invalid}
                  options={accountNameOptions}
                />
              );
            }}
          />
        </EuiFormRow>
        <EuiFormRow
          label="Instance"
          isInvalid={!!form.formState.errors.gameCode}
        >
          <Controller
            name="gameCode"
            control={form.control}
            rules={{ required: true }}
            render={({ field, fieldState }) => {
              return (
                <EuiSelect
                  name={field.name}
                  defaultValue={field.value}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  isInvalid={fieldState.invalid}
                  options={gameCodeOptions}
                />
              );
            }}
          />
        </EuiFormRow>
      </EuiForm>
    </EuiConfirmModal>
  );
};

ModalEditCharacter.displayName = 'ModalEditCharacter';
