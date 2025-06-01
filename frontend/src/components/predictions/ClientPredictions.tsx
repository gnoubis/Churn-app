import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  CloudUploadIcon,
  WarningIcon,
} from '../../mui-exports';
import GridItem from '../common/GridItem';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastPurchase: string;
  totalSpent: number;
  churnProbability: number;
  status: 'high_risk' | 'medium_risk' | 'low_risk';
  predictionDate: string;
}

const ClientPredictions: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fonction simulée pour l'import et la prédiction
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Données simulées
      const mockPredictions: Client[] = [
        {
          id: '1',
          name: 'Jean Dupont',
          email: 'jean.dupont@email.com',
          phone: '+33 6 12 34 56 78',
          lastPurchase: '2024-03-15',
          totalSpent: 1500,
          churnProbability: 0.82,
          status: 'high_risk',
          predictionDate: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Marie Martin',
          email: 'marie.martin@email.com',
          phone: '+33 6 23 45 67 89',
          lastPurchase: '2024-03-10',
          totalSpent: 2300,
          churnProbability: 0.45,
          status: 'medium_risk',
          predictionDate: new Date().toISOString(),
        },
        // Ajoutez plus de données simulées ici
      ];

      setClients(mockPredictions);
      setOpenDialog(false);
    } catch (error) {
      setUploadError('Erreur lors du traitement du fichier');
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high_risk':
        return 'error';
      case 'medium_risk':
        return 'warning';
      case 'low_risk':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'high_risk':
        return 'Risque élevé';
      case 'medium_risk':
        return 'Risque moyen';
      case 'low_risk':
        return 'Risque faible';
      default:
        return status;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <GridItem xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5">Prédictions Clients</Typography>
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Importer des données
            </Button>
          </Box>
        </GridItem>

        {clients.length > 0 ? (
          <GridItem xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Client</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Dernier achat</TableCell>
                    <TableCell>Total dépensé</TableCell>
                    <TableCell>Probabilité de churn</TableCell>
                    <TableCell>Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>{client.name}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{client.email}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {client.phone}
                        </Typography>
                      </TableCell>
                      <TableCell>{new Date(client.lastPurchase).toLocaleDateString()}</TableCell>
                      <TableCell>{client.totalSpent.toLocaleString()} €</TableCell>
                      <TableCell>
                        <Typography
                          color={client.churnProbability > 0.7 ? 'error' : 'inherit'}
                          fontWeight={client.churnProbability > 0.7 ? 'bold' : 'normal'}
                        >
                          {(client.churnProbability * 100).toFixed(1)}%
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(client.status)}
                          color={getStatusColor(client.status) as any}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </GridItem>
        ) : (
          <GridItem xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 5 }}>
                <CloudUploadIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Aucune donnée disponible
                </Typography>
                <Typography color="textSecondary">
                  Importez un fichier de données clients pour obtenir des prédictions
                </Typography>
              </CardContent>
            </Card>
          </GridItem>
        )}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Importer des données clients</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {uploadError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {uploadError}
              </Alert>
            )}
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                fullWidth
              >
                Sélectionner un fichier
              </Button>
            </label>
            {selectedFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Fichier sélectionné: {selectedFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button
            onClick={() => selectedFile && handleFileUpload(selectedFile)}
            variant="contained"
            disabled={!selectedFile || isUploading}
            startIcon={isUploading ? <CircularProgress size={20} /> : undefined}
          >
            {isUploading ? 'Traitement...' : 'Importer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientPredictions; 