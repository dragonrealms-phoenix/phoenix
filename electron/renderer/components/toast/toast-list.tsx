import { EuiGlobalToastList } from '@elastic/eui';
import type { Toast } from '@elastic/eui/src/components/toast/global_toast_list';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { useLogger } from '../../hooks/logger.jsx';
import { useSubscribe } from '../../hooks/pubsub.jsx';

export interface ToastListProps {
  /**
   * How long the toast should be displayed in milliseconds.
   * Default is 5000ms.
   */
  toastLifeTimeMs?: number;
}

export interface ToastAddEvent {
  title: string;
  text?: ReactNode;
  type?: 'success' | 'warning' | 'danger' | 'info';
}

export const ToastList: React.FC<ToastListProps> = (
  props: ToastListProps
): ReactNode => {
  const { toastLifeTimeMs = 5000 } = props;

  const logger = useLogger('renderer:cmp:toast-list');

  const [toasts, setToasts] = useState<Array<Toast>>([]);

  useSubscribe(['toast:add'], (toastAddEvent: ToastAddEvent) => {
    const { title, text, type } = toastAddEvent;

    // let iconType: EuiIconType | undefined;
    let color: Toast['color'] | undefined;

    switch (type) {
      case 'success':
        // iconType = 'check';
        color = 'success';
        break;
      case 'warning':
        // iconType = 'warning';
        color = 'warning';
        break;
      case 'danger':
        // iconType = 'error';
        color = 'danger';
        break;
      case 'info':
        // iconType = 'iInCircle';
        color = 'primary';
        break;
    }

    const toast: Toast = {
      id: uuid(),
      title,
      text,
      // iconType,
      color,
    };

    logger.debug('add toast', {
      toast,
    });

    setToasts((prevToasts) => {
      return [...prevToasts, toast];
    });
  });

  // Callback to actually remove the toast from the list.
  const onDismissToast = (toastToRemove: Toast) => {
    logger.debug('dismiss toast', {
      toast: toastToRemove,
    });

    setToasts((prevToasts) => {
      return prevToasts.filter((toast) => {
        return toast.id !== toastToRemove.id;
      });
    });
  };

  // Callback to notify that the user has cleared all toasts.
  // For each toast that was cleared, `onDismissToast` was called already.
  // Nothing to actually do here, just log it.
  const onClearAllToasts = () => {
    logger.debug('clear all toasts');
  };

  return (
    <EuiGlobalToastList
      toasts={toasts}
      toastLifeTimeMs={toastLifeTimeMs}
      dismissToast={onDismissToast}
      onClearAllToasts={onClearAllToasts}
      side="left"
    />
  );
};

ToastList.displayName = 'ToastList';
