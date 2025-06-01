import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Grid,
  TextField,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import authService from '../../services/authService';
import { ElementType } from 'react';

const Profile: React.FC = () => {
  const user = authService.getCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implémenter la mise à jour du profil
    setIsEditing(false);
  };

  if (!user) {
    return <Typography>Utilisateur non connecté</Typography>;
  }

  const getInitials = () => {
    const firstInitial = user.firstName ? user.firstName[0] : '';
    const lastInitial = user.lastName ? user.lastName[0] : '';
    return (firstInitial + lastInitial) || user.username?.[0] || '?';
  };

  const getFullName = () => {
    if (!user.firstName && !user.lastName) {
      return user.username || 'Utilisateur';
    }
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  };

  const GridItem = (props: { component?: ElementType; children: React.ReactNode } & any) => (
    <Grid component={props.component || 'div'} item {...props}>
      {props.children}
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <GridItem xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                margin: '0 auto',
                mb: 2,
                bgcolor: 'primary.main',
              }}
              src={user.avatar}
            >
              {getInitials()}
            </Avatar>
            <Typography variant="h6">
              {getFullName()}
            </Typography>
            <Chip
              label={user.role}
              color="primary"
              sx={{ mt: 1 }}
            />
          </GridItem>

          <GridItem xs={12} md={8}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5">Informations du profil</Typography>
              <Button
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Annuler' : 'Modifier'}
              </Button>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {isEditing ? (
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <GridItem xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Prénom"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nom"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </GridItem>
                  <GridItem xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </GridItem>
                  <GridItem xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2 }}
                    >
                      Enregistrer les modifications
                    </Button>
                  </GridItem>
                </Grid>
              </Box>
            ) : (
              <Grid container spacing={2}>
                <GridItem xs={12}>
                  <Typography variant="body1">
                    <strong>Email:</strong> {user.email || 'Non renseigné'}
                  </Typography>
                </GridItem>
                <GridItem xs={12}>
                  <Typography variant="body1">
                    <strong>Rôle:</strong> {user.role || 'Non défini'}
                  </Typography>
                </GridItem>
                <GridItem xs={12}>
                  <Typography variant="body1">
                    <strong>Dernière connexion:</strong>{' '}
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : 'N/A'}
                  </Typography>
                </GridItem>
              </Grid>
            )}
          </GridItem>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Profile; 