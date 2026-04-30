'use client';
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-sky-50 border-sky-200 text-sky-800',
};

const iconStyles = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-sky-500',
};

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 10);
    const hide = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 3500);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [toast.id, onDismiss]);

  const Icon = icons[toast.type];

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border shadow-elevated max-w-sm w-full
        transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${styles[toast.type]}`}
    >
      <Icon size={18} className={`shrink-0 mt-0.5 ${iconStyles[toast.type]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.description && <p className="text-xs mt-0.5 opacity-80">{toast.description}</p>}
      </div>
      <button onClick={() => onDismiss(toast.id)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <ToastItem key={`toast-${t.id}`} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}