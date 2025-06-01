import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <Container maxWidth="md">
        <Box textAlign="center">
          <Typography variant="h1" component="h1" gutterBottom>
            404
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            Page non trouvée
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            La page que vous recherchez n'existe pas ou a été déplacée.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard')}
            sx={{ mt: 2 }}
          >
            Retour au tableau de bord
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default NotFound; 