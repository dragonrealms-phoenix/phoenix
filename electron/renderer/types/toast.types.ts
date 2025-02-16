import type { ReactNode } from 'react';

export interface ToastAddEvent {
  title: string;
  text?: ReactNode;
  type?: 'success' | 'warning' | 'danger' | 'info';
}
