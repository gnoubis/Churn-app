import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  DialogContentText,
  Grid,
  Chip,
  SelectChangeEvent,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import MessageIcon from '@mui/icons-material/Message';
import PhoneIcon from '@mui/icons-material/Phone';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';

// Données simulées pour les communications
const communicationsData = [
  {
    id: 1,
    type: 'email',
    date: '2024-03-15',
    time: '10:30',
    client: 'Entreprise ABC',
    subject: 'Suivi de satisfaction',
    content: 'Email de suivi concernant les nouveaux services mis en place. Nous avons remarqué une baisse d\'utilisation de certaines fonctionnalités et aimerions comprendre vos besoins actuels.',
    status: 'sent',
  },
  {
    id: 2,
    type: 'message',
    date: '2024-03-14',
    time: '15:45',
    client: 'Société XYZ',
    subject: 'Support technique',
    content: 'Message concernant la résolution du ticket #12345. L\'équipe technique a identifié et corrigé le problème de performance signalé.',
    status: 'received',
  },
  {
    id: 3,
    type: 'phone',
    date: '2024-03-14',
    time: '11:20',
    client: 'Corporation 123',
    subject: 'Appel de suivi',
    content: 'Discussion sur les nouvelles fonctionnalités demandées. Le client souhaite une personnalisation plus poussée du tableau de bord et des rapports automatisés.',
    status: 'completed',
  },
  {
    id: 4,
    type: 'email',
    date: '2024-03-13',
    time: '09:15',
    client: 'Entreprise DEF',
    subject: 'Renouvellement de contrat',
    content: 'Proposition de renouvellement avec nouvelles conditions. Offre spéciale de fidélité incluant un accès premium aux nouvelles fonctionnalités.',
    status: 'sent',
  },
];

// Données simulées des clients à risque
const clientsArisque = [
  { id: 1, name: 'Entreprise ABC', riskScore: 85 },
  { id: 2, name: 'Société XYZ', riskScore: 75 },
  { id: 3, name: 'Corporation 123', riskScore: 90 },
  { id: 4, name: 'Entreprise DEF', riskScore: 70 },
];

interface Communication {
  id: number;
  type: string;
  date: string;
  time: string;
  client: string;
  subject: string;
  content: string;
  status: string;
}

interface NewCommunication {
  type: string;
  client: string;
  subject: string;
  content: string;
}

interface ApiMessage {
  id: number;
  client: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  tone: string;
  channel: string;
  recommended_offer: string;
  prompt: string | null;
  temperature: number;
  max_tokens: number;
  message: string;
  model_response: { send_status: string };
  timestamp: string;
}

