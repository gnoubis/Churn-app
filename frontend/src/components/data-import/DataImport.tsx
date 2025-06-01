import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress,
  Paper,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Storage as StorageIcon,
  Link as LinkIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  DataObject as DataObjectIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import GridItem from '../common/GridItem';

interface ImportMethod {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

interface ERPConfig {
  type: string;
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
}

interface APIConfig {
  url: string;
  apiKey: string;
  secretKey: string;
}

interface ConfigStep {
  label: string;
  description: string;
  completed: boolean;
  optional?: boolean;
}

interface ERPSystem {
  name: string;
  description: string;
  modules: string[];
  formats: string[];
}

interface ImportProgress {
  status: 'idle' | 'processing' | 'success' | 'error';
  message: string;
  progress: number;
}

const ERPListItem = ({ name, description }: { name: string; description: string }) => (
  <ListItemButton component="div">
    <ListItemIcon>
      <StorageIcon />
    </ListItemIcon>
    <ListItemText 
      primary={name}
      secondary={description}
    />
  </ListItemButton>
);

const DataImport: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [importStatus, setImportStatus] = useState<'success' | 'error' | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedImportType, setSelectedImportType] = useState<'file' | 'erp' | 'api' | ''>('');
  const [erpConfig, setErpConfig] = useState<ERPConfig>({
    type: '',
    host: '',
    port: '',
    database: '',
    username: '',
    password: '',
  });
  const [apiConfig, setApiConfig] = useState<APIConfig>({
    url: '',
    apiKey: '',
    secretKey: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [configSteps, setConfigSteps] = useState<ConfigStep[]>([
    { label: 'Configuration de base', description: 'Paramètres de connexion', completed: false },
    { label: 'Test de connexion', description: 'Vérification des accès', completed: false },
    { label: 'Mapping des données', description: 'Configuration des champs', completed: false },
    { label: 'Planification', description: 'Fréquence de synchronisation', optional: true, completed: false },
  ]);

  const [currentConfigStep, setCurrentConfigStep] = useState(0);
  const [testProgress, setTestProgress] = useState(0);
  const [isTesting, setIsTesting] = useState(false);
  const [mappingFields, setMappingFields] = useState<Array<{ source: string; target: string }>>([
    { source: 'customer_id', target: 'id' },
    { source: 'customer_name', target: 'name' },
    { source: 'email_address', target: 'email' },
  ]);

  const steps = ['Sélection de la source', 'Configuration', 'Validation'];

  const [importProgress, setImportProgress] = useState<ImportProgress>({
    status: 'idle',
    message: '',
    progress: 0,
  });

  const [csvData, setCsvData] = useState<{
    headers: string[];
    preview: any[];
    totalRows: number;
  }>({
    headers: [],
    preview: [],
    totalRows: 0,
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setActiveStep(1);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      // Simulation d'upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      setImportStatus('success');
      setActiveStep(2);
    } catch (error) {
      setImportStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleErpConfigChange = (field: keyof ERPConfig) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setErpConfig({
      ...erpConfig,
      [field]: event.target.value,
    });
  };

  const handleApiConfigChange = (field: keyof APIConfig) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setApiConfig({
      ...apiConfig,
      [field]: event.target.value,
    });
  };

  const handleNext = () => {
    if (currentConfigStep === configSteps.length - 1) {
      handleImport();
    } else {
      setCurrentConfigStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentConfigStep((prev) => prev - 1);
  };

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Simulation d'import
      await new Promise((resolve) => setTimeout(resolve, 2000));

      switch (selectedImportType) {
        case 'file':
          if (!selectedFile) throw new Error('Aucun fichier sélectionné');
          setSuccess('Fichier importé avec succès');
          break;

        case 'erp':
          if (!erpConfig.host || !erpConfig.database) {
            throw new Error('Configuration ERP incomplète');
          }
          setSuccess('Connexion ERP établie avec succès');
          break;

        case 'api':
          if (!apiConfig.url || !apiConfig.apiKey) {
            throw new Error('Configuration API incomplète');
          }
          setSuccess('Connexion API établie avec succès');
          break;

        default:
          throw new Error('Type d\'import non sélectionné');
      }

      setTimeout(() => {
        setOpenDialog(null);
        setActiveStep(0);
        setSelectedImportType('');
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleCSVFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setImportProgress({ status: 'processing', message: 'Analyse du fichier...', progress: 0 });

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(header => header.trim());
        
        // Prévisualisation des 5 premières lignes
        const preview = lines.slice(1, 6).map(line => {
          const values = line.split(',').map(value => value.trim());
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index];
            return obj;
          }, {} as any);
        });

        setCsvData({
          headers,
          preview,
          totalRows: lines.length - 1
        });

        setImportProgress({
          status: 'success',
          message: `Fichier analysé avec succès. ${lines.length - 1} lignes trouvées.`,
          progress: 100
        });

        // Ouvrir le dialogue de configuration
        setOpenDialog('csv-config');
      };

      reader.onerror = () => {
        setImportProgress({
          status: 'error',
          message: 'Erreur lors de la lecture du fichier',
          progress: 0
        });
      };

      reader.readAsText(file);
    } catch (error) {
      setImportProgress({
        status: 'error',
        message: 'Erreur lors de l\'analyse du fichier',
        progress: 0
      });
    }
  };

  const handleERPConnection = async () => {
    setIsTesting(true);
    setTestProgress(0);
    
    try {
      // Simuler les étapes de connexion
      const steps = [
        { message: 'Vérification des paramètres...', duration: 1000 },
        { message: 'Test de la connexion réseau...', duration: 1500 },
        { message: 'Authentification...', duration: 2000 },
        { message: 'Vérification des permissions...', duration: 1500 },
      ];

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        setImportProgress({
          status: 'processing',
          message: step.message,
          progress: (i + 1) * (100 / steps.length)
        });

        await new Promise(resolve => setTimeout(resolve, step.duration));
      }

      // Simuler une connexion réussie
      setImportProgress({
        status: 'success',
        message: 'Connexion ERP établie avec succès',
        progress: 100
      });

      setConfigSteps(prev => 
        prev.map((step, idx) => 
          idx === currentConfigStep ? { ...step, completed: true } : step
        )
      );

      // Passer à l'étape suivante après un court délai
      setTimeout(() => {
        setCurrentConfigStep(prev => prev + 1);
      }, 1000);

    } catch (error) {
      setImportProgress({
        status: 'error',
        message: 'Erreur lors de la connexion à l\'ERP',
        progress: 0
      });
    } finally {
      setIsTesting(false);
    }
  };

  const renderCSVPreview = () => {
    if (!csvData.headers.length) return null;

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Aperçu des données
        </Typography>
        <Paper sx={{ overflow: 'auto', maxHeight: 400 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {csvData.headers.map((header, index) => (
                  <TableCell key={index}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {csvData.preview.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {csvData.headers.map((header, cellIndex) => (
                    <TableCell key={cellIndex}>{row[header]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Affichage de {csvData.preview.length} lignes sur {csvData.totalRows} au total
        </Typography>
      </Box>
    );
  };

  const importMethods: ImportMethod[] = [
    {
      id: 'csv',
      title: 'Import CSV',
      description: 'Importez vos données clients depuis un fichier CSV',
      icon: <CloudUploadIcon fontSize="large" color="primary" />,
      action: () => {
        const input = document.getElementById('csv-upload') as HTMLInputElement;
        if (input) {
          input.click();
        }
      },
    },
    {
      id: 'erp',
      title: 'Connexion ERP',
      description: 'Connectez-vous directement à votre ERP',
      icon: <LinkIcon fontSize="large" color="primary" />,
      action: () => setOpenDialog('erp'),
    },
    {
      id: 'api',
      title: 'API Personnalisée',
      description: 'Intégrez vos données via une API REST',
      icon: <StorageIcon fontSize="large" color="primary" />,
      action: () => setOpenDialog('api'),
    },
  ];

  const erpSystems: ERPSystem[] = [
    {
      name: 'SAP',
      description: 'Connectez-vous à SAP ERP',
      modules: ['SD (Sales & Distribution)', 'CRM', 'FI (Finance)'],
      formats: ['RFC', 'BAPI', 'IDoc'],
    },
    {
      name: 'Oracle',
      description: 'Connectez-vous à Oracle ERP',
      modules: ['Order Management', 'Customer Master', 'Receivables'],
      formats: ['REST API', 'Database', 'SOAP'],
    },
    {
      name: 'Microsoft Dynamics',
      description: 'Connectez-vous à Microsoft Dynamics',
      modules: ['Sales', 'Customer Service', 'Field Service'],
      formats: ['Web API', 'OData', 'Custom Entities'],
    },
    {
      name: 'Sage',
      description: 'Connectez-vous à Sage',
      modules: ['Sales Management', 'CRM', 'Accounting'],
      formats: ['ODBC', 'REST API', 'Direct SQL'],
    },
  ];

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestProgress(0);

    const simulateProgress = () => {
      setTestProgress((oldProgress) => {
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    };

    const interval = setInterval(simulateProgress, 500);

    try {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      setConfigSteps((prev) =>
        prev.map((step, index) =>
          index === currentConfigStep ? { ...step, completed: true } : step
        )
      );
      setSuccess('Test de connexion réussi');
      setCurrentConfigStep((prev) => prev + 1);
    } catch (error) {
      setError('Erreur lors du test de connexion');
    } finally {
      clearInterval(interval);
      setIsTesting(false);
      setTestProgress(100);
    }
  };

  const renderConfigurationStep = () => {
    switch (currentConfigStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configuration de base
            </Typography>
            <Grid container spacing={2}>
              <GridItem xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Type d'ERP</InputLabel>
                  <Select
                    value={erpConfig.type}
                    onChange={(e) => handleErpConfigChange('type')(e as any)}
                    label="Type d'ERP"
                  >
                    {erpSystems.map((system) => (
                      <MenuItem key={system.name.toLowerCase()} value={system.name.toLowerCase()}>
                        {system.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem xs={8}>
                <TextField
                  fullWidth
                  label="Hôte"
                  value={erpConfig.host}
                  onChange={handleErpConfigChange('host')}
                />
              </GridItem>
              <GridItem xs={4}>
                <TextField
                  fullWidth
                  label="Port"
                  value={erpConfig.port}
                  onChange={handleErpConfigChange('port')}
                />
              </GridItem>
            </Grid>
            <Box sx={{ mt: 3 }}>
              <Alert severity="info" icon={<InfoIcon />}>
                <Typography variant="subtitle2" gutterBottom>
                  Informations importantes :
                </Typography>
                <Typography variant="body2">
                  • Assurez-vous d'avoir les droits d'accès nécessaires
                  <br />
                  • Utilisez une connexion sécurisée (SSL/TLS)
                  <br />
                  • Vérifiez les pare-feu et les restrictions réseau
                </Typography>
              </Alert>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Test de connexion
            </Typography>
            <Box sx={{ width: '100%', mb: 3 }}>
              <LinearProgress 
                variant="determinate" 
                value={testProgress} 
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                {testProgress === 100 ? 'Test terminé' : 'Test en cours...'}
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <GridItem xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Éléments vérifiés :
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Connexion réseau" 
                        secondary="Vérification de l'accessibilité"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Authentification" 
                        secondary="Validation des identifiants"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Permissions" 
                        secondary="Vérification des droits d'accès"
                      />
                    </ListItem>
                  </List>
                </Paper>
              </GridItem>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Mapping des données
            </Typography>
            <Grid container spacing={2}>
              <GridItem xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Configuration du mapping :
                  </Typography>
                  {mappingFields.map((field, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <GridItem xs={5}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Champ source"
                            value={field.source}
                          />
                        </GridItem>
                        <GridItem xs={2} sx={{ textAlign: 'center' }}>
                          <DataObjectIcon />
                        </GridItem>
                        <GridItem xs={5}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Champ cible"
                            value={field.target}
                          />
                        </GridItem>
                      </Grid>
                    </Box>
                  ))}
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    sx={{ mt: 2 }}
                  >
                    Ajouter un champ
                  </Button>
                </Paper>
              </GridItem>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Planification
            </Typography>
            <Grid container spacing={2}>
              <GridItem xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Fréquence de synchronisation :
                  </Typography>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Fréquence</InputLabel>
                    <Select
                      value="daily"
                      label="Fréquence"
                    >
                      <MenuItem value="hourly">Toutes les heures</MenuItem>
                      <MenuItem value="daily">Quotidienne</MenuItem>
                      <MenuItem value="weekly">Hebdomadaire</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Heure d'exécution</InputLabel>
                    <Select
                      value="00:00"
                      label="Heure d'exécution"
                    >
                      <MenuItem value="00:00">00:00</MenuItem>
                      <MenuItem value="06:00">06:00</MenuItem>
                      <MenuItem value="12:00">12:00</MenuItem>
                      <MenuItem value="18:00">18:00</MenuItem>
                    </Select>
                  </FormControl>
                </Paper>
              </GridItem>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  const renderERPDetails = (system: ERPSystem) => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Modules disponibles :
      </Typography>
      <Box sx={{ mb: 2 }}>
        {system.modules.map((module) => (
          <Chip
            key={module}
            label={module}
            sx={{ mr: 1, mb: 1 }}
            size="small"
          />
        ))}
      </Box>
      <Typography variant="subtitle2" gutterBottom>
        Formats supportés :
      </Typography>
      <Box>
        {system.formats.map((format) => (
          <Chip
            key={format}
            label={format}
            variant="outlined"
            sx={{ mr: 1, mb: 1 }}
            size="small"
          />
        ))}
      </Box>
    </Box>
  );

  const renderERPConnectionStatus = () => {
    if (importProgress.status === 'idle') return null;

    return (
      <Box sx={{ mt: 2 }}>
        <LinearProgress 
          variant="determinate" 
          value={importProgress.progress}
          sx={{ 
            height: 10, 
            borderRadius: 5,
            backgroundColor: importProgress.status === 'error' ? 'error.light' : undefined,
          }}
        />
        <Typography 
          variant="body2" 
          color={importProgress.status === 'error' ? 'error' : 'text.secondary'}
          align="center" 
          sx={{ mt: 1 }}
        >
          {importProgress.message}
        </Typography>
      </Box>
    );
  };

  const renderCSVDialog = () => (
    <Dialog
      open={openDialog === 'csv-config'}
      onClose={() => setOpenDialog(null)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudUploadIcon color="primary" />
          <Typography variant="h6">Configuration de l'import CSV</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Alert severity="info">
            <Typography variant="body2">
              Fichier sélectionné : {selectedFile?.name}
              <br />
              Taille : {selectedFile?.size ? Math.round(selectedFile.size / 1024) + ' KB' : ''}
            </Typography>
          </Alert>
        </Box>
        {renderCSVPreview()}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenDialog(null)}>
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={handleImport}
          disabled={importProgress.status === 'processing'}
        >
          Importer
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <GridItem xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5">Configuration des Sources de Données</Typography>
          </Box>
        </GridItem>

        {importMethods.map((method) => (
          <GridItem xs={12} md={4} key={method.id}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => theme.shadows[8],
                },
              }}
              onClick={method.action}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                {method.icon}
                <Typography variant="h6" sx={{ mt: 2 }}>
                  {method.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {method.description}
                </Typography>
              </CardContent>
            </Card>
          </GridItem>
        ))}
      </Grid>

      <Dialog 
        open={openDialog === 'erp'} 
        onClose={() => !isTesting && setOpenDialog(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StorageIcon color="primary" />
            <Typography variant="h6">Configuration ERP</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={currentConfigStep} sx={{ mb: 4 }}>
            {configSteps.map((step) => (
              <Step key={step.label} completed={step.completed}>
                <StepLabel optional={step.optional && <Typography variant="caption">Optionnel</Typography>}>
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {renderConfigurationStep()}
          {renderERPConnectionStatus()}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDialog(null)} 
            disabled={isTesting}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={currentConfigStep === 1 ? handleERPConnection : handleNext}
            disabled={isTesting}
            startIcon={currentConfigStep === 1 ? <SecurityIcon /> : undefined}
          >
            {currentConfigStep === configSteps.length - 1
              ? 'Terminer'
              : currentConfigStep === 1
              ? 'Tester la connexion'
              : 'Suivant'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour la connexion ERP */}
      <Dialog 
        open={openDialog === 'erp'} 
        onClose={() => setOpenDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Connexion à votre ERP</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Sélectionnez votre système ERP
            </Typography>
            <List>
              {erpSystems.map((system) => (
                <ERPListItem 
                  key={system.name}
                  name={system.name}
                  description={system.description}
                />
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <GridItem xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Type d'ERP</InputLabel>
                  <Select
                    value={erpConfig.type}
                    onChange={(e) => handleErpConfigChange('type')(e as any)}
                    label="Type d'ERP"
                  >
                    <MenuItem value="sap">SAP</MenuItem>
                    <MenuItem value="oracle">Oracle</MenuItem>
                    <MenuItem value="dynamics">Microsoft Dynamics</MenuItem>
                    <MenuItem value="sage">Sage</MenuItem>
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem xs={8}>
                <TextField
                  fullWidth
                  label="Hôte"
                  value={erpConfig.host}
                  onChange={handleErpConfigChange('host')}
                />
              </GridItem>
              <GridItem xs={4}>
                <TextField
                  fullWidth
                  label="Port"
                  value={erpConfig.port}
                  onChange={handleErpConfigChange('port')}
                />
              </GridItem>
              <GridItem xs={12}>
                <TextField
                  fullWidth
                  label="Base de données"
                  value={erpConfig.database}
                  onChange={handleErpConfigChange('database')}
                />
              </GridItem>
              <GridItem xs={12}>
                <TextField
                  fullWidth
                  label="Nom d'utilisateur"
                  value={erpConfig.username}
                  onChange={handleErpConfigChange('username')}
                />
              </GridItem>
              <GridItem xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  label="Mot de passe"
                  value={erpConfig.password}
                  onChange={handleErpConfigChange('password')}
                />
              </GridItem>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(null)}>Annuler</Button>
          <Button 
            variant="contained" 
            onClick={handleImport}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Connecter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour la configuration API */}
      <Dialog 
        open={openDialog === 'api'} 
        onClose={() => setOpenDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Configuration de l'API</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <GridItem xs={12}>
                <TextField
                  fullWidth
                  label="URL de l'API"
                  value={apiConfig.url}
                  onChange={handleApiConfigChange('url')}
                />
              </GridItem>
              <GridItem xs={12}>
                <TextField
                  fullWidth
                  label="Clé API"
                  value={apiConfig.apiKey}
                  onChange={handleApiConfigChange('apiKey')}
                />
              </GridItem>
              <GridItem xs={12}>
                <TextField
                  fullWidth
                  label="Clé secrète"
                  type="password"
                  value={apiConfig.secretKey}
                  onChange={handleApiConfigChange('secretKey')}
                />
              </GridItem>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(null)}>Annuler</Button>
          <Button 
            variant="contained" 
            onClick={handleImport}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Connecter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les messages de succès/erreur */}
      {(success || error) && (
        <Alert
          severity={success ? 'success' : 'error'}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
          }}
        >
          {success || error}
        </Alert>
      )}

      <input
        type="file"
        id="csv-upload"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={handleCSVFileSelect}
      />

      {/* Ajouter le dialogue CSV */}
      {renderCSVDialog()}
    </Box>
  );
};

export default DataImport; 