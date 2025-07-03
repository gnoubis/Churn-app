import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  useTheme,
  Grid,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tooltip as MuiTooltip,
  Divider,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Interfaces pour typer nos données
interface DashboardData {
  active_clients: number;
  new_clients: number;
  current_churn_rate: number;
  churn_evolution: Array<{
    date: string;
    churn_rate: number;
  }>;
  total_clients: number;
}

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  analyses: {
    churn_predictions: Array<{
      id: number;
      timestamp: string;
      prediction: {
        churn_probability: number;
        risk_level: string;
        reasons: Array<any>;
      }
    }>;
    recommendations: Array<any>;
    sentiment_analyses: Array<any>;
    generated_messages: Array<any>;
  };
}

const NewDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  // Fonction pour charger les données du tableau de bord
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch('http://127.0.0.1:8000/api/dashboard/stats/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error('Erreur lors de la récupération des données');
      }

      const result = await response.json();
      setData({
        active_clients: result.active_clients || 0,
        new_clients: result.new_clients || 0,
        current_churn_rate: result.current_churn_rate || 0,
        churn_evolution: result.churn_evolution || [],
        total_clients: result.total_clients || 0
      });
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour charger et filtrer les clients à fort potentiel de churn
  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch('http://127.0.0.1:8000/api/clients/all/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        const clientList: Client[] = Array.isArray(result.clients) ? result.clients : [];
        // Pour chaque client, récupérer la dernière prédiction de churn (par date)
        const clientsWithChurn = clientList
          .map(client => {
            const predictions = client.analyses?.churn_predictions || [];
            if (predictions.length === 0) return null;
            // Trier par timestamp décroissant
            const sorted = [...predictions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            const last = sorted[0];
            return {
              ...client,
              churn_probability: last.prediction.churn_probability,
              risk_level: last.prediction.risk_level,
              churn_prediction_date: last.timestamp
            };
          })
          .filter(Boolean)
          .sort((a: any, b: any) => b.churn_probability - a.churn_probability)
          .slice(0, 5);
        setClients(clientsWithChurn as any);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des clients à risque:', err);
    }
  };

  // Chargement initial des données
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchDashboardData(),
        fetchClients()
      ]);
    };
    loadData();
  }, []);

  // Gestion du rafraîchissement
  const handleRefresh = async () => {
    await Promise.all([
      fetchDashboardData(),
      fetchClients()
    ]);
  };

  // Affichage du chargement
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  // Affichage des erreurs
  if (error) {
    return (
      <Box p={3}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Réessayer
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // Données par défaut si data est null
  const safeData = data && typeof data === 'object' ? {
    active_clients: typeof data.active_clients === 'number' ? data.active_clients : 0,
    new_clients: typeof data.new_clients === 'number' ? data.new_clients : 0,
    current_churn_rate: typeof data.current_churn_rate === 'number' ? data.current_churn_rate : 0,
    churn_evolution: Array.isArray(data.churn_evolution) ? data.churn_evolution : [],
    total_clients: typeof data.total_clients === 'number' ? data.total_clients : 0
  } : {
    active_clients: 0,
    new_clients: 0,
    current_churn_rate: 0,
    churn_evolution: [],
    total_clients: 0
  };

  // Préparation des données pour le graphique
  const chartData = safeData.churn_evolution.map(item => ({
    date: item.date ? new Date(item.date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : '',
    churnRate: typeof item.churn_rate === 'number' ? Number((item.churn_rate * 100).toFixed(1)) : 0
  }));

  return (
    <Box sx={{ p: { xs: 1, md: 4 }, bgcolor: '#f7f9fb', minHeight: '100vh' }}>
      {/* En-tête moderne */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} letterSpacing={-1} color="primary.main" gutterBottom>
            ChurnSyst – Tableau de bord
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Vue d&apos;ensemble de l&apos;activité et des risques clients
          </Typography>
        </Box>
        <MuiTooltip title="Rafraîchir les données">
          <span>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
              sx={{ borderRadius: 3, boxShadow: 1, fontWeight: 600 }}
            >
              Actualiser
            </Button>
          </span>
        </MuiTooltip>
      </Box>

      {/* Cartes de statistiques */}
      <Grid container spacing={3} mb={5}>
        {/* Carte Taux de Churn */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, p: 1, bgcolor: '#fff', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 8 } }}>
            <CardContent>
              <Typography color="text.secondary" fontWeight={600} gutterBottom>
                Taux de Churn
              </Typography>
              <Typography variant="h3" fontWeight={700} sx={{ color: '#ff7900' }}>
                {safeData.current_churn_rate ? (safeData.current_churn_rate * 100).toFixed(1) : '0.0'}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                sur les 30 derniers jours
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        {/* Carte Clients Actifs */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, p: 1, bgcolor: '#fff', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 8 } }}>
            <CardContent>
              <Typography color="text.secondary" fontWeight={600} gutterBottom>
                Clients Actifs
              </Typography>
              <Typography variant="h3" fontWeight={700} color="primary.main">
                {safeData.active_clients}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                sur {safeData.total_clients} clients au total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        {/* Carte Nouveaux Clients */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, p: 1, bgcolor: '#fff', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 8 } }}>
            <CardContent>
              <Typography color="text.secondary" fontWeight={600} gutterBottom>
                Nouveaux Clients
              </Typography>
              <Typography variant="h3" fontWeight={700} sx={{ color: '#000' }}>
                {safeData.new_clients}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ce mois-ci
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Graphique d'évolution */}
      <Card sx={{ borderRadius: 3, boxShadow: 2, mb: 5, bgcolor: '#fff', p: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom>
            Évolution du taux de churn
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ height: { xs: 220, md: 320 }, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ left: 5, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3e6eb" />
                <XAxis dataKey="date" tick={{ fontSize: 13 }} />
                <YAxis tick={{ fontSize: 13 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, boxShadow: '0 2px 8px #e0e7ef', fontWeight: 600 }}
                  formatter={(value) => [`${value}%`, 'Taux de churn']}
                />
                <Legend wrapperStyle={{ fontSize: 13 }} />
                <Line
                  type="monotone"
                  dataKey="churnRate"
                  name="Taux de churn"
                  stroke={theme.palette.primary.main}
                  strokeWidth={3}
                  dot={{ r: 5, fill: theme.palette.primary.main }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Liste des clients à risque */}
      <Card sx={{ borderRadius: 3, boxShadow: 2, bgcolor: '#fff', p: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom>
            Top 5 clients à fort potentiel de churn – ChurnSyst
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {clients.length > 0 ? (
            <TableContainer sx={{ borderRadius: 2, boxShadow: 1, bgcolor: '#f9fafb' }}>
              <Table size="small" sx={{ minWidth: 650 }}>
                <TableHead sx={{ position: 'sticky', top: 0, bgcolor: '#f3f6fa', zIndex: 1 }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Nom</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Téléphone</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Probabilité churn</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Niveau de risque</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date prédiction</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clients.map((client: any) => (
                    <TableRow
                      key={client.id}
                      hover
                      sx={{ transition: 'background 0.2s', cursor: 'pointer', '&:hover': { bgcolor: '#e3e9f7' } }}
                    >
                      <TableCell>{client.name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={Math.round(client.churn_probability * 100) + '%'}
                          color={client.churn_probability > 0.5 ? 'error' : client.churn_probability > 0.2 ? 'warning' : 'success'}
                          size="small"
                          sx={{ fontWeight: 700, fontSize: 15, px: 1.5, bgcolor: client.churn_probability > 0.5 ? '#ffeaea' : client.churn_probability > 0.2 ? '#fff7e6' : '#eafaf1', color: client.churn_probability > 0.5 ? '#d32f2f' : client.churn_probability > 0.2 ? '#ed6c02' : '#388e3c' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={client.risk_level}
                          color={client.risk_level === 'Élevé' ? 'error' : client.risk_level === 'Moyen' ? 'warning' : 'success'}
                          size="small"
                          sx={{ fontWeight: 600, fontSize: 14, px: 1.5, bgcolor: client.risk_level === 'Élevé' ? '#ffeaea' : client.risk_level === 'Moyen' ? '#fff7e6' : '#eafaf1', color: client.risk_level === 'Élevé' ? '#d32f2f' : client.risk_level === 'Moyen' ? '#ed6c02' : '#388e3c' }}
                        />
                      </TableCell>
                      <TableCell>{client.churn_prediction_date ? new Date(client.churn_prediction_date).toLocaleDateString('fr-FR') : ''}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography color="textSecondary">
                Aucun client à fort potentiel de churn détecté
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default NewDashboard;
