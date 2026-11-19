import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Toasts, type ToastMsg } from './kit';

const T = createContext<(text: string, undo?: () => void) => void>(() => {});
export const useToast = () => useContext(T);
let n = 0;
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastMsg[]>([]);
  const dismiss = useCallback((id: number) => setItems((l) => l.filter((x) => x.id !== id)), []);
  const push = useCallback((text: string, undo?: () => void) => setItems((l) => [...l.slice(-1), { id: ++n, text, undo }]), []);
  return <T.Provider value={push}>{children}<Toasts items={items} dismiss={dismiss} /></T.Provider>;
}
