import React, { useState, ChangeEvent } from 'react';
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

const Communications: React.FC = () => {
  const theme = useTheme();
  const [communicationType, setCommunicationType] = useState<'all' | 'email' | 'message' | 'phone'>('all');
  const [selectedMessage, setSelectedMessage] = useState<Communication | null>(null);
  const [openNewComm, setOpenNewComm] = useState(false);
  const [newComm, setNewComm] = useState<NewCommunication>({
    type: 'email',
    client: '',
    subject: '',
    content: '',
  });

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
            {filteredCommunications.map((comm, index) => (
              <React.Fragment key={comm.id}>
                {index > 0 && <Divider component="li" />}
                <ListItem
                  alignItems="flex-start"
                  onClick={() => handleMessageClick(comm)}
                  sx={{
                    py: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                >
                  <ListItemIcon>
                    {getIconByType(comm.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {comm.subject}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            size="small" 
                            label={comm.status} 
                            color={getStatusColor(comm.status) as any}
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {comm.date} {comm.time}
                            </Typography>
                          </Box>
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
                          {comm.client}
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
                          {comm.content}
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

      {/* Dialog pour afficher le détail d'un message */}
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
                <Typography variant="h6">{selectedMessage.subject}</Typography>
                <IconButton onClick={handleCloseMessage} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid sx={{ display: 'flex' }}>
                    {getIconByType(selectedMessage.type)}
                  </Grid>
                  <Grid sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      {selectedMessage.client}
                    </Typography>
                  </Grid>
                  <Grid>
                    <Chip 
                      size="small" 
                      label={selectedMessage.status}
                      color={getStatusColor(selectedMessage.status) as any}
                    />
                  </Grid>
                  <Grid>
                    <Typography variant="body2" color="text.secondary">
                      {selectedMessage.date} {selectedMessage.time}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1">
                {selectedMessage.content}
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