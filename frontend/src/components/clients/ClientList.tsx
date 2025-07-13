import React, { useState, useMemo } from 'react';
const API_URL = process.env.REACT_APP_API_URL;
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  Tooltip,
  Collapse,
  Grid,
  Tab,
  Tabs,
  TextField,
  Card,
  CardContent,
  InputAdornment,
  MenuItem,
  Select,
  InputLabel,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Warning,
  ContentCopy,
  Email as EmailIcon,
  Message as MessageIcon,
  Recommend as RecommendIcon,
  Person as PersonIcon,
  Send as SendIcon,
  AutoAwesome as AutoAwesomeIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import GridItem from '../common/GridItem';


// Types adaptés à la réponse de l'API
interface ChurnReason {
  value: string;
  impact: string;
  feature: string;
  importance: number;
}

interface ChurnPrediction {
  id: number;
  timestamp: string;
  prediction: {
    reasons: ChurnReason[];
    risk_level: string;
    churn_probability: number;
  };
}

interface Recommendation {
  id: number;
  timestamp: string;
  recommended_offer: string;
  model_response: {
    details: Record<string, any>;
    recommendations: string[];
  };
}

interface Analyses {
  churn_predictions: ChurnPrediction[];
  recommendations: Recommendation[];
  sentiment_analyses: any[];
  generated_messages: any[];
}

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  analyses: Analyses;
}

interface ClientsApiResponse {
  total_clients: number;
  clients: Client[];
}

// Suppression des données simulées, on utilisera les données de l'API.

