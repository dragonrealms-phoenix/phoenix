import {
  EuiConfirmModal,
  EuiFieldPassword,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
} from '@elastic/eui';
import { useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { runInBackground } from '../../../lib/async/run-in-background.js';

export interface ModalAddAccountInitialData {
  accountName?: string;
  accountPassword?: string;
}

export interface ModalAddAccountConfirmData {
  accountName: string;
  accountPassword: string;
}

export interface ModalAddAccountProps {
  initialData?: ModalAddAccountInitialData;
  onClose: () => void;
  onConfirm: (data: ModalAddAccountConfirmData) => void;
}

export const ModalAddAccount: React.FC<ModalAddAccountProps> = (
  props: ModalAddAccountProps
): ReactNode => {
  const { initialData, onClose, onConfirm } = props;

  const form = useForm<ModalAddAccountConfirmData>();

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
          (data: ModalAddAccountConfirmData) => {
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
      title="Add Account"
      onCancel={onModalClose}
      onConfirm={onModalConfirm}
      cancelButtonText="Cancel"
      confirmButtonText="Save"
      buttonColor="primary"
    >
      <EuiForm component="form">
        <EuiFormRow
          label="Name"
          isInvalid={!!form.formState.errors.accountName}
        >
          <Controller
            name="accountName"
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
          label="Password"
          isInvalid={!!form.formState.errors.accountPassword}
        >
          <Controller
            name="accountPassword"
            control={form.control}
            rules={{ required: true }}
            render={({ field, fieldState }) => {
              return (
                <EuiFieldPassword
                  name={field.name}
                  defaultValue={field.value}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  isInvalid={fieldState.invalid}
                  type="dual"
                />
              );
            }}
          />
        </EuiFormRow>
      </EuiForm>
    </EuiConfirmModal>
  );
};

ModalAddAccount.displayName = 'ModalAddAccount';
