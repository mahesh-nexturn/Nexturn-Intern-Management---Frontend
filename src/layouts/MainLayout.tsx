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
        position: 'fixed',
        inset: 0,
        bgcolor: '#f5f7fb',
        overflow: 'hidden',
      }}
    >
      {collapsed && <Sidebar />}

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Navbar setCollapsed={setCollapsed} collapsed={collapsed} />

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            scrollBehavior: 'smooth',
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
