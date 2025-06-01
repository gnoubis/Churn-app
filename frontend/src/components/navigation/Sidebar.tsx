import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  Message as MessageIcon,
  Insights as InsightsIcon,
  CloudUpload as CloudUploadIcon,
  Recommend as RecommendIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const drawerWidth = 240;

interface SidebarProps {
  open: boolean;
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  description: string;
}

const menuItems: MenuItem[] = [
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
    description: 'Gestion de la base clients',
  },
  {
    text: 'Analyse des sentiments',
    icon: <InsightsIcon />,
    path: '/sentiments',
    description: 'Analyse des retours clients',
  },
  {
    text: 'Analytics',
    icon: <AnalyticsIcon />,
    path: '/analytics',
    description: 'Analyses approfondies et rapports',
  },
  {
    text: 'Communications',
    icon: <MessageIcon />,
    path: '/communications',
    description: 'Gestion des communications clients',
  },
  {
    text: 'Import de données',
    icon: <CloudUploadIcon />,
    path: '/data-import',
    description: 'Import et mise à jour des données',
  },
  {
    text: 'Recommandations',
    icon: <RecommendIcon />,
    path: '/recommendations',
    description: 'Suggestions d\'actions préventives',
  },
];

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : theme.spacing(7),
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : theme.spacing(7),
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
          backgroundColor: theme.palette.background.default,
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Box sx={{ mt: 8 }}>
        <List>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                <Tooltip
                  title={open ? '' : item.description}
                  placement="right"
                >
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? 'initial' : 'center',
                      px: 2.5,
                      backgroundColor: isActive
                        ? alpha(theme.palette.primary.main, 0.1)
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 2 : 'auto',
                        justifyContent: 'center',
                        color: isActive
                          ? theme.palette.primary.main
                          : theme.palette.text.secondary,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{
                        opacity: open ? 1 : 0,
                        color: isActive
                          ? theme.palette.primary.main
                          : theme.palette.text.primary,
                      }}
                    />
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 