const Communications: React.FC = () => {
  const theme = useTheme();
  const [communicationType, setCommunicationType] = useState<'all' | 'email' | 'message' | 'phone'>('all');
  const [selectedMessage, setSelectedMessage] = useState<Communication | ApiMessage | null>(null);
  const [openNewComm, setOpenNewComm] = useState(false);
  const [newComm, setNewComm] = useState<NewCommunication>({
    type: 'email',
    client: '',
    subject: '',
    content: '',
  });

  const [apiMessages, setApiMessages] = useState<ApiMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  useEffect(() => {
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('http://localhost:8000/api/messages/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Erreur lors du chargement des messages');
        const data = await response.json();
        setApiMessages(data);
      } catch (err) {
        // Optionnel: afficher une erreur
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, []);

  const handleCommunicationTypeChange = (event: React.SyntheticEvent, newValue: 'all' | 'email' | 'message' | 'phone') => {
    if (newValue !== null) {
      setCommunicationType(newValue);
    }
  };

  const handleMessageClick = (message: Communication) => {
    setSelectedMessage(message);
  };

  const handleCloseMessage = () => {
    setSelectedMessage(null);
  };

  const handleOpenNewComm = () => {
    setOpenNewComm(true);
  };

  const handleCloseNewComm = () => {
    setOpenNewComm(false);
    setNewComm({
      type: 'email',
      client: '',
      subject: '',
      content: '',
    });
  };

  const handleNewCommChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = event.target;
    setNewComm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendNewComm = () => {
    // Ici, vous ajouteriez la logique pour envoyer la communication
    console.log('Nouvelle communication:', newComm);
    handleCloseNewComm();
  };


  
  const getIconByType = (type: string) => {
    switch (type) {
      case 'email':
        return <EmailIcon color="primary" />;
      case 'message':
        return <MessageIcon color="info" />;
      case 'phone':
        return <PhoneIcon color="success" />;
      default:
        return <MessageIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'success';
      case 'received':
        return 'info';
      case 'completed':
        return 'primary';
      default:
        return 'default';
    }
  };

  const filteredCommunications = communicationType === 'all'
    ? communicationsData
    : communicationsData.filter(comm => comm.type === communicationType);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography 
        variant="h5" 
        sx={{ 
          mb: 4,
          fontWeight: 600,
          color: theme.palette.text.primary,
        }}
      >
        Historique des Communications
      </Typography>

      <Card sx={{ 
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
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}>
            <Tabs
              value={communicationType}
              onChange={handleCommunicationTypeChange}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  minWidth: 100,
                },
              }}
            >
              <Tab 
                label="Tous" 
                value="all"
                sx={{ 
                  borderRadius: 2,
                  mr: 1,
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                  },
                }}
              />
              <Tab 
                label="Emails" 
                value="email"
                icon={<EmailIcon />}
                iconPosition="start"
                sx={{ 
                  borderRadius: 2,
                  mr: 1,
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                  },
                }}
              />
              <Tab 
                label="Messages" 
                value="message"
                icon={<MessageIcon />}
                iconPosition="start"
                sx={{ 
                  borderRadius: 2,
                  mr: 1,
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                  },
                }}
              />
              <Tab 
                label="Appels" 
                value="phone"
                icon={<PhoneIcon />}
                iconPosition="start"
                sx={{ 
                  borderRadius: 2,
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                  },
                }}
              />
            </Tabs>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenNewComm}
                sx={{ 
                  textTransform: 'none',
                  borderRadius: 2,
                }}
              >
                Nouvelle communication
              </Button>
            </Box>
          </Box>

          <List sx={{ width: '100%' }}>
            {loadingMessages && (
              <ListItem>
                <ListItemText primary="Chargement des messages..." />
              </ListItem>
            )}
            {apiMessages
              .filter(
                msg =>
                  (communicationType === 'all' || msg.channel === communicationType) &&
                  msg.model_response &&
                  typeof msg.model_response.send_status === 'string' &&
                  msg.model_response.send_status // doit exister et ne pas être vide
              )
              .map((msg, index) => (
                <React.Fragment key={msg.id}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      py: 2,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                      },
                    }}
                    onClick={() => setSelectedMessage(msg)}
                  >
                    <ListItemIcon>
                      {msg.channel === 'email' ? <EmailIcon color="primary" /> : <MessageIcon color="info" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {msg.message.startsWith('Subject:')
                              ? msg.message.split('\n')[0].replace('Subject:', '').trim()
                              : 'Message'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              size="small"
                              label={msg.model_response?.send_status === 'email_sent' ? 'Email envoyé' : 'SMS envoyé'}
                              color="success"
                            />
                            <Typography variant="caption" color="text.secondary">
                              {new Date(msg.timestamp).toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                            sx={{ display: 'block', mb: 0.5 }}
                          >
                            {msg.client && msg.client.name
                              ? `${msg.client.name} — ${msg.client.email ?? ''}`
                              : 'Client inconnu'}
                          </Typography>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {msg.message}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
          </List>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedMessage}
        onClose={handleCloseMessage}
        maxWidth="md"
        fullWidth
      >
        {selectedMessage && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  {'message' in selectedMessage && selectedMessage.message?.startsWith('Subject:')
                    ? selectedMessage.message.split('\n')[0].replace('Subject:', '').trim()
                    : 'subject' in selectedMessage && selectedMessage.subject
                      ? selectedMessage.subject
                      : 'Message'}
                </Typography>
                <IconButton onClick={handleCloseMessage} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                {'client' in selectedMessage && selectedMessage.client && typeof selectedMessage.client === 'object' ? (
                  <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                    Client : {selectedMessage.client.name} — {selectedMessage.client.email}
                  </Typography>
                ) : (
                  <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                    {`Client : ${selectedMessage.client ?? 'inconnu'}`}
                  </Typography>
                )}
                {'model_response' in selectedMessage ? (
                  <Chip
                    size="small"
                    label={selectedMessage.model_response?.send_status === 'email_sent' ? 'Email envoyé' : 'SMS envoyé'}
                    color="success"
                    sx={{ mr: 1 }}
                  />
                ) : (
                  <Chip
                    size="small"
                    label={selectedMessage.status === 'sent' ? 'Email envoyé' : selectedMessage.status}
                    color="success"
                    sx={{ mr: 1 }}
                  />
                )}
                <Typography variant="body2" color="text.secondary" sx={{ display: 'inline' }}>
                  {'timestamp' in selectedMessage
                    ? new Date(selectedMessage.timestamp).toLocaleString()
                    : `${selectedMessage.date} ${selectedMessage.time}`}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {'message' in selectedMessage
                  ? selectedMessage.message
                  : selectedMessage.content}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseMessage}>Fermer</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      {/* Dialog pour créer une nouvelle communication */}
      <Dialog
        open={openNewComm}
        onClose={handleCloseNewComm}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Nouvelle Communication</Typography>
            <IconButton onClick={handleCloseNewComm} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Sélectionnez un client à risque et envoyez-lui une communication personnalisée.
          </DialogContentText>
          <Grid container spacing={3}>
            <Grid sx={{ width: '100%', mb: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Type de communication</InputLabel>
                <Select
                  name="type"
                  value={newComm.type}
                  onChange={handleNewCommChange}
                  label="Type de communication"
                >
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="message">Message</MenuItem>
                  <MenuItem value="phone">Appel</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid sx={{ width: '100%', mb: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Client à risque</InputLabel>
                <Select
                  name="client"
                  value={newComm.client}
                  onChange={handleNewCommChange}
                  label="Client à risque"
                >
                  {clientsArisque.map((client) => (
                    <MenuItem key={client.id} value={client.name}>
                      {client.name} - Score de risque: {client.riskScore}%
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid sx={{ width: '100%', mb: 2 }}>
              <TextField
                fullWidth
                label="Sujet"
                name="subject"
                value={newComm.subject}
                onChange={handleNewCommChange}
              />
            </Grid>
            <Grid sx={{ width: '100%', mb: 2 }}>
              <TextField
                fullWidth
                label="Contenu"
                name="content"
                value={newComm.content}
                onChange={handleNewCommChange}
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewComm}>Annuler</Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleSendNewComm}
            disabled={!newComm.client || !newComm.subject || !newComm.content}
          >
            Envoyer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Communications; 