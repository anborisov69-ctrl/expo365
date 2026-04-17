"use client";

import { useEffect } from "react";

interface DemoToastProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
}

export function DemoToast({ message, visible, onDismiss }: DemoToastProps) {
  useEffect(() => {
    if (!visible) {
      return;
    }
    const timer = window.setTimeout(() => {
      onDismiss();
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [visible, onDismiss]);

  if (!visible) {
    return null;
  }

  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-expoBlue/20 bg-white px-4 py-3 text-center text-sm text-slate-800 shadow-lg sm:px-5"
    >
      <p>{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-2 text-xs font-medium text-expoOrange underline underline-offset-2"
      >
        Закрыть
      </button>
    </div>
  );
}
