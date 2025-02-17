import type { ReactNode } from 'react';

export interface ToastAddMessage {
  title: string;
  text?: ReactNode;
  type?: 'success' | 'warning' | 'danger' | 'info';
}
