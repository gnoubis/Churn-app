import React from 'react';
import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import Sidebar from '../components/navigation/Sidebar';

const DashboardLayout: React.FC = () => {
  const [open, setOpen] = React.useState(true);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar open={open} toggleDrawer={toggleDrawer} />
      <Sidebar open={open} />
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) => theme.palette.background.default,
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          pt: 8, // Pour compenser la hauteur de la barre de navigation
        }}
      >
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardLayout; 