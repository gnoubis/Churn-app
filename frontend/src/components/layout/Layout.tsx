import React from 'react';
import { Box, useTheme } from '../../mui';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          backgroundColor: theme.palette.background.default,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '200px',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            opacity: 0.05,
            zIndex: 0,
          },
        }}
      >
        <Navbar />
        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 4 },
            position: 'relative',
            zIndex: 1,
            mt: '64px', // Hauteur de la navbar
            backgroundColor: 'transparent',
            overflowY: 'auto',
          }}
          className="fadeIn"
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout; 