import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'

import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

import AddNotificationDialog from '../components/AddNotificationDialog'
import NotificationChart from '../components/NotificationChart'
import type { Notification } from '../types'
import type { notificationApi } from '../services'
import { useDialogs } from '../context/dialogState'
import { useNotifications } from '../hooks/useAppData'
import {
  useCreateNotificationMutation,
  useDeleteNotificationMutation,
  useListNotificationsQuery,
  useMarkNotificationReadMutation,
  useUpdateNotificationMutation,
} from '../store'

type Role = 'HR' | 'MENTOR' | 'INTERN' | null

function todayString() {
  return new Date().toISOString().split('T')[0]
}

function Notifications() {
  const { confirm } = useDialogs()
  const role = sessionStorage.getItem('role') as Role
  const userName = sessionStorage.getItem('name') || ''
  const currentUserId = Number(sessionStorage.getItem('userId') || '0')
  const isHr = role === 'HR'
  const navigate = useNavigate()

  const { notifications } = useNotifications()
  const { isError: loadFailed } = useListNotificationsQuery()
  const [createNotification] = useCreateNotificationMutation()
  const [updateNotification] = useUpdateNotificationMutation()
  const [removeNotification] = useDeleteNotificationMutation()
  const [markNotificationRead] = useMarkNotificationReadMutation()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(
    null,
  )

  const [selectedNotification, setSelectedNotification] = useState<Notification>({
    id: 0,
    title: '',
    message: '',
    recipient: 'All',
    createdBy: userName,
    createdByUserId: currentUserId || null,
    date: todayString(),
    status: 'Unread',
  })

  const activeToast =
    toast ??
    (loadFailed ? { message: 'Failed to load notifications.', severity: 'error' as const } : null)

  const filteredNotifications = useMemo(
    () =>
      notifications
        .filter((notification) =>
          notification.title.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        .filter((notification) => statusFilter === 'All' || notification.status === statusFilter),
    [notifications, searchTerm, statusFilter],
  )

  const total = notifications.length
  const unread = notifications.filter((notification) => notification.status === 'Unread').length
  const read = notifications.filter((notification) => notification.status === 'Read').length
  const today = notifications.filter((notification) => notification.date === todayString()).length

  const handleOpen = () => {
    setEditId(null)
    setSelectedNotification({
      id: 0,
      title: '',
      message: '',
      recipient: 'All',
      createdBy: userName,
      createdByUserId: currentUserId || null,
      date: todayString(),
      status: 'Unread',
    })
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const saveNotification = async (notification: Notification) => {
    const payload: notificationApi.NotificationPayload = {
      title: notification.title,
      message: notification.message,
      recipient: notification.recipient,
    }

    try {
      if (editId !== null) {
        await updateNotification({ id: editId, payload }).unwrap()
        setToast({ message: 'Notification updated successfully.', severity: 'success' })
      } else {
        await createNotification(payload).unwrap()
        setToast({ message: 'Notification created successfully.', severity: 'success' })
      }

      setEditId(null)
      setOpen(false)
    } catch {
      setToast({ message: 'Failed to save notification.', severity: 'error' })
    }
  }

  const editNotification = (index: number) => {
    const notification = filteredNotifications[index]
    setEditId(notification.id)
    setSelectedNotification(notification)
    setOpen(true)
  }

  const deleteNotification = async (index: number) => {
    const notification = filteredNotifications[index]

    if (!(await confirm(`Delete notification "${notification.title}"?`))) {
      return
    }

    try {
      await removeNotification(notification.id).unwrap()
      setToast({ message: 'Notification deleted successfully.', severity: 'success' })
    } catch {
      setToast({ message: 'Failed to delete notification.', severity: 'error' })
    }
  }

  const openNotification = async (notification: Notification) => {
    if (notification.status === 'Unread') {
      try {
        await markNotificationRead(notification.id).unwrap()
        window.dispatchEvent(new Event('notifications-changed'))
      } catch {
        // navigation should still work if marking read fails
      }
    }

    if (notification.link) navigate(notification.link)
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Notifications</Typography>

        {isHr && (
          <Button variant="contained" onClick={handleOpen}>
            Add Notification
          </Button>
        )}
      </Box>

      <NotificationChart total={total} unread={unread} read={read} today={today} />

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          label="Search Notification"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Unread">Unread</MenuItem>
            <MenuItem value="Read">Read</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Recipient</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              {isHr && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredNotifications.length === 0 ? (
              <TableRow>
                <TableCell align="center" colSpan={isHr ? 7 : 6}>
                  No notifications found.
                </TableCell>
              </TableRow>
            ) : (
              filteredNotifications.map((notification, index) => (
                <TableRow
                  key={notification.id}
                  hover={!!notification.link}
                  onClick={() => openNotification(notification)}
                  sx={{ cursor: notification.link ? 'pointer' : 'default' }}
                >
                  <TableCell
                    sx={
                      notification.link
                        ? { color: 'primary.main', textDecoration: 'underline' }
                        : undefined
                    }
                  >
                    {notification.title}
                  </TableCell>
                  <TableCell>{notification.message}</TableCell>
                  <TableCell>{notification.recipient}</TableCell>
                  <TableCell>{notification.createdBy || '-'}</TableCell>
                  <TableCell>{notification.date}</TableCell>
                  <TableCell>
                    <Chip
                      label={notification.status}
                      color={notification.status === 'Unread' ? 'warning' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  {isHr && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <IconButton color="primary" onClick={() => editNotification(index)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => deleteNotification(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AddNotificationDialog
        open={open}
        handleClose={handleClose}
        addNotification={saveNotification}
        selectedNotification={selectedNotification}
      />

      <Snackbar
        open={!!activeToast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setToast(null)} severity={activeToast?.severity} variant="filled">
          {activeToast?.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default Notifications
