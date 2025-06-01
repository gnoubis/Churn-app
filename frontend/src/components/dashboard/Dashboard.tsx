import React, { useState, useCallback } from 'react';
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

// Données simulées du taux de churn avec ligne de tendance
const churnData = [
  { month: 'Jul 2021', churnRate: 2.1, trend: 2.3 },
  { month: 'Aug 2021', churnRate: 0.8, trend: 2.0 },
  { month: 'Sep 2021', churnRate: 1.9, trend: 1.9 },
  { month: 'Oct 2021', churnRate: 1.4, trend: 1.8 },
  { month: 'Nov 2021', churnRate: 1.6, trend: 1.7 },
  { month: 'Dec 2021', churnRate: 2.7, trend: 1.8 },
  { month: 'Jan 2022', churnRate: 0.8, trend: 1.6 },
  { month: 'Feb 2022', churnRate: 1.9, trend: 1.7 },
  { month: 'Mar 2022', churnRate: 2.1, trend: 1.8 },
  { month: 'Apr 2022', churnRate: 2.3, trend: 1.9 },
  { month: 'May 2022', churnRate: 1.8, trend: 2.0 },
  { month: 'Jun 2022', churnRate: 1.8, trend: 2.1 },
  { month: 'Jul 2022', churnRate: 2.2, trend: 2.2 },
];

// Données pour le graphique circulaire
const clientDistributionData = [
  { name: 'Clients à risque', value: 15, color: '#f44336' },
  { name: 'Clients neutres', value: 30, color: '#ff9800' },
  { name: 'Clients fidèles', value: 55, color: '#4caf50' },
];

