import React, { useState, useMemo } from 'react';
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

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastPurchase: string;
  totalSpent: number;
  status: 'active' | 'inactive';
  riskScore: number;
  recommendations: string[];
}

// Données simulées
const mockClients: Client[] = [
  {
    id: '1',
    name: 'Jean Dupont',
    email: 'jean.dupont@email.com',
    phone: '+33 6 12 34 56 78',
    lastPurchase: '2024-03-15',
    totalSpent: 1500,
    status: 'active',
    riskScore: 85,
    recommendations: [
      'Proposer une remise de fidélité de 15%',
      'Planifier un appel de suivi personnalisé',
      'Envoyer une enquête de satisfaction'
    ]
  },
  {
    id: '2',
    name: 'Marie Martin',
    email: 'marie.martin@email.com',
    phone: '+33 6 23 45 67 89',
    lastPurchase: '2024-03-10',
    totalSpent: 2300,
    status: 'inactive',
    riskScore: 65,
    recommendations: [
      'Envoyer une newsletter personnalisée',
      'Offrir un service premium gratuit pendant 1 mois',
      'Proposer une remise sur le prochain achat'
    ]
  },
];

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

interface Filters {
  search: string;
  riskLevel: 'all' | 'high' | 'medium' | 'low';
}

const ClientList: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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
      // Simulation d'appel API au backend pour la génération IA
      const response = await fetch('/api/generate-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: selectedClient.id,
          messageType: messageType,
          recommendations: selectedClient.recommendations,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du message');
      }

      const data = await response.json();
      setGeneratedContent(data);
      setMessageContent(data.content);
    } catch (error) {
      console.error('Erreur:', error);
      setSnackbarMessage('Erreur lors de la génération du message');
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
    return mockClients.filter(client => {
      // Filtre de recherche
      const searchMatch = 
        filters.search === '' ||
        client.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        client.email.toLowerCase().includes(filters.search.toLowerCase());

      // Filtre de niveau de risque
      const riskLevel = getRiskLevel(client.riskScore).level;
      const riskMatch = 
        filters.riskLevel === 'all' ||
        (filters.riskLevel === 'high' && riskLevel === 'high') ||
        (filters.riskLevel === 'medium' && riskLevel === 'medium') ||
        (filters.riskLevel === 'low' && riskLevel === 'low');

      return searchMatch && riskMatch;
    });
  }, [filters, mockClients]);

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

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <GridItem xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Liste des Clients</Typography>
          </Box>
        </GridItem>

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
                <Button 
                  onClick={handleResetFilters}
                  fullWidth
                  variant="outlined"
                >
                  Réinitialiser
                </Button>
              </GridItem>
            </Grid>
          </Paper>
        </GridItem>

        <GridItem xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Client</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Dernier achat</TableCell>
                  <TableCell>Total dépensé</TableCell>
                  <TableCell>Risque de Churn</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredClients
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((client) => (
                    <React.Fragment key={client.id}>
                      <TableRow>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {client.name}
                            <IconButton size="small" onClick={() => toggleRowExpanded(client.id)}>
                              {expandedRows.has(client.id) ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{client.email}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {client.phone}
                          </Typography>
                        </TableCell>
                        <TableCell>{new Date(client.lastPurchase).toLocaleDateString()}</TableCell>
                        <TableCell>{client.totalSpent.toLocaleString()} €</TableCell>
                        <TableCell>
                          <Chip
                            label={`${client.riskScore}%`}
                            color={getRiskLevel(client.riskScore).color}
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
                      <TableRow>
                        <TableCell colSpan={6} sx={{ py: 0 }}>
                          <Collapse in={expandedRows.has(client.id)} timeout="auto" unmountOnExit>
                            <Box sx={{ py: 2 }}>
                              <Typography variant="h6" gutterBottom component="div">
                                Recommandations IA
                              </Typography>
                              <Grid container spacing={2}>
                                {client.recommendations.map((recommendation, index) => (
                                  <Grid item xs={12} md={4} key={index}>
                                    <Card variant="outlined">
                                      <CardContent>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                          <AutoAwesomeIcon color="primary" />
                                          <Typography variant="body2">{recommendation}</Typography>
                                        </Box>
                                      </CardContent>
                                    </Card>
                                  </Grid>
                                ))}
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
        </GridItem>
      </Grid>

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
                {selectedClient?.recommendations.map((recommendation, index) => (
                  <Alert 
                    key={index} 
                    severity="info" 
                    sx={{ mb: 1 }}
                    icon={<AutoAwesomeIcon />}
                  >
                    {recommendation}
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
    </Box>
  );
};

export default ClientList; 