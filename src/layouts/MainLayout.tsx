import { Box } from '@mui/material'
import React from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

type Props = {
  children: React.ReactNode
}

function MainLayout({ children }: Props) {
  const [collapsed, setCollapsed] = React.useState(true)
  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        bgcolor: '#f5f7fb',
        overflow: 'hidden',
      }}
    >
      {collapsed && <Sidebar />}

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Navbar setCollapsed={setCollapsed} collapsed={collapsed} />

        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 3,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default MainLayout
