import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import EmailIcon from '@mui/icons-material/Email';
import MessageIcon from '@mui/icons-material/Message';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GridItem from '../common/GridItem';

interface Client {
  id: string;
  name: string;
  riskScore: number;
  recommendations: string[];
  lastContact: string;
  status: 'high' | 'medium' | 'low';
}

interface GenerateMessageResponse {
  content: string;
  subject?: string;
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'Jean Dupont',
    riskScore: 85,
    recommendations: [
      'Proposer une remise de fidélité',
      'Planifier un appel de suivi',
      'Envoyer une enquête de satisfaction'
    ],
    lastContact: '2024-02-15',
    status: 'high'
  },
  {
    id: '2',
    name: 'Marie Martin',
    riskScore: 65,
    recommendations: [
      'Envoyer une newsletter personnalisée',
      'Offrir un service premium gratuit pendant 1 mois'
    ],
    lastContact: '2024-02-10',
    status: 'medium'
  },
  // Ajoutez d'autres clients selon vos besoins
];

const ClientRecommendations: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [messageType, setMessageType] = useState<'email' | 'message'>('email');
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GenerateMessageResponse | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleGenerateMessage = async () => {
    setLoading(true);
    try {
      // Simulation d'appel API au backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Ceci sera remplacé par un vrai appel API
      const response: GenerateMessageResponse = {
        subject: messageType === 'email' ? 'Important : Votre satisfaction est notre priorité' : undefined,
        content: `Cher ${selectedClient?.name},\n\nNous avons remarqué que vous pourriez avoir des questions ou des préoccupations concernant nos services. Nous tenons à vous assurer que votre satisfaction est notre priorité absolue.\n\nVoici quelques propositions personnalisées pour vous :\n${selectedClient?.recommendations.map(r => `- ${r}`).join('\n')}\n\nN'hésitez pas à nous contacter pour en discuter.\n\nCordialement,\nVotre équipe dédiée`
      };
      
      setGeneratedContent(response);
    } catch (error) {
      console.error('Erreur lors de la génération du message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyContent = () => {
    if (generatedContent) {
      const textToCopy = messageType === 'email' 
        ? `Sujet: ${generatedContent.subject}\n\n${generatedContent.content}`
        : generatedContent.content;
      
      navigator.clipboard.writeText(textToCopy);
      setOpenSnackbar(true);
    }
  };

  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Recommandations Clients
      </Typography>

      <Grid container spacing={4}>
        {mockClients.map((client) => (
          <GridItem key={client.id} xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {client.name}
                  </Typography>
                  <Chip
                    icon={<WarningIcon />}
                    label={`Risque ${client.riskScore}%`}
                    color={getStatusColor(client.status)}
                  />
                </Box>

                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Dernier contact: {client.lastContact}
                </Typography>

                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                  Recommandations:
                </Typography>
                <Box sx={{ pl: 2 }}>
                  {client.recommendations.map((rec, index) => (
                    <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                      • {rec}
                    </Typography>
                  ))}
                </Box>

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<EmailIcon />}
                    onClick={() => {
                      setSelectedClient(client);
                      setMessageType('email');
                      setOpenDialog(true);
                    }}
                  >
                    Générer Email
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<MessageIcon />}
                    onClick={() => {
                      setSelectedClient(client);
                      setMessageType('message');
                      setOpenDialog(true);
                    }}
                  >
                    Générer Message
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </GridItem>
        ))}
      </Grid>

      {/* Dialog de génération de message */}
      <Dialog 
        open={openDialog} 
        onClose={() => {
          setOpenDialog(false);
          setGeneratedContent(null);
          setPreviewMode(false);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Générer un {messageType === 'email' ? 'email' : 'message'} pour {selectedClient?.name}
        </DialogTitle>
        <DialogContent>
          {!generatedContent ? (
            <Box sx={{ mt: 2 }}>
              <FormControl component="fieldset">
                <Typography variant="subtitle1" gutterBottom>
                  Type de communication :
                </Typography>
                <RadioGroup
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value as 'email' | 'message')}
                >
                  <FormControlLabel 
                    value="email" 
                    control={<Radio />} 
                    label="Email (avec objet et formatage complet)" 
                  />
                  <FormControlLabel 
                    value="message" 
                    control={<Radio />} 
                    label="Message court (pour SMS ou notification)" 
                  />
                </RadioGroup>
              </FormControl>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              {messageType === 'email' && (
                <>
                  <Typography variant="subtitle2" color="textSecondary">
                    Objet:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {generatedContent.subject}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                </>
              )}
              <Typography
                variant="body1"
                component="pre"
                sx={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  backgroundColor: (theme) => theme.palette.grey[50],
                  p: 2,
                  borderRadius: 1
                }}
              >
                {generatedContent.content}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDialog(false);
            setGeneratedContent(null);
            setPreviewMode(false);
          }}>
            Fermer
          </Button>
          {!generatedContent ? (
            <Button
              onClick={handleGenerateMessage}
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : undefined}
            >
              {loading ? 'Génération...' : 'Générer'}
            </Button>
          ) : (
            <Button
              onClick={handleCopyContent}
              variant="contained"
              startIcon={<ContentCopyIcon />}
            >
              Copier
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar de confirmation de copie */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          Contenu copié dans le presse-papiers !
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClientRecommendations; 