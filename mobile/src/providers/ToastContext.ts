import { createContext } from 'react';

export type ToastOptions = {
  description?: string;
  type?: 'default' | 'success' | 'error';
  durationMs?: number;
};

export type ToastContextValue = {
  show: (title: string, opts?: ToastOptions) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);
