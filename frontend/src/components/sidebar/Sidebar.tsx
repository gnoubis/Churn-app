import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  Message as MessageIcon,
  Assessment as AssessmentIcon,
  ImportExport as ImportExportIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  SentimentSatisfied as SentimentIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';

interface SidebarProps {
  open: boolean;
}

const drawerWidth = 240;

const menuItems = [
  { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Clients', icon: <PeopleIcon />, path: '/clients' },
  { text: 'Prédictions', icon: <AssessmentIcon />, path: '/predictions' },
  { text: 'Sentiments', icon: <SentimentIcon />, path: '/sentiments' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
  { text: 'Communications', icon: <MessageIcon />, path: '/communications' },
  { text: 'Import de données', icon: <ImportExportIcon />, path: '/data-import' },
  { text: 'Recommandations', icon: <LightbulbIcon />, path: '/recommendations' },
];

const adminItems = [
  { text: 'Gestion des utilisateurs', icon: <AdminIcon />, path: '/users' },
];

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = authService.hasRole('admin');

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          ...(!open && {
            width: theme => theme.spacing(7),
            overflowX: 'hidden',
          }),
        },
      }}
      open={open}
    >
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      {isAdmin && (
        <>
          <Divider />
          <List>
            {adminItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Drawer>
  );
};

export default Sidebar; 