// Données pour les clients urgents
const urgentClientsData = [
  {
    id: 1,
    name: 'Entreprise ABC',
    riskScore: 89,
    lastActivity: '2 semaines',
    status: 'Très élevé',
  },
  {
    id: 2,
    name: 'Société XYZ',
    riskScore: 78,
    lastActivity: '1 semaine',
    status: 'Élevé',
  },
  {
    id: 3,
    name: 'Corporation 123',
    riskScore: 82,
    lastActivity: '3 semaines',
    status: 'Très élevé',
  },
  {
    id: 4,
    name: 'Entreprise DEF',
    riskScore: 75,
    lastActivity: '5 jours',
    status: 'Élevé',
  },
];

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['churnRate']);

  // Handlers pour les actions principales
  const handleRefresh = useCallback(() => {
    // Simuler un rafraîchissement des données
    console.log('Rafraîchissement des données...');
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownload = useCallback(() => {
    // Simuler un téléchargement des données
    console.log('Téléchargement des données...');
  }, []);

  const handleSave = useCallback(() => {
    // Simuler une sauvegarde
    console.log('Sauvegarde des données...');
  }, []);

  const handleTimeframeChange = useCallback((event: React.MouseEvent<HTMLElement>, newTimeframe: 'week' | 'month' | 'quarter' | 'year' | null) => {
    if (newTimeframe) {
      setTimeframe(newTimeframe);
      // Simuler le chargement des données pour la nouvelle période
      console.log(`Chargement des données pour ${newTimeframe}...`);
    }
  }, []);

  const handleChartTypeChange = useCallback((event: React.MouseEvent<HTMLElement>, newType: 'line' | 'bar' | null) => {
    if (newType) {
      setChartType(newType);
    }
  }, []);

  const handleSegmentClick = useCallback((data: any, index: number) => {
    setSelectedSegment(data.name);
    // Simuler le chargement des détails du segment
    console.log(`Chargement des détails pour ${data.name}...`);
  }, []);

  const handleMetricToggle = useCallback((metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  }, []);

  const handleClientClick = useCallback((client: any) => {
    // Simuler l'ouverture des détails du client
    console.log(`Ouverture des détails pour ${client.name}...`);
  }, []);

  const handleViewAllClients = useCallback(() => {
    // Simuler la navigation vers la liste complète
    console.log('Navigation vers la liste complète des clients...');
  }, []);

  // Calcul des métriques de comparaison
  const currentRate = churnData[churnData.length - 1].churnRate;
  const lastMonthRate = churnData[churnData.length - 2].churnRate;
  const sixMonthsAgoRate = churnData[churnData.length - 7].churnRate;
  const yearAgoRate = churnData[0].churnRate;

  const getPercentageChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return change > 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;
  };

  const metrics = [
    { label: 'Juin', value: currentRate },
    { label: 'Mai', value: lastMonthRate, change: getPercentageChange(currentRate, lastMonthRate) },
    { label: '6 mois (Jan)', value: sixMonthsAgoRate, change: getPercentageChange(currentRate, sixMonthsAgoRate) },
    { label: '12 mois (Jul)', value: yearAgoRate, change: getPercentageChange(currentRate, yearAgoRate) }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
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
            <Typography variant="h4" sx={{ mb: 1 }}>2.2%</Typography>
            <Typography variant="body2" color="text.secondary">
              <TrendingDown sx={{ color: 'error.main', fontSize: 16, verticalAlign: 'sub' }} />
              +0.4% depuis le mois dernier
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
            <Typography variant="h4" sx={{ mb: 1 }}>1,247</Typography>
            <Typography variant="body2" color="text.secondary">
              <TrendingUp sx={{ color: 'success.main', fontSize: 16, verticalAlign: 'sub' }} />
              +12 depuis le mois dernier
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  backgroundColor: 'warning.light',
                  borderRadius: 1,
                  p: 1,
                  mr: 2,
                }}
              >
                <TrendingDown sx={{ color: 'warning.main' }} />
              </Box>
              <Typography variant="h6">Revenu Mensuel</Typography>
            </Box>
            <Typography variant="h4" sx={{ mb: 1 }}>€24,500</Typography>
            <Typography variant="body2" color="text.secondary">
              <TrendingDown sx={{ color: 'warning.main', fontSize: 16, verticalAlign: 'sub' }} />
              -2.3% depuis le mois dernier
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
            <Typography variant="h4" sx={{ mb: 1 }}>34</Typography>
            <Typography variant="body2" color="text.secondary">
              <TrendingUp sx={{ color: 'info.main', fontSize: 16, verticalAlign: 'sub' }} />
              +8 depuis le mois dernier
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Graphique principal et métriques */}
      <Card 
        sx={{ 
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: theme.shadows[3],
          mb: 6,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap',
            gap: 2,
            mb: 4 
          }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                color: theme.palette.text.primary,
              }}
            >
              Évolution du Taux de Churn
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <ButtonGroup 
                variant="contained" 
                sx={{ 
                  boxShadow: 'none',
                  '.MuiButton-root': {
                    textTransform: 'none',
                    px: 3,
                  }
                }}
              >
                <Button 
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  sx={{ bgcolor: theme.palette.primary.light }}
                >
                  Sauvegarder
                </Button>
                <Button 
                  startIcon={<AddIcon />}
                  onClick={handleViewAllClients}
                  sx={{ bgcolor: theme.palette.primary.main }}
                >
                  Voir tous
                </Button>
              </ButtonGroup>
            </Box>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            mb: 3,
            pb: 2,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}>
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={handleChartTypeChange}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  border: 'none',
                  borderRadius: 2,
                  px: 2,
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  },
                },
              }}
            >
              <ToggleButton value="line">
                <LineChartIcon />
              </ToggleButton>
              <ToggleButton value="bar">
                <BarChartIcon />
              </ToggleButton>
            </ToggleButtonGroup>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Rafraîchir">
                <IconButton 
                  size="small"
                  onClick={handleRefresh}
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                    }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Imprimer">
                <IconButton 
                  size="small"
                  onClick={handlePrint}
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                    }
                  }}
                >
                  <PrintIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Télécharger">
                <IconButton 
                  size="small"
                  onClick={handleDownload}
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                    }
                  }}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <ToggleButtonGroup
              value={timeframe}
              exclusive
              onChange={handleTimeframeChange}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  border: 'none',
                  borderRadius: 2,
                  px: 2,
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  },
                },
              }}
            >
              <ToggleButton value="week">Semaine</ToggleButton>
              <ToggleButton value="month">Mois</ToggleButton>
              <ToggleButton value="quarter">Trimestre</ToggleButton>
              <ToggleButton value="year">Année</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box sx={{ height: 400, mb: 4 }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <AreaChart
                  data={churnData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorChurn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.1} />
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.01} />
                    </linearGradient>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.1} />
                      <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    vertical={false}
                    stroke={alpha(theme.palette.text.primary, 0.1)}
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ 
                      fill: theme.palette.text.secondary,
                      fontSize: 12,
                    }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ 
                      fill: theme.palette.text.secondary,
                      fontSize: 12,
                    }}
                    domain={[0, 3]}
                    ticks={[0, 0.5, 1, 1.5, 2, 2.5, 3]}
                    tickFormatter={(value) => `${value}%`}
                    dx={-10}
                  />
                  <RechartsTooltip
                    contentStyle={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: 'none',
                      borderRadius: 8,
                      boxShadow: theme.shadows[3],
                      padding: '12px 16px',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Taux de Churn']}
                  />
                  {selectedMetrics.includes('trend') && (
                    <Area
                      type="monotone"
                      dataKey="trend"
                      stroke={theme.palette.secondary.main}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorTrend)"
                      dot={false}
                    />
                  )}
                  {selectedMetrics.includes('churnRate') && (
                    <Area
                      type="monotone"
                      dataKey="churnRate"
                      stroke={theme.palette.primary.main}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorChurn)"
                      dot={{ 
                        fill: theme.palette.background.paper,
                        stroke: theme.palette.primary.main,
                        strokeWidth: 2,
                        r: 4,
                      }}
                      activeDot={{ 
                        fill: theme.palette.primary.main,
                        stroke: theme.palette.background.paper,
                        strokeWidth: 2,
                        r: 6,
                      }}
                    />
                  )}
                </AreaChart>
              ) : (
                <BarChart
                  data={churnData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    vertical={false}
                    stroke={alpha(theme.palette.text.primary, 0.1)}
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ 
                      fill: theme.palette.text.secondary,
                      fontSize: 12,
                    }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ 
                      fill: theme.palette.text.secondary,
                      fontSize: 12,
                    }}
                    domain={[0, 3]}
                    ticks={[0, 0.5, 1, 1.5, 2, 2.5, 3]}
                    tickFormatter={(value) => `${value}%`}
                    dx={-10}
                  />
                  <RechartsTooltip
                    contentStyle={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: 'none',
                      borderRadius: 8,
                      boxShadow: theme.shadows[3],
                      padding: '12px 16px',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Taux de Churn']}
                  />
                  {selectedMetrics.includes('churnRate') && (
                    <Bar
                      dataKey="churnRate"
                      fill={theme.palette.primary.main}
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                  {selectedMetrics.includes('trend') && (
                    <Bar
                      dataKey="trend"
                      fill={theme.palette.secondary.main}
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                </BarChart>
              )}
            </ResponsiveContainer>
          </Box>

          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            sx={{ 
              width: '100%',
              flexWrap: 'wrap',
            }}
          >
            {metrics.map((metric, index) => (
              <Box
                key={index}
                sx={{
                  flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 16px)', md: '1 1 calc(25% - 16px)' },
                  minWidth: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(25% - 16px)' },
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
                onClick={() => handleMetricToggle(metric.label)}
              >
                <Paper 
                  sx={{ 
                    p: 2,
                    height: '100%',
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.05)}`,
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      mb: 0.5,
                    }}
                  >
                    {metric.value}%
                    {metric.change && (
                      <Typography 
                        component="span" 
                        sx={{ 
                          ml: 1,
                          fontSize: '0.875rem',
                          color: metric.change.startsWith('+') ? 'success.main' : 'error.main',
                        }}
                      >
                        {metric.change}
                      </Typography>
                    )}
                  </Typography>
                  <Typography 
                    color="textSecondary"
                    sx={{ 
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  >
                    {metric.label}
                  </Typography>
                </Paper>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Analyse détaillée des clients */}
      <Typography 
        variant="h5" 
        sx={{ 
          mb: 4,
          fontWeight: 600,
          color: theme.palette.text.primary,
        }}
      >
        Analyse détaillée des clients
      </Typography>

      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        spacing={4} 
        sx={{ 
          mb: 6,
          '& > .MuiCard-root': {
            height: 'fit-content'
          }
        }}
      >
        {/* Clients nécessitant une intervention urgente */}
        <Card sx={{ 
          flex: 2, 
          borderRadius: 3, 
          overflow: 'hidden', 
          boxShadow: theme.shadows[3],
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3,
              pb: 2,
              borderBottom: `1px solid ${theme.palette.divider}`
            }}>
              <Typography variant="h6" sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontWeight: 600,
              }}>
                <WarningIcon sx={{ color: 'warning.main' }} />
                Clients nécessitant une intervention urgente
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={handleViewAllClients}
                sx={{ 
                  textTransform: 'none',
                  borderRadius: 2,
                }}
              >
                Voir tous
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Client</TableCell>
                    <TableCell>Score de risque</TableCell>
                    <TableCell>Dernière activité</TableCell>
                    <TableCell>Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {urgentClientsData.map((client) => (
                    <TableRow 
                      key={client.id}
                      onClick={() => handleClientClick(client)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                        },
                      }}
                    >
                      <TableCell>{client.name}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 60,
                              height: 4,
                              borderRadius: 2,
                              bgcolor: client.riskScore > 80 ? 'error.main' : 'warning.main',
                            }}
                          />
                          {client.riskScore}%
                        </Box>
                      </TableCell>
                      <TableCell>{client.lastActivity}</TableCell>
                      <TableCell>
                        <Chip
                          label={client.status}
                          size="small"
                          sx={{
                            bgcolor: client.status === 'Très élevé' ? 'error.main' : 'warning.main',
                            color: 'white',
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Distribution des clients */}
        <Card sx={{ 
          flex: 1, 
          borderRadius: 3, 
          overflow: 'hidden', 
          boxShadow: theme.shadows[3],
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3,
                pb: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
                fontWeight: 600,
              }}
            >
              Distribution des Clients
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={clientDistributionData}
                    cx="50%"
                    cy="45%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ value }) => `${value}%`}
                    labelLine={false}
                    onClick={(data, index) => handleSegmentClick(data, index)}
                  >
                    {clientDistributionData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        opacity={selectedSegment === null || selectedSegment === entry.name ? 1 : 0.5}
                      />
                    ))}
                  </Pie>
                  <text
                    x="50%"
                    y="45%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      fill: theme.palette.text.primary,
                    }}
                  >
                    Total
                  </text>
                  <text
                    x="50%"
                    y="52%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      fontSize: '1rem',
                      fontWeight: 500,
                      fill: theme.palette.text.secondary,
                    }}
                  >
                    100%
                  </text>
                  <Legend
                    verticalAlign="bottom"
                    height={50}
                    onClick={(entry) => handleSegmentClick(entry, 0)}
                    formatter={(value) => {
                      const data = clientDistributionData.find(item => item.name === value);
                      return `${value} (${data?.value}%)`;
                    }}
                  />
                  <RechartsTooltip
                    formatter={(value: number, name: string) => [`${value}%`, name]}
                    contentStyle={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: 'none',
                      borderRadius: 8,
                      boxShadow: theme.shadows[3],
                      padding: '12px 16px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default Dashboard; 