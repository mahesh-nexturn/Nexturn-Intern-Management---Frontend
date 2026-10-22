import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material'

import MenuIcon from '@mui/icons-material/Menu'
import LogoutIcon from '@mui/icons-material/Logout'
import NotificationsIcon from '@mui/icons-material/Notifications'

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useListNotificationsQuery, useMarkNotificationReadMutation } from '../store'
import AvatarUploadDialog from './AvatarUploadDialog'

function Navbar({
  setCollapsed,
  collapsed,
}: {
  setCollapsed: (collapsed: boolean) => void
  collapsed: boolean
}) {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const open = Boolean(anchorEl)

  const [bellAnchor, setBellAnchor] = useState<null | HTMLElement>(null)
  const { data: notifications } = useListNotificationsQuery(undefined, {
    pollingInterval: 60000,
  })
  const unread = useMemo(
    () => notifications?.filter((n) => n.status === 'Unread') ?? [],
    [notifications],
  )
  const [markRead] = useMarkNotificationReadMutation()

  const handleNotificationClick = (id: number) => {
    setBellAnchor(null)
    markRead(id)
    navigate('/notifications')
  }

  const avatarKey = `avatar_${sessionStorage.getItem('userId') ?? 'me'}`
  const [avatar, setAvatar] = useState(localStorage.getItem(avatarKey) || '')
  const [uploadOpen, setUploadOpen] = useState(false)

  useEffect(() => {
    const sync = () => setAvatar(localStorage.getItem(avatarKey) || '')
    window.addEventListener('avatar-changed', sync)
    return () => window.removeEventListener('avatar-changed', sync)
  }, [avatarKey])

  const name = sessionStorage.getItem('name') || 'User'
  const role = sessionStorage.getItem('role') || ''

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleMenuProfile = () => {
    setAnchorEl(null)
    navigate('/profile')
  }

  const handleMenuSettings = () => {
    setAnchorEl(null)
    navigate('/settings')
  }
  const handleLogout = async () => {
    setAnchorEl(null)
    await logout()
    navigate('/')
  }

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: '#ffffff',
        color: '#111827',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton edge="start" color="inherit" onClick={() => setCollapsed(!collapsed)}>
            <MenuIcon />
          </IconButton>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              InternTrack
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {role} Portal
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton color="inherit" onClick={(e) => setBellAnchor(e.currentTarget)}>
            <Badge badgeContent={unread.length} color="error" max={99}>
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Menu
            anchorEl={bellAnchor}
            open={Boolean(bellAnchor)}
            onClose={() => setBellAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { sx: { width: 340, maxHeight: 420 } } }}
          >
            <Typography sx={{ px: 2, py: 1, fontWeight: 700 }}>
              Notifications ({unread.length} unread)
            </Typography>
            <Divider />
            {unread.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 2 }}>
                No unread notifications
              </Typography>
            )}
            {unread.slice(0, 5).map((n) => (
              <MenuItem key={n.id} onClick={() => handleNotificationClick(n.id)}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography noWrap sx={{ fontWeight: 600 }}>
                    {n.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {n.message}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
            <Divider />
            <Box sx={{ px: 1, py: 0.5 }}>
              <Button
                fullWidth
                size="small"
                onClick={() => {
                  setBellAnchor(null)
                  navigate('/notifications')
                }}
              >
                View all notifications
              </Button>
            </Box>
          </Menu>

          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontWeight: 700 }}>{name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {role}
            </Typography>
          </Box>

          <IconButton onClick={handleMenuOpen}>
            <Avatar src={avatar || undefined} sx={{ bgcolor: '#2563eb', fontWeight: 700 }}>
              {name.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
            <MenuItem onClick={handleMenuProfile}>Profile</MenuItem>
            <MenuItem onClick={handleMenuSettings}>Settings</MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>

          <AvatarUploadDialog
            open={uploadOpen}
            current={avatar}
            onClose={() => setUploadOpen(false)}
            onSave={(url) => {
              if (url) localStorage.setItem(avatarKey, url)
              else localStorage.removeItem(avatarKey)
              window.dispatchEvent(new Event('avatar-changed'))
            }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
