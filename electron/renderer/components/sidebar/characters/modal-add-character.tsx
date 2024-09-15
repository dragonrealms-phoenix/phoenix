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

export interface ModalAddCharacterInitialData {
  accountName?: string;
  characterName?: string;
  gameCode?: string;
}

export interface ModalAddCharacterConfirmData {
  accountName: string;
  characterName: string;
  gameCode: string;
}

export interface ModalAddCharacterProps {
  initialData?: ModalAddCharacterInitialData;
  onClose: () => void;
  onConfirm: (data: ModalAddCharacterConfirmData) => void;
}

export const ModalAddCharacter: React.FC<ModalAddCharacterProps> = (
  props: ModalAddCharacterProps
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
        };
      }),
    ];
  }, [accounts]);

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
        };
      }),
    ];
  }, []);

  const form = useForm<ModalAddCharacterConfirmData>();

  useEffect(() => {
    form.reset(initialData);
  }, [form, initialData]);

  const onModalClose = useCallback(
    (_event?: React.BaseSyntheticEvent) => {
      onClose();
    },
    [onClose]
  );

  const onModalConfirm = useCallback(
    (event: React.BaseSyntheticEvent) => {
      runInBackground(async () => {
        const handler = form.handleSubmit(
          (data: ModalAddCharacterConfirmData) => {
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
      title="Add Character"
      onCancel={onModalClose}
      onConfirm={onModalConfirm}
      cancelButtonText="Cancel"
      confirmButtonText="Save"
      buttonColor="primary"
    >
      <EuiForm component="form" onSubmit={onModalConfirm}>
        {/* Hidden submit button to ensure form submission on Enter key press. */}
        {/* Since we are in a confirm modal, we don't have a visible form button. */}
        {/* Otherwise you'd see two buttons, one for form and one for modal. */}
        <button type="submit" hidden={true} />

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

ModalAddCharacter.displayName = 'ModalAddCharacter';
