import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  ButtonGroup,
  Stack,
  TextField,
  useTheme,
  IconButton,
  Tooltip,
  Alert,
  Paper,
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { chartService, ChurnData, ChartSettings } from '../../services/chartService';

const ChurnDetails: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ChurnData[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [settings, setSettings] = useState<ChartSettings>({
    timeframe: 'month',
    chartType: 'line',
    selectedMetrics: ['churnRate', 'trend'],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const chartSettings = await chartService.loadChartSettings();
      setSettings(chartSettings);
      
      const chartData = await chartService.getChurnData({
        ...chartSettings,
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
        endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
      });
      setData(chartData);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    try {
      await chartService.saveChartSettings(settings);
      chartService.downloadCSV(data, `churn-data-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    } catch (err) {
      setError('Erreur lors de la sauvegarde des paramètres');
      console.error(err);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleExport = () => {
    chartService.downloadCSV(data);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Analyse Détaillée du Taux de Churn
        </Typography>
        <ButtonGroup>
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Actualiser
          </Button>
          <Button
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={loading}
          >
            Sauvegarder
          </Button>
          <Button
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={loading}
          >
            Exporter
          </Button>
        </ButtonGroup>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ m: 0, width: '100%' }}>
        <Grid component="div" item xs={12} md={9}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ height: 500 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data}
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
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: theme.palette.text.secondary }}
                    />
                    <YAxis
                      tickFormatter={(value) => `${value}%`}
                      tick={{ fill: theme.palette.text.secondary }}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8,
                      }}
                      formatter={(value: number) => [`${value}%`, 'Taux de Churn']}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="churnRate"
                      name="Taux de Churn"
                      stroke={theme.palette.primary.main}
                      fill="url(#colorChurn)"
                    />
                    <Area
                      type="monotone"
                      dataKey="trend"
                      name="Tendance"
                      stroke={theme.palette.secondary.main}
                      fill="url(#colorTrend)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid component="div" item xs={12} md={3}>
          <Stack spacing={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Filtres
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <Stack spacing={2}>
                  <DatePicker
                    label="Date de début"
                    value={startDate}
                    onChange={(newValue: Date | null) => setStartDate(newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                  <DatePicker
                    label="Date de fin"
                    value={endDate}
                    onChange={(newValue: Date | null) => setEndDate(newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Stack>
              </LocalizationProvider>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Statistiques
              </Typography>
              <Stack spacing={1}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Moyenne
                  </Typography>
                  <Typography variant="h6">
                    {(data.reduce((acc, curr) => acc + curr.churnRate, 0) / (data.length || 1)).toFixed(2)}%
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Maximum
                  </Typography>
                  <Typography variant="h6">
                    {data.length > 0 ? Math.max(...data.map(d => d.churnRate)).toFixed(2) : '0.00'}%
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Minimum
                  </Typography>
                  <Typography variant="h6">
                    {data.length > 0 ? Math.min(...data.map(d => d.churnRate)).toFixed(2) : '0.00'}%
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChurnDetails; 