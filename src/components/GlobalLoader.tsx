import { useEffect, useState, useSyncExternalStore } from 'react'
import { Backdrop, CircularProgress } from '@mui/material'
import { hasPendingRequests, subscribeToLoading } from '../services/loadingStore'

// Wait briefly before showing so fast requests don't flash a spinner.
const SHOW_DELAY_MS = 250

function GlobalLoader() {
  const loading = useSyncExternalStore(subscribeToLoading, hasPendingRequests)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!loading) {
      const hide = setTimeout(() => setVisible(false), 0)
      return () => clearTimeout(hide)
    }
    const show = setTimeout(() => setVisible(true), SHOW_DELAY_MS)
    return () => clearTimeout(show)
  }, [loading])

  return (
    <Backdrop
      open={visible}
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.modal + 1, bgcolor: 'rgba(0,0,0,0.25)' }}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  )
}

export default GlobalLoader
