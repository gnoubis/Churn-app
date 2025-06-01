import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  useTheme,
  alpha,
  Typography,
  Divider,
  Tooltip,
  IconButton,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import MoodOutlinedIcon from '@mui/icons-material/MoodOutlined';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import EmailIcon from '@mui/icons-material/Email';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RecommendIcon from '@mui/icons-material/Recommend';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';

const drawerWidth = 280;

const menuItems = [
  {
    text: 'Tableau de bord',
    icon: <DashboardIcon />,
    path: '/dashboard',
    description: 'Vue d\'ensemble des indicateurs clés',
  },
  {
    text: 'Clients',
    icon: <PeopleIcon />,
    path: '/clients',
    description: 'Gestion et suivi des clients',
  },
  {
    text: 'Prédictions',
    icon: <AnalyticsIcon />,
    path: '/predictions',
    description: 'Prédictions de churn en temps réel',
  },
  {
    text: 'Configuration',
    icon: <CloudUploadIcon />,
    path: '/data-import',
    description: 'Import et mise à jour des données',
  },
  {
    text: 'Analyse des sentiments',
    icon: <MoodOutlinedIcon />,
    path: '/sentiments',
    description: 'Analyse des retours clients',
  },
  {
    text: 'Analytics',
    icon: <AnalyticsIcon />,
    path: '/analytics',
    description: 'Statistiques et analyses détaillées',
  },
  {
    text: 'Communications',
    icon: <EmailIcon />,
    path: '/communications',
    description: 'Gestion des communications clients',
  },
  {
    text: 'Recommandations',
    icon: <RecommendIcon />,
    path: '/recommendations',
    description: 'Suggestions d\'actions préventives',
  },
];

const Sidebar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const user = authService.getCurrentUser();

  const handleDrawerToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isCollapsed ? 80 : drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: isCollapsed ? 80 : drawerWidth,
          boxSizing: 'border-box',
          borderRight: 'none',
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[3],
          transition: theme.transitions.create(['width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
          }}
        >
          {!isCollapsed && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              App Churn
            </Typography>
          )}
          <IconButton onClick={handleDrawerToggle}>
            {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <List sx={{ flexGrow: 1, px: 2 }}>
          {menuItems.map((item) => (
            <Tooltip
              key={item.text}
              title={isCollapsed ? item.text : ''}
              placement="right"
            >
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    minHeight: 48,
                    backgroundColor: isActive(item.path)
                      ? alpha(theme.palette.primary.main, 0.08)
                      : 'transparent',
                    color: isActive(item.path)
                      ? theme.palette.primary.main
                      : theme.palette.text.primary,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: isCollapsed ? 0 : 36,
                      color: isActive(item.path)
                        ? theme.palette.primary.main
                        : theme.palette.text.primary,
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!isCollapsed && (
                    <Box>
                      <ListItemText
                        primary={item.text}
                        secondary={item.description}
                        primaryTypographyProps={{
                          fontWeight: isActive(item.path) ? 600 : 400,
                          variant: 'body2',
                        }}
                        secondaryTypographyProps={{
                          variant: 'caption',
                          sx: { opacity: 0.7 },
                        }}
                      />
                    </Box>
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          ))}

          {user?.role === 'admin' && (
            <Tooltip
              title={isCollapsed ? 'Gestion Utilisateurs' : ''}
              placement="right"
            >
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => navigate('/users')}
                  sx={{
                    borderRadius: 2,
                    minHeight: 48,
                    backgroundColor: isActive('/users')
                      ? alpha(theme.palette.primary.main, 0.08)
                      : 'transparent',
                    color: isActive('/users')
                      ? theme.palette.primary.main
                      : theme.palette.text.primary,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: isCollapsed ? 0 : 36,
                      color: isActive('/users')
                        ? theme.palette.primary.main
                        : theme.palette.text.primary,
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                    }}
                  >
                    <AdminPanelSettingsIcon />
                  </ListItemIcon>
                  {!isCollapsed && (
                    <Box>
                      <ListItemText
                        primary="Gestion Utilisateurs"
                        secondary="Administration des comptes"
                        primaryTypographyProps={{
                          fontWeight: isActive('/users') ? 600 : 400,
                          variant: 'body2',
                        }}
                        secondaryTypographyProps={{
                          variant: 'caption',
                          sx: { opacity: 0.7 },
                        }}
                      />
                    </Box>
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          )}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 