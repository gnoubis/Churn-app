import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  useTheme,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  ButtonGroup,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  GetApp as DownloadIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Warning as WarningIcon,
  Email as EmailIcon,
  Message as MessageIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Label,
  BarChart,
  Bar,
} from 'recharts';
import { TooltipProps } from 'recharts';

interface Client {
  id: number;
  name: string;
  churn_probability: number;
  last_activity: string;
  status: string;
}

interface ChurnEvolution {
  date: string;
  churn_rate: number;
}

interface DashboardStats {
  active_clients: number;
  new_clients: number;
  current_churn_rate: number;
  churn_evolution: ChurnEvolution[];
  total_clients: number;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
  }>;
}

// Données pour le graphique circulaire
const clientDistributionData = [
  { name: 'Clients à risque', value: 15, color: '#f44336' },
  { name: 'Clients neutres', value: 30, color: '#ff9800' },
  { name: 'Clients fidèles', value: 55, color: '#4caf50' },
];

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ 
        bgcolor: 'background.paper', 
        p: 1, 
        border: 1, 
        borderColor: 'divider',
        borderRadius: 1
      }}>
        <Typography variant="body2">
          {`${payload[0].name}: ${payload[0].value}%`}
        </Typography>
      </Box>
    );
  }
  return null;
};

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['churnRate']);
  const [urgentClients, setUrgentClients] = useState<Client[]>([]);

  const fetchClients = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch('http://127.0.0.1:8000/api/clients/all/', {
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
        throw new Error('Erreur lors de la récupération des clients');
      }

      const data: Client[] = await response.json();
      // Filtrer les clients avec un taux de churn élevé (> 70%)
      const highRiskClients = data
        .filter(client => client.churn_probability > 0.7)
        .sort((a, b) => b.churn_probability - a.churn_probability)
        .slice(0, 5); // Prendre les 5 clients les plus à risque

      setUrgentClients(highRiskClients);
    } catch (err) {
      console.error('Erreur lors de la récupération des clients:', err);
    }
  }, []);

  const fetchDashboardStats = useCallback(async () => {
    try {
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
        throw new Error('Erreur lors de la récupération des statistiques');
      }

      const data: DashboardStats = await response.json();
      setStats(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
    fetchClients();
  }, [fetchDashboardStats, fetchClients]);

  // Handlers pour les actions principales
  const handleRefresh = useCallback(() => {
    setLoading(true);
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownload = useCallback(() => {
    console.log('Téléchargement des données...');
  }, []);

  const handleSave = useCallback(() => {
    console.log('Sauvegarde des données...');
  }, []);

  const handleTimeframeChange = useCallback((event: React.MouseEvent<HTMLElement> | null, newTimeframe: 'week' | 'month' | 'quarter' | 'year' | null) => {
    if (newTimeframe) {
      setTimeframe(newTimeframe);
    }
  }, []);

  const handleChartTypeChange = useCallback((event: React.MouseEvent<HTMLElement>, newType: 'line' | 'bar' | null) => {
    if (newType) {
      setChartType(newType);
    }
  }, []);

  const handleSegmentClick = useCallback((data: any, index: number) => {
    setSelectedSegment(data.name);
  }, []);

  const handleMetricToggle = useCallback((metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  }, []);

  const handleClientClick = useCallback((client: Client) => {
    console.log(`Ouverture des détails pour ${client.name}...`);
    // Ici vous pouvez ajouter la navigation vers la page de détails du client
  }, []);

  const handleViewAllClients = useCallback(() => {
    console.log('Navigation vers la liste complète des clients...');
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              Vérifiez que :
            </Typography>
            <ul>
              <li>Vous êtes bien connecté</li>
              <li>Le serveur backend est en cours d&apos;exécution</li>
              <li>L&apos;URL de l&apos;API est correcte</li>
            </ul>
          </Box>
        </Alert>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Aucune donnée disponible
        </Alert>
      </Box>
    );
  }

  // Préparation des données pour le graphique
  const chartData = stats.churn_evolution.map(item => ({
    month: new Date(item.date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
    churnRate: item.churn_rate * 100,
    trend: item.churn_rate * 100
  }));

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Barre d'outils */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <ButtonGroup variant="outlined" size="small">
          <Button onClick={handleRefresh}>
            <RefreshIcon />
          </Button>
          <Button onClick={handlePrint}>
            <PrintIcon />
          </Button>
          <Button onClick={handleDownload}>
            <DownloadIcon />
          </Button>
          <Button onClick={handleSave}>
            <SaveIcon />
          </Button>
        </ButtonGroup>

        <ButtonGroup variant="outlined" size="small">
          <Button 
            onClick={(e) => handleTimeframeChange(e, 'week')}
            color={timeframe === 'week' ? 'primary' : 'inherit'}
          >
            Semaine
          </Button>
          <Button 
            onClick={(e) => handleTimeframeChange(e, 'month')}
            color={timeframe === 'month' ? 'primary' : 'inherit'}
          >
            Mois
          </Button>
          <Button 
            onClick={(e) => handleTimeframeChange(e, 'quarter')}
            color={timeframe === 'quarter' ? 'primary' : 'inherit'}
          >
            Trimestre
          </Button>
          <Button 
            onClick={(e) => handleTimeframeChange(e, 'year')}
            color={timeframe === 'year' ? 'primary' : 'inherit'}
          >
            Année
          </Button>
        </ButtonGroup>
      </Stack>

      {/* Statistiques générales */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 6 }}>
        <Card sx={{ flex: 1, borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  backgroundColor: 'error.light',
                  borderRadius: 1,
                  p: 1,
                  mr: 2,
                }}
              >
                <TrendingDown sx={{ color: 'error.main' }} />
              </Box>
              <Typography variant="h6">Taux de Churn</Typography>
            </Box>
            <Typography variant="h4" sx={{ mb: 1 }}>
              {(stats.current_churn_rate * 100).toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <TrendingDown sx={{ color: 'error.main', fontSize: 16, verticalAlign: 'sub' }} />
              sur les 30 derniers jours
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  backgroundColor: 'success.light',
                  borderRadius: 1,
                  p: 1,
                  mr: 2,
                }}
              >
                <TrendingUp sx={{ color: 'success.main' }} />
              </Box>
              <Typography variant="h6">Clients Actifs</Typography>
            </Box>
            <Typography variant="h4" sx={{ mb: 1 }}>{stats.active_clients}</Typography>
            <Typography variant="body2" color="text.secondary">
              <TrendingUp sx={{ color: 'success.main', fontSize: 16, verticalAlign: 'sub' }} />
              sur {stats.total_clients} clients au total
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  backgroundColor: 'info.light',
                  borderRadius: 1,
                  p: 1,
                  mr: 2,
                }}
              >
                <TrendingUp sx={{ color: 'info.main' }} />
              </Box>
              <Typography variant="h6">Nouveaux Clients</Typography>
            </Box>
            <Typography variant="h4" sx={{ mb: 1 }}>{stats.new_clients}</Typography>
            <Typography variant="body2" color="text.secondary">
              <TrendingUp sx={{ color: 'info.main', fontSize: 16, verticalAlign: 'sub' }} />
              ce mois-ci
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Graphique principal */}
      <Card sx={{ mb: 4, borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3,
          }}>
            <Typography variant="h6">Évolution du Taux de Churn</Typography>
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={handleChartTypeChange}
              size="small"
            >
              <ToggleButton value="line">
                <LineChartIcon />
              </ToggleButton>
              <ToggleButton value="bar">
                <BarChartIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorChurn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.1} />
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <RechartsTooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Taux de Churn']}
                  />
                  <Area
                    type="monotone"
                    dataKey="churnRate"
                    stroke={theme.palette.primary.main}
                    fillOpacity={1}
                    fill="url(#colorChurn)"
                  />
                </AreaChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <RechartsTooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Taux de Churn']}
                  />
                  <Bar
                    dataKey="churnRate"
                    fill={theme.palette.primary.main}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Distribution des clients */}
      <Card sx={{ mb: 4, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>Distribution des Clients</Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={clientDistributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {clientDistributionData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === 'Clients à risque' ? theme.palette.error.main : 
                           entry.name === 'Clients neutres' ? theme.palette.warning.main : 
                           theme.palette.success.main} 
                    />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: number) => `${value}%`}
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: theme.shape.borderRadius,
                    padding: theme.spacing(1)
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Clients nécessitant une intervention urgente */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3,
          }}>
            <Typography variant="h6" sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
            }}>
              <WarningIcon sx={{ color: 'warning.main' }} />
              Clients nécessitant une intervention urgente
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={handleViewAllClients}
            >
              Voir tous
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Client</TableCell>
                  <TableCell>Probabilité de Churn</TableCell>
                  <TableCell>Dernière activité</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {urgentClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${(client.churn_probability * 100).toFixed(1)}%`}
                        color={client.churn_probability > 0.8 ? 'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{client.last_activity}</TableCell>
                    <TableCell>
                      <Chip
                        label={client.churn_probability > 0.8 ? 'Très élevé' : 'Élevé'}
                        color={client.churn_probability > 0.8 ? 'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Envoyer un email">
                          <IconButton size="small" onClick={() => handleClientClick(client)}>
                            <EmailIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Appeler">
                          <IconButton size="small" onClick={() => handleClientClick(client)}>
                            <PhoneIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Planifier une réunion">
                          <IconButton size="small" onClick={() => handleClientClick(client)}>
                            <ScheduleIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard; 