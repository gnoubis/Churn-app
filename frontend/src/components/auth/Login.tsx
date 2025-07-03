import React, { useState, ChangeEvent } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  CircularProgress
} from '../../mui';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/jwt/create/', {
        username,
        password,
      });

      const { access, refresh } = response.data;
      
      // Stocker les tokens
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      
      // Récupérer les informations de l'utilisateur
      const userResponse = await api.get('/auth/users/me/', {
        headers: {
          Authorization: `Bearer ${access}`
        }
      });
      
      // Stocker les informations utilisateur
      localStorage.setItem('user', JSON.stringify(userResponse.data));
      
      // Rediriger vers le tableau de bord
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data.detail || 'Erreur de connexion');
      } else {
        setError('Une erreur est survenue lors de la connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
        <Typography variant="h2" sx={{ color: 'primary.main', fontWeight: 900, letterSpacing: 2, mb: 1 }}>
          ChurnSyst
        </Typography>
      </Box>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ color: 'secondary.main', fontWeight: 700 }}>
          Connexion
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Nom d'utilisateur"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Mot de passe"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 