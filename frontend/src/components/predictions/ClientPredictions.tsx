import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '../../mui-exports';
import GridItem from '../common/GridItem';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

interface ClientData {
  client_name: string;
  email: string;
  phone: string;
  gender: string;
  SeniorCitizen: number;
  Partner: string;
  Dependents: string;
  tenure: number;
  PhoneService: string;
  MultipleLines: string;
  InternetService: string;
  OnlineSecurity: string;
  OnlineBackup: string;
  DeviceProtection: string;
  TechSupport: string;
  StreamingTV: string;
  StreamingMovies: string;
  Contract: string;
  PaperlessBilling: string;
  PaymentMethod: string;
  MonthlyCharges: number;
  TotalCharges: number;
  message: string;
}

interface PredictionResult {
  churn: {
    churn_probability: number;
    reasons: Array<{
      feature: string;
      importance: number;
      value: string;
      impact: string;
    }>;
    risk_level: string;
  };
  sentiment: {
    sentiment: string;
    probabilities: number[];
  };
  recommendation: {
    recommendations: string[];
  };
}

interface PreviewData {
  headers: string[];
  rows: string[][];
}

interface ErrorDetail {
  client_name: string;
  error: string;
}

interface PredictionResponse {
  processed: number;
  errors: number;
  results: Array<{
    client_name: string;
    results: {
      churn: {
        churn_probability: number;
        reasons: Array<{
          feature: string;
          importance: number;
          value: string;
          impact: string;
        }>;
        risk_level: string;
      };
      recommendation: {
        recommendations: string[];
      };
      sentiment?: {
        sentiment: string;
        probabilities: number[];
      };
    };
  }>;
  error_details: (string | ErrorDetail)[];
}

const requiredColumns = [
  'client_name',
  'email',
  'phone',
  'gender',
  'SeniorCitizen',
  'Partner',
  'Dependents',
  'tenure',
  'PhoneService',
  'MultipleLines',
  'InternetService',
  'OnlineSecurity',
  'OnlineBackup',
  'DeviceProtection',
  'TechSupport',
  'StreamingTV',
  'StreamingMovies',
  'Contract',
  'PaperlessBilling',
  'PaymentMethod',
  'MonthlyCharges',
  'TotalCharges',
  'message'
];

