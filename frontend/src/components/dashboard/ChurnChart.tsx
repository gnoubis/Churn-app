import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { chartService, ChurnData } from '../../services/chartService';

const ChurnChart: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [data, setData] = useState<ChurnData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const settings = await chartService.loadChartSettings();
        const chartData = await chartService.getChurnData(settings);
        setData(chartData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSaveSettings = async () => {
    try {
      const currentSettings = await chartService.loadChartSettings();
      await chartService.saveChartSettings(currentSettings);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
    }
  };

  const handleViewDetails = () => {
    navigate('/analytics/churn-details');
  };

  return (
    <Card>
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6">Évolution du Taux de Churn</Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Sauvegarder les paramètres">
              <IconButton
                size="small"
                onClick={handleSaveSettings}
                disabled={loading}
              >
                <SaveIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Voir les détails">
              <IconButton
                size="small"
                onClick={handleViewDetails}
                disabled={loading}
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Box sx={{ height: 300, width: '100%' }}>
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
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
              <Line
                type="monotone"
                dataKey="churnRate"
                stroke={theme.palette.primary.main}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        <Stack
          direction="row"
          spacing={2}
          justifyContent="flex-end"
          sx={{ mt: 2 }}
        >
          <Typography variant="body2" color="text.secondary">
            Dernière mise à jour: {new Date().toLocaleDateString()}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ChurnChart; 