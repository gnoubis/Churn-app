import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Tooltip,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Storage as StorageIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import GridItem from '../common/GridItem';

interface DataSourceConfig {
  id: string;
  name: string;
  type: 'database' | 'api' | 'file';
  config: {
    [key: string]: string;
  };
  status: 'active' | 'inactive';
  lastSync?: string;
}

const Configuration: React.FC = () => {
  const [dataSources, setDataSources] = useState<DataSourceConfig[]>([
    {
      id: '1',
      name: 'Base de données principale',
      type: 'database',
      config: {
        host: 'localhost',
        port: '5432',
        database: 'customers_db',
        username: 'admin',
      },
      status: 'active',
      lastSync: '2024-03-20 14:30',
    },
    {
      id: '2',
      name: 'API CRM',
      type: 'api',
      config: {
        url: 'https://api.crm.com/v1',
        apiKey: '****',
      },
      status: 'active',
      lastSync: '2024-03-20 15:45',
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSource, setSelectedSource] = useState<DataSourceConfig | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddSource = () => {
    setSelectedSource(null);
    setOpenDialog(true);
  };

  const handleEditSource = (source: DataSourceConfig) => {
    setSelectedSource(source);
    setOpenDialog(true);
  };

  const handleDeleteSource = async (sourceId: string) => {
    try {
      setLoading(true);
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDataSources(prev => prev.filter(source => source.id !== sourceId));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (source: DataSourceConfig) => {
    try {
      setLoading(true);
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Afficher un message de succès
    } catch (error) {
      console.error('Erreur lors du test:', error);
      // Afficher un message d'erreur
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <GridItem xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Configuration des Sources de Données</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddSource}
            >
              Ajouter une source
            </Button>
          </Box>
        </GridItem>

        {dataSources.map((source) => (
          <GridItem xs={12} md={6} key={source.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StorageIcon color="primary" />
                    <Typography variant="h6">{source.name}</Typography>
                  </Box>
                  <Box>
                    <Tooltip title="Tester la connexion">
                      <IconButton 
                        onClick={() => handleTestConnection(source)}
                        disabled={loading}
                      >
                        <CheckIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Modifier">
                      <IconButton 
                        onClick={() => handleEditSource(source)}
                        disabled={loading}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton 
                        onClick={() => handleDeleteSource(source.id)}
                        disabled={loading}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Alert 
                  severity={source.status === 'active' ? 'success' : 'warning'}
                  sx={{ mb: 2 }}
                >
                  {source.status === 'active' ? 'Connecté' : 'Non connecté'}
                  {source.lastSync && ` - Dernière synchronisation: ${source.lastSync}`}
                </Alert>

                <Typography variant="subtitle2" gutterBottom>
                  Type: {source.type === 'database' ? 'Base de données' : source.type === 'api' ? 'API' : 'Fichier'}
                </Typography>

                <Box sx={{ mt: 2 }}>
                  {Object.entries(source.config).map(([key, value]) => (
                    <Typography key={key} variant="body2" color="text.secondary">
                      {key}: {key.toLowerCase().includes('password') || key.toLowerCase().includes('key') ? '****' : value}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </GridItem>
        ))}
      </Grid>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedSource ? 'Modifier la source' : 'Ajouter une source'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <GridItem xs={12}>
                <TextField
                  fullWidth
                  label="Nom de la source"
                  defaultValue={selectedSource?.name}
                />
              </GridItem>
              <GridItem xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Type de source</InputLabel>
                  <Select
                    defaultValue={selectedSource?.type || 'database'}
                    label="Type de source"
                  >
                    <MenuItem value="database">Base de données</MenuItem>
                    <MenuItem value="api">API</MenuItem>
                    <MenuItem value="file">Fichier</MenuItem>
                  </Select>
                </FormControl>
              </GridItem>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Annuler
          </Button>
          <Button 
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={loading}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Configuration; 