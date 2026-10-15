import { useState } from 'react'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'

const MAX_BYTES = 5 * 1024 * 1024

function resizeImage(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const side = Math.min(img.width, img.height)
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      canvas
        .getContext('2d')!
        .drawImage(
          img,
          (img.width - side) / 2,
          (img.height - side) / 2,
          side,
          side,
          0,
          0,
          size,
          size,
        )
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Invalid image'))
    }
    img.src = url
  })
}

type Props = {
  open: boolean
  current?: string
  onClose: () => void
  onSave: (dataUrl: string) => void
}

function AvatarUploadDialog({ open, current = '', onClose, onSave }: Props) {
  const [preview, setPreview] = useState(current)
  const [error, setError] = useState('')

  const [prevOpen, setPrevOpen] = useState(open)
  const [prevCurrent, setPrevCurrent] = useState(current)
  if (prevOpen !== open || prevCurrent !== current) {
    setPrevOpen(open)
    setPrevCurrent(current)
    if (open) {
      setPreview(current)
      setError('')
    }
  }

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > MAX_BYTES) {
      setError('Choose an image under 5 MB.')
      return
    }
    try {
      setPreview(await resizeImage(file))
      setError('')
    } catch {
      setError('Could not read that image.')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Upload Photo</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 1 }}>
          <Avatar src={preview || undefined} sx={{ width: 140, height: 140, bgcolor: '#2563eb' }} />
          <Button component="label" variant="outlined" startIcon={<PhotoCameraIcon />}>
            Add Image
            <input hidden type="file" accept="image/*" onChange={onPick} />
          </Button>
          {preview && (
            <Button color="error" size="small" onClick={() => setPreview('')}>
              Remove
            </Button>
          )}
          {error && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => {
            onSave(preview)
            onClose()
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AvatarUploadDialog