const PreviewSection: React.FC<{ data: PreviewData }> = ({ data }) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Aperçu des données
      </Typography>
      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {data.headers.map((header: string, index: number) => (
                <TableCell 
                  key={index}
                  sx={{ 
                    fontWeight: 'bold',
                    backgroundColor: 'background.paper'
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.rows.map((row: string[], rowIndex: number) => (
              <TableRow key={rowIndex}>
                {row.map((cell: string, cellIndex: number) => (
                  <TableCell 
                    key={cellIndex}
                    sx={{ 
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

const ClientPredictions: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImportForm, setShowImportForm] = useState(true);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const checkAuth = () => {
    const token = localStorage.getItem('accessToken');
    console.log('Token dans localStorage:', token); // Log du token complet
    if (!token) {
      console.log('Pas de token trouvé dans localStorage');
      return false;
    }
    return true;
  };

  const normalizeHeader = (header: string): string => {
    return header
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ''); // Supprime tous les caractères spéciaux
  };

  const validateColumns = (headers: string[]): string[] => {
    console.log('En-têtes reçus:', headers);
    
    const normalizedHeaders = headers.map(normalizeHeader);
    console.log('En-têtes normalisés:', normalizedHeaders);
    
    const normalizedRequired = requiredColumns.map(normalizeHeader);
    console.log('Colonnes requises normalisées:', normalizedRequired);
    
    const missingColumns = requiredColumns.filter((col, index) => {
      const normalizedCol = normalizedRequired[index];
      const found = normalizedHeaders.includes(normalizedCol);
      if (!found) {
        console.log(`Colonne manquante: ${col} (normalisée: ${normalizedCol})`);
      }
      return !found;
    });

    console.log('Colonnes manquantes:', missingColumns);
    return missingColumns;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Fichier sélectionné:', file.name);
    setSelectedFile(file);
    setPreviewError(null);
    setPreviewData(null);
    setError(null);
    setPredictions(null);

    try {
      if (!checkAuth()) {
        console.log('Authentification échouée, redirection vers login');
        setPreviewError('Vous devez être connecté pour prévisualiser les données');
        navigate('/login');
        return;
      }

      // Lire le fichier pour vérifier les en-têtes et les données
      const text = await file.text();
      const lines = text.split('\n');
      
      // Nettoyer les lignes vides et les espaces
      const cleanLines = lines
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      if (cleanLines.length === 0) {
        setPreviewError('Le fichier est vide');
        return;
      }

      // Détecter le séparateur (point-virgule ou virgule)
      const firstLine = cleanLines[0];
      const separator = firstLine.includes(';') ? ';' : ',';
      console.log('Séparateur détecté:', separator);

      // Séparer les en-têtes en tenant compte du séparateur détecté
      const headers = firstLine
        .split(separator)
        .map(header => header.trim().replace(/^["']|["']$/g, '')); // Supprime les guillemets
      
      console.log('En-têtes détectés:', headers);
      
      // Vérifier les colonnes requises
      const missingColumns = validateColumns(headers);
      if (missingColumns.length > 0) {
        setPreviewError(
          `Le fichier est invalide. Colonnes manquantes : ${missingColumns.join(', ')}. ` +
          'Veuillez vous assurer que votre fichier contient toutes les colonnes requises.'
        );
        return;
      }

      // Préparer les données de prévisualisation
      const previewRows = cleanLines.slice(1, 6).map(line => 
        line.split(separator).map(cell => cell.trim().replace(/^["']|["']$/g, ''))
      );

      // Afficher la prévisualisation
      setPreviewData({
        headers: headers,
        rows: previewRows
      });
    } catch (error: any) {
      console.error('Erreur lors de la prévisualisation:', error);
      setPreviewError(`Erreur lors de la lecture du fichier: ${error.message}`);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);
      setError(null);
      setShowImportForm(false); // Masquer le formulaire d'importation

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Non authentifié');
      }

      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post('http://localhost:8000/api/clients/process/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });

      setPredictions(response.data);
    } catch (err) {
      console.error('Erreur lors de l\'analyse:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setShowImportForm(true); // Réafficher le formulaire en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!predictions) return;

    const headers = [
      'Client',
      'Probabilité de Churn',
      'Niveau de Risque',
      'Facteurs d\'influence',
      'Recommandations',
      'Sentiment'
    ];

    const csvData = predictions.results.map(client => {
      const factors = client.results.churn.reasons
        .map(r => `${r.feature}: ${r.value} (${r.impact})`)
        .join('; ');
      
      const recommendations = client.results.recommendation.recommendations.join('; ');
      
      return [
        client.client_name,
        `${(client.results.churn.churn_probability * 100).toFixed(2)}%`,
        client.results.churn.risk_level,
        factors,
        recommendations,
        client.results.sentiment?.sentiment || 'Non disponible'
      ];
    });

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `churn_analysis_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (!predictions) return;

    const doc = new jsPDF();
    
    // Titre
    doc.setFontSize(20);
    doc.text('Analyse de Churn', 14, 20);
    
    // Date
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Résumé
    doc.setFontSize(14);
    doc.text('Résumé', 14, 40);
    doc.setFontSize(12);
    doc.text(`Nombre de clients analysés: ${predictions.processed}`, 14, 50);
    if (predictions.errors > 0) {
      doc.text(`Erreurs détectées: ${predictions.errors}`, 14, 60);
    }

    // Tableau des résultats
    const tableData = predictions.results.map(client => [
      client.client_name,
      `${(client.results.churn.churn_probability * 100).toFixed(2)}%`,
      client.results.churn.risk_level,
      client.results.sentiment?.sentiment || 'Non disponible'
    ]);

    autoTable(doc, {
      startY: 70,
      head: [['Client', 'Probabilité', 'Risque', 'Sentiment']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });

    // Détails par client
    let yPosition = (doc as any).lastAutoTable.finalY + 20;
    
    predictions.results.forEach((client, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.text(`Client: ${client.client_name}`, 14, yPosition);
      yPosition += 10;

      // Facteurs d'influence
      doc.setFontSize(12);
      doc.text('Facteurs d\'influence:', 14, yPosition);
      yPosition += 7;
      
      client.results.churn.reasons.forEach(reason => {
        doc.setFontSize(10);
        doc.text(`- ${reason.feature}: ${reason.value} (${reason.impact})`, 20, yPosition);
        yPosition += 7;
      });

      // Recommandations
      if (client.results.recommendation.recommendations.length > 0) {
        yPosition += 5;
        doc.setFontSize(12);
        doc.text('Recommandations:', 14, yPosition);
        yPosition += 7;
        
        client.results.recommendation.recommendations.forEach(rec => {
          doc.setFontSize(10);
          doc.text(`- ${rec}`, 20, yPosition);
          yPosition += 7;
        });
      }

      yPosition += 10;
    });

    doc.save(`churn_analysis_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Prédictions de Churn</h1>
        
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
            Prédictions de Churn
          </Typography>

          {showImportForm ? (
            <Card sx={{ mb: 3, maxWidth: 800, mx: 'auto' }}>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Analyse de Churn Client
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Importez votre fichier CSV pour analyser le risque de churn de vos clients
                    </Typography>
                  </Box>

                  <Box sx={{ 
                    border: '2px dashed',
                    borderColor: 'primary.main',
                    borderRadius: 2,
                    p: 4,
                    width: '100%',
                    textAlign: 'center',
                    bgcolor: 'background.default'
                  }}>
                    <Button
                      variant="contained"
                      component="label"
                      startIcon={<UploadFileIcon />}
                      size="large"
                      sx={{ mb: 2 }}
                    >
                      Sélectionner un fichier CSV
                      <input
                        type="file"
                        hidden
                        accept=".csv"
                        onChange={handleFileSelect}
                      />
                    </Button>
                    <Typography variant="body2" color="text.secondary">
                      ou glissez-déposez votre fichier ici
                    </Typography>
                  </Box>

                  {selectedFile && (
                    <Box sx={{ width: '100%' }}>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <InsertDriveFileIcon color="primary" />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2">
                              {selectedFile.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {(selectedFile.size / 1024).toFixed(2)} KB
                            </Typography>
                          </Box>
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              setSelectedFile(null);
                              setPreviewData(null);
                              setPreviewError(null);
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Box>
                      </Paper>
                    </Box>
                  )}

                  {previewError && (
                    <Alert severity="error" sx={{ width: '100%' }}>
                      {previewError}
                    </Alert>
                  )}

                  {previewData && (
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Aperçu des données
                      </Typography>
                      <PreviewSection data={previewData} />
                    </Box>
                  )}

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAnalyze}
                    disabled={!selectedFile || !!previewError}
                    startIcon={<AnalyticsIcon />}
                    size="large"
                    sx={{ mt: 2 }}
                  >
                    Lancer l'analyse
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
              {loading && (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  my: 8,
                  gap: 2
                }}>
                  <CircularProgress size={60} />
                  <Typography variant="h6" color="text.secondary">
                    Analyse en cours...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Veuillez patienter pendant que nous analysons vos données
                  </Typography>
                </Box>
              )}

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 3 }}
                  action={
                    <Button color="inherit" size="small" onClick={() => setShowImportForm(true)}>
                      Réessayer
                    </Button>
                  }
                >
                  {error}
                </Alert>
              )}

              {predictions && (
                <Box>
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                          Résultats de l'analyse
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={exportToCSV}
                          >
                            Exporter CSV
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<PictureAsPdfIcon />}
                            onClick={exportToPDF}
                          >
                            Exporter PDF
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<UploadFileIcon />}
                            onClick={() => {
                              setShowImportForm(true);
                              setPredictions(null);
                              setSelectedFile(null);
                              setPreviewData(null);
                            }}
                          >
                            Nouvelle analyse
                          </Button>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <Chip
                          icon={<CheckCircleIcon />}
                          label={`${predictions.processed} clients analysés`}
                          color="success"
                        />
                        {predictions.errors > 0 && (
                          <Chip
                            icon={<ErrorIcon />}
                            label={`${predictions.errors} erreurs`}
                            color="error"
                          />
                        )}
                      </Box>
                    </CardContent>
                  </Card>

                  {predictions.results.map((client, index) => {
                    // Vérifier si ce client a une erreur
                    const hasError = predictions.error_details?.some(
                      (error) => typeof error === 'object' && (error as ErrorDetail).client_name === client.client_name
                    );

                    return (
                      <Box key={index} sx={{ mt: 4 }}>
                        <Card sx={{ mb: 3 }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Résultats de l'analyse pour {client.client_name}
                            </Typography>
                            {hasError && (
                              <Alert severity="warning" sx={{ mb: 2 }}>
                                L'analyse de sentiment n'est pas disponible pour ce client.
                              </Alert>
                            )}
                            <Grid container spacing={3}>
                              {/* Probabilité de Churn */}
                              {client.results && client.results.churn && (
                                <Grid item xs={12} md={4}>
                                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                      Probabilité de Churn
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                      <Box sx={{ width: '100%', mr: 1 }}>
                                        <LinearProgress
                                          variant="determinate"
                                          value={(client.results.churn.churn_probability || 0) * 100}
                                          color={client.results.churn.risk_level === 'Élevé' ? 'error' : 'success'}
                                          sx={{ height: 10, borderRadius: 5 }}
                                        />
                                      </Box>
                                      <Typography variant="body2" color="text.secondary">
                                        {Math.round((client.results.churn.churn_probability || 0) * 100)}%
                                      </Typography>
                                    </Box>
                                    <Chip
                                      label={`Risque ${(client.results.churn.risk_level || 'Inconnu').toLowerCase()}`}
                                      color={client.results.churn.risk_level === 'Élevé' ? 'error' : 'success'}
                                      size="small"
                                      sx={{ mt: 1 }}
                                    />
                                  </Paper>
                                </Grid>
                              )}

                              {/* Facteurs d'influence */}
                              {client.results && client.results.churn && client.results.churn.reasons && (
                                <Grid item xs={12} md={4}>
                                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                      Facteurs d'influence
                                    </Typography>
                                    <List dense>
                                      {client.results.churn.reasons.map((reason, idx: number) => (
                                        <ListItem key={idx}>
                                          <ListItemText
                                            primary={reason.feature}
                                            secondary={
                                              <>
                                                <Typography component="span" variant="body2" color="text.primary">
                                                  {reason.value}
                                                </Typography>
                                                {" — "}
                                                {reason.impact}
                                              </>
                                            }
                                          />
                                        </ListItem>
                                      ))}
                                    </List>
                                  </Paper>
                                </Grid>
                              )}

                              {/* Recommandations */}
                              {client.results && client.results.recommendation && (
                                <Grid item xs={12} md={4}>
                                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                      Recommandations
                                    </Typography>
                                    {client.results.recommendation.recommendations && client.results.recommendation.recommendations.length > 0 ? (
                                      <List dense>
                                        {client.results.recommendation.recommendations.map((rec: string, idx: number) => (
                                          <ListItem key={idx}>
                                            <ListItemText primary={rec} />
                                          </ListItem>
                                        ))}
                                      </List>
                                    ) : (
                                      <Typography variant="body2" color="text.secondary">
                                        Aucune recommandation nécessaire
                                      </Typography>
                                    )}
                                  </Paper>
                                </Grid>
                              )}

                              {/* Analyse de sentiment */}
                              {client.results && client.results.sentiment && !hasError && (
                                <Grid item xs={12}>
                                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                      Analyse de sentiment
                                    </Typography>
                                    <Typography variant="body2">
                                      Sentiment: {client.results.sentiment.sentiment || 'Non disponible'}
                                    </Typography>
                                  </Paper>
                                </Grid>
                              )}
                            </Grid>
                          </CardContent>
                        </Card>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </div>
    </div>
  );
};

export default ClientPredictions; 