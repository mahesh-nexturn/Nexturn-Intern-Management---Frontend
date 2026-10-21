import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from '@mui/material'

import { DialogContext, type DialogContextValue } from './dialogState'

type ConfirmState = { message: string; title: string } | null
type NotifyState = { message: string; severity: 'error' | 'warning' | 'info' | 'success' } | null

export function DialogProvider({ children }: { children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<ConfirmState>(null)
  const [notifyState, setNotifyState] = useState<NotifyState>(null)
  const resolver = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback<DialogContextValue['confirm']>((message, title = 'Confirm') => {
    return new Promise<boolean>((resolve) => {
      resolver.current?.(false)
      resolver.current = resolve
      setConfirmState({ message, title })
    })
  }, [])

  const notify = useCallback<DialogContextValue['notify']>((message, severity = 'warning') => {
    setNotifyState({ message, severity })
  }, [])

  const close = (result: boolean) => {
    resolver.current?.(result)
    resolver.current = null
    setConfirmState(null)
  }

  const value = useMemo(() => ({ confirm, notify }), [confirm, notify])

  return (
    <DialogContext.Provider value={value}>
      {children}

      <Dialog open={!!confirmState} onClose={() => close(false)}>
        <DialogTitle>{confirmState?.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmState?.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => close(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => close(true)}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!notifyState}
        autoHideDuration={4000}
        onClose={() => setNotifyState(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ zIndex: (theme) => theme.zIndex.snackbar + 1 }}
      >
        <Alert
          onClose={() => setNotifyState(null)}
          severity={notifyState?.severity}
          variant="filled"
        >
          {notifyState?.message}
        </Alert>
      </Snackbar>
    </DialogContext.Provider>
  )
}
