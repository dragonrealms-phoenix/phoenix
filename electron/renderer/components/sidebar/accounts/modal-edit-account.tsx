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

export interface ModalEditAccountInitialData {
  accountName: string;
  accountPassword?: string;
}

export interface ModalEditAccountConfirmData {
  accountName: string;
  accountPassword: string;
}

export interface ModalEditAccountProps {
  initialData: Partial<ModalEditAccountInitialData>;
  onClose: () => void;
  onConfirm: (data: ModalEditAccountConfirmData) => void;
}

export const ModalEditAccount: React.FC<ModalEditAccountProps> = (
  props: ModalEditAccountProps
): ReactNode => {
  const { initialData, onClose, onConfirm } = props;

  const form = useForm<ModalEditAccountConfirmData>();

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
          (data: ModalEditAccountConfirmData) => {
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
      title="Change Password"
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
                  disabled={true}
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
                  autoFocus={true}
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

ModalEditAccount.displayName = 'ModalEditAccount';