interface GenerateMessageResponse {
  content: string;
  subject?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`client-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

interface RiskLevel {
  level: 'high' | 'medium' | 'low';
  color: 'error' | 'warning' | 'success';
}

const getRiskLevel = (score: number): RiskLevel => {
  if (score >= 75) return { level: 'high', color: 'error' };
  if (score >= 50) return { level: 'medium', color: 'warning' };
  return { level: 'low', color: 'success' };
};

// Utilitaire pour extraire le risque depuis les analyses
function getClientRisk(client: Client): { risk: number, riskLevel: string } {
  const lastChurn = client.analyses.churn_predictions[0];
  if (lastChurn) {
    return {
      risk: Math.round(lastChurn.prediction.churn_probability * 100),
      riskLevel: lastChurn.prediction.risk_level,
    };
  }
  return { risk: 0, riskLevel: 'Inconnu' };
}

interface Filters {
  search: string;
  riskLevel: 'all' | 'high' | 'medium' | 'low';
}

interface GenerateMessageDialogProps {
  open: boolean;
  onClose: () => void;
  client: Client | null;
  onMessageGenerated: (message: string) => void;
}

const GenerateMessageDialog: React.FC<GenerateMessageDialogProps> = ({
  open,
  onClose,
  client,
  onMessageGenerated
}) => {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  
  // Pour la génération basée sur les recommandations
  const [selectedRecommendation, setSelectedRecommendation] = useState<string>('');
  const [channel, setChannel] = useState<string>('email');
  const [tone, setTone] = useState<string>('formel');
  
  // Pour la génération personnalisée
  const [prompt, setPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(200);
  const [subject, setSubject] = useState('Bienvenue');
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    setGeneratedMessage(null);
    setError(null);
  };

  const [successSnackbar, setSuccessSnackbar] = useState(false);
  const generateFromRecommendation = async () => {
    if (!client || !selectedRecommendation) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Vous devez être connecté pour générer un message.');
      }

      // Vérification des champs requis
      if (!client.name || !selectedRecommendation || !channel || !tone) {
        throw new Error('Tous les champs sont requis : nom du client, offre recommandée, canal et ton');
      }

      const requestBody = {
        client_name: client.name,
        recommended_offer: selectedRecommendation,
        channel: channel,
        tone: tone,
      };

      console.log('Données envoyées à l\'API:', requestBody); // Pour le débogage

      const response = await fetch(`${API_URL}/api/message-generation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      });

      const rawText = await response.text();
      console.log('Réponse brute de l’API:', rawText);
      if (!response.ok) {
        throw new Error("Erreur lors de la génération du message : " + rawText);
      }
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        throw new Error('Réponse de l’API non valide (pas du JSON) : ' + rawText);
      }
      
      setGeneratedMessage(data.message);
      onMessageGenerated(data.message);
    } catch (err) {
      console.error('Erreur détaillée:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const generateCustomMessage = async () => {
    if (!prompt) {
      setError('Veuillez saisir un prompt pour générer le message');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Vous devez être connecté pour générer un message.');
      }

      const requestBody = {
        prompt: prompt,
        temperature: 0.7, // Valeur par défaut, peut être ajustée
        max_tokens: 200  // Valeur par défaut, peut être ajustée
      };

      console.log('Données envoyées à l\'API:', requestBody); // Pour le débogage

      const response = await fetch(`${API_URL}/api/generate-custom-text/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la génération du message');
      }

      const data = await response.json();
      setGeneratedMessage(data.message);
      onMessageGenerated(data.message);
    } catch (err) {
      console.error('Erreur détaillée:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Générer un message</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Basé sur les recommandations" />
          <Tab label="Message personnalisé" />
        </Tabs>

        {tab === 0 && (
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Recommandation</InputLabel>
              <Select
                value={selectedRecommendation}
                onChange={(e) => setSelectedRecommendation(e.target.value)}
                label="Recommandation"
              >
                {client?.analyses.recommendations.map((rec, index) => (
                  <MenuItem key={index} value={rec.model_response.recommendations.join(' | ')}>
                    {rec.model_response.recommendations.length > 0 ? rec.model_response.recommendations.join(' | ') : 'Aucune recommandation'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Canal</InputLabel>
              <Select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                label="Canal"
              >
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="sms">SMS</MenuItem>
                <MenuItem value="chat">Chat</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Tonalité</InputLabel>
              <Select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                label="Tonalité"
              >
                <MenuItem value="formel">Formel</MenuItem>
                <MenuItem value="informel">Informel</MenuItem>
                <MenuItem value="amical">Amical</MenuItem>
                <MenuItem value="professionnel">Professionnel</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        {tab === 1 && (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="number"
              label="Température"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              inputProps={{ min: 0, max: 1, step: 0.1 }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="number"
              label="Nombre maximum de tokens"
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
              inputProps={{ min: 1, max: 1000 }}
            />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {generatedMessage && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Message généré:
            </Typography>
            {channel === 'email' && (
              <TextField
                fullWidth
                label="Sujet"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                sx={{ mb: 2 }}
              />
            )}
            <TextField
              fullWidth
              multiline
              rows={6}
              value={generatedMessage}
              onChange={e => setGeneratedMessage(e.target.value)}
              sx={{ mb: 2 }}
              label={`Prévisualisation et édition du ${channel === 'email' ? 'mail' : 'SMS'}`}
            />
        
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                startIcon={<SendIcon />}
                variant="contained"
                color="primary"
                onClick={async () => {
                  try {
                    setLoading(true);
                    const token = localStorage.getItem('accessToken');
                    if (!token) throw new Error('Token manquant, veuillez vous reconnecter.');
                    const response = await fetch(`${API_URL}/api/send-email/`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        client_name: client?.name,
                        email: client?.email,
                        subject: subject,
                        message: generatedMessage,
                        tone: tone,
                        recommended_offer: selectedRecommendation || "",
                      }),
                    });
                    if (!response.ok) throw new Error('Erreur lors de l\'envoi');
                    setError(null);
                    setSuccessSnackbar(true);
                    onClose();
                  } catch (err) {
                    setError('Erreur lors de l\'envoi du message');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading || !generatedMessage}
              >
                Envoyer
              </Button>
              <Button
                startIcon={<ContentCopy />}
                variant="outlined"
                onClick={() => {
                  navigator.clipboard.writeText(generatedMessage || '');
                }}
                disabled={!generatedMessage}
              >
                Copier
              </Button>
            </Box>
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Aperçu final:
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, whiteSpace: 'pre-wrap', background: '#fafafa' }}>
              {generatedMessage}
            </Paper>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          onClick={tab === 0 ? generateFromRecommendation : generateCustomMessage}
          variant="contained"
          disabled={loading || (tab === 0 && !selectedRecommendation) || (tab === 1 && !prompt)}
        >
          {loading ? <CircularProgress size={24} /> : 'Générer'}
        </Button>
      </DialogActions>
      <Snackbar
        open={successSnackbar}
        autoHideDuration={3000}
        onClose={() => setSuccessSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessSnackbar(false)} severity="success" variant="filled">
          {channel === 'email' ? 'Email envoyé avec succès !' : 'SMS envoyé avec succès !'}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

const ClientList: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [clients, setClients] = useState<Client[]>([]);
const [totalClients, setTotalClients] = useState(0);
const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [messageType, setMessageType] = useState<'email' | 'message' | 'details'>('email');
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GenerateMessageResponse | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [tabValue, setTabValue] = useState(0);
  const [messageContent, setMessageContent] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [filters, setFilters] = useState<Filters>({
    search: '',
    riskLevel: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [generateMessageOpen, setGenerateMessageOpen] = useState(false);
  const [selectedClientForMessage, setSelectedClientForMessage] = useState<Client | null>(null);

  // Récupération des clients depuis l'API
  React.useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${API_URL}/api/clients/all/`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Erreur lors du chargement des clients');
        const data: ClientsApiResponse = await res.json();
        setClients(data.clients);
        setTotalClients(data.total_clients);
      } catch (e: any) {
        setSnackbarMessage(e.message || 'Erreur inconnue');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
    // eslint-disable-next-line
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

    const handleGenerateMessage = async () => {
    if (!selectedClient) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Vous devez être connecté pour générer un message.');
      }
      // Utilise la première recommandation par défaut, ou laisse vide si aucune
      const recommended_offer = selectedClient.analyses.recommendations[0]?.model_response.recommendations.join(' | ') || '';
      const channel = messageType === 'email' ? 'email' : 'sms';
      const tone = 'formel'; // ou propose un choix à l'utilisateur
      const client_email = selectedClient.email || '';
  
      const response = await fetch(`${API_URL}/api/message-generation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          client_name: selectedClient.name,
          recommended_offer,
          channel,
          tone,
          // client_email,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la génération du message');
      }
  
      const data = await response.json();
      setGeneratedContent(data);
      setMessageContent(data.message);
    } catch (error) {
      console.error('Erreur:', error);
      setSnackbarMessage(error instanceof Error ? error.message : 'Erreur lors de la génération du message');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedClient || !messageContent) return;
    setLoading(true);
    try {
      // Simulation d'appel API au backend pour l'envoi
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: selectedClient.id,
          messageType: messageType,
          content: messageContent,
          subject: generatedContent?.subject,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }

      setSnackbarMessage(`${messageType === 'email' ? 'Email' : 'SMS'} envoyé avec succès`);
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      handleCloseDialog();
    } catch (error) {
      console.error('Erreur:', error);
      setSnackbarMessage('Erreur lors de l\'envoi du message');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyContent = () => {
    if (messageContent) {
      navigator.clipboard.writeText(messageContent);
      setSnackbarMessage('Message copié dans le presse-papiers');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    }
  };

  const toggleRowExpanded = (clientId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(clientId)) {
      newExpandedRows.delete(clientId);
    } else {
      newExpandedRows.add(clientId);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleOpenDialog = (client: Client, type: 'email' | 'message' | 'details') => {
    setSelectedClient(client);
    setMessageType(type);
    setOpenDialog(true);
    setGeneratedContent(null);
    setMessageContent('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClient(null);
    setMessageContent('');
    setGeneratedContent(null);
  };

  // Fonction de filtrage des clients
  const filteredClients = useMemo(() => {
    return clients.filter((client: Client) => {
      // Filtre de recherche
      const searchMatch = 
        filters.search === '' ||
        client.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        client.email.toLowerCase().includes(filters.search.toLowerCase());

      // Filtre de niveau de risque
      const { risk, riskLevel } = getClientRisk(client);
      // const riskLevel = getRiskLevel(client.riskScore).level;
      const riskMatch = 
        filters.riskLevel === 'all' ||
        (filters.riskLevel === 'high' && riskLevel === 'high') ||
        (filters.riskLevel === 'medium' && riskLevel === 'medium') ||
        (filters.riskLevel === 'low' && riskLevel === 'low');

      return searchMatch && riskMatch;
    });
  }, [filters, clients]);

  const handleFilterChange = (field: keyof Filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      riskLevel: 'all',
    });
  };

  const handleOpenGenerateMessage = (client: Client) => {
    setSelectedClientForMessage(client);
    setGenerateMessageOpen(true);
  };

  const handleCloseGenerateMessage = () => {
    setGenerateMessageOpen(false);
    setSelectedClientForMessage(null);
  };

  const handleMessageGenerated = (message: string) => {
    // Vous pouvez ajouter ici la logique pour sauvegarder le message généré
    console.log('Message généré:', message);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Titre */}
        <GridItem xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Liste des Clients</Typography>
          </Box>
        </GridItem>
  
        {/* Filtres */}
        <GridItem xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <GridItem xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Rechercher un client"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Rechercher par nom ou email..."
                />
              </GridItem>
  
              <GridItem xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Niveau de risque</InputLabel>
                  <Select
                    value={filters.riskLevel}
                    onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
                    label="Niveau de risque"
                  >
                    <MenuItem value="all">Tous les niveaux</MenuItem>
                    <MenuItem value="high">Risque élevé</MenuItem>
                    <MenuItem value="medium">Risque moyen</MenuItem>
                    <MenuItem value="low">Risque faible</MenuItem>
                  </Select>
                </FormControl>
              </GridItem>
  
              <GridItem xs={12} md={2}>
                <Button fullWidth variant="outlined" onClick={handleResetFilters}>
                  Réinitialiser
                </Button>
              </GridItem>
            </Grid>
          </Paper>
        </GridItem>
  
        {/* Tableau Clients */}
        <GridItem xs={12}>
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 200,
                mt: 4,
              }}
            >
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Chargement des clients...</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Client</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Risque de Churn</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
  
                <TableBody>
                  {filteredClients
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((client) => (
                      <React.Fragment key={client.id.toString()}>
                        <TableRow>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {client.name}
                              <IconButton
                                size="small"
                                onClick={() => toggleRowExpanded(client.id.toString())}
                              >
                                {expandedRows.has(client.id.toString()) ? <ExpandLess /> : <ExpandMore />}
                              </IconButton>
                            </Box>
                          </TableCell>
  
                          <TableCell>
                            <Typography variant="body2">{client.email}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {client.phone}
                            </Typography>
                          </TableCell>
  
                          <TableCell>
                            <Chip
                              label={`${getClientRisk(client).risk}%`}
                              color={getRiskLevel(getClientRisk(client).risk).color}
                              size="small"
                            />
                          </TableCell>
  
                          <TableCell>
                            <Tooltip title="Voir les recommandations">
                              <IconButton onClick={() => handleOpenDialog(client, 'details')}>
                                <RecommendIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Envoyer un email">
                              <IconButton onClick={() => handleOpenDialog(client, 'email')}>
                                <EmailIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Envoyer un SMS">
                              <IconButton onClick={() => handleOpenDialog(client, 'message')}>
                                <MessageIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
  
                        {/* Recommandations IA */}
                        <TableRow>
                          <TableCell colSpan={6} sx={{ py: 0 }}>
                            <Collapse in={expandedRows.has(client.id.toString())} timeout="auto" unmountOnExit>
                              <Box sx={{ py: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                  Recommandations IA
                                </Typography>
                                <Grid container spacing={2}>
                                  {client.analyses.recommendations.map(
                                    (recommendation: Recommendation, index: number) => (
                                      <Grid item xs={12} md={4} key={index}>
                                        <Card variant="outlined">
                                          <CardContent>
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                              <AutoAwesomeIcon color="primary" />
                                              <Typography variant="body2">
                                                {recommendation.model_response.recommendations.join(' | ') ||
                                                  'Aucune recommandation'}
                                              </Typography>
                                            </Box>
                                          </CardContent>
                                        </Card>
                                      </Grid>
                                    )
                                  )}
                                </Grid>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                </TableBody>
              </Table>
  
              <TablePagination
                component="div"
                count={filteredClients.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Lignes par page"
              />
            </TableContainer>
          )}
        </GridItem>
      </Grid>
  
      {/* Dialog IA, Email ou SMS */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth={messageType === 'details' ? 'md' : 'sm'}
        fullWidth
      >
        {messageType === 'details' ? (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon />
                <Typography variant="h6">{selectedClient?.name}</Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Recommandations IA
                </Typography>
                {selectedClient?.analyses.recommendations.map((recommendation: Recommendation, index: number) => (
                  <Alert 
                    key={index} 
                    severity="info" 
                    sx={{ mb: 1 }}
                    icon={<AutoAwesomeIcon />}
                  >
                    {recommendation.model_response.recommendations.join(' | ') || 'Aucune recommandation'}
                  </Alert>
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  startIcon={<EmailIcon />}
                  variant="outlined"
                  onClick={() => {
                    handleCloseDialog();
                    handleOpenDialog(selectedClient!, 'email');
                  }}
                >
                  Envoyer un email
                </Button>
                <Button
                  startIcon={<MessageIcon />}
                  variant="outlined"
                  onClick={() => {
                    handleCloseDialog();
                    handleOpenDialog(selectedClient!, 'message');
                  }}
                >
                  Envoyer un SMS
                </Button>
              </Box>
            </DialogContent>
          </>
        ) : (
          <>
            <DialogTitle>
              {messageType === 'email' ? 'Envoyer un email' : 'Envoyer un SMS'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  À: {messageType === 'email' ? selectedClient?.email : selectedClient?.phone}
                </Typography>
  
                {messageType === 'email' && generatedContent?.subject && (
                  <TextField
                    fullWidth
                    label="Sujet"
                    value={generatedContent.subject}
                    sx={{ mb: 2 }}
                  />
                )}
  
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder={`Rédigez votre ${messageType === 'email' ? 'email' : 'SMS'}...`}
                />
              </Box>
  
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                  startIcon={<AutoAwesomeIcon />}
                  variant="outlined"
                  onClick={handleGenerateMessage}
                  disabled={loading}
                >
                  Générer avec l&apos;IA
                </Button>
  
                <Button
                  startIcon={<AutoAwesomeIcon color="secondary" />}
                  variant="outlined"
                  onClick={() => {
                    handleCloseDialog();
                    if (selectedClient) handleOpenGenerateMessage(selectedClient);
                  }}
                >
                  Prompt personnalisé
                </Button>
  
                <Button
                  startIcon={<ContentCopy />}
                  variant="outlined"
                  onClick={handleCopyContent}
                  disabled={!messageContent}
                >
                  Copier
                </Button>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Annuler</Button>
              <Button 
                variant="contained" 
                onClick={handleSendMessage}
                startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                disabled={loading || !messageContent}
              >
                Envoyer
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
  
      {/* Snackbar de notification */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
  
      {/* Dialog personnalisé IA */}
      <GenerateMessageDialog
        open={generateMessageOpen}
        onClose={handleCloseGenerateMessage}
        client={selectedClientForMessage}
        onMessageGenerated={handleMessageGenerated}
      />
    </Box>
  );
};

export default ClientList; 