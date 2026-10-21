import { createContext, useContext } from 'react'

export type DialogContextValue = {
  confirm: (message: string, title?: string) => Promise<boolean>
  notify: (message: string, severity?: 'error' | 'warning' | 'info' | 'success') => void
}

export const DialogContext = createContext<DialogContextValue | null>(null)

export function useDialogs() {
  const ctx = useContext(DialogContext)
  if (!ctx) throw new Error('useDialogs must be used inside DialogProvider')
  return ctx
}
