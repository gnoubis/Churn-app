import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Box,
  useTheme,
  alpha,
  Badge,
  InputBase,
  Tooltip,
  Divider,
  ListItemIcon,
  MenuIcon,
  SearchIcon,
  NotificationsIcon,
  NotificationsActiveIcon,
  SettingsIcon,
  DarkModeIcon,
  LanguageIcon,
  SecurityIcon,
  HelpIcon,
  AccountCircle,
  PersonIcon,
  LogoutIcon
} from '../../mui';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { User } from '../../types/auth.types';

const Navbar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  const user = authService.getCurrentUser() as User | null;

  const getUserFullName = (user: User | null) => {
    if (!user) return 'Utilisateur';
    return user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user.username;
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSettingsMenu = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleNotificationsMenu = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const notifications = [
    {
      id: 1,
      title: 'Nouveau client à risque',
      message: 'Le client XYZ présente des signes de désengagement',
      time: '5 min',
    },
    {
      id: 2,
      title: 'Rapport hebdomadaire',
      message: 'Le rapport de la semaine est disponible',
      time: '1 heure',
    },
    {
      id: 3,
      title: 'Mise à jour système',
      message: 'Une nouvelle mise à jour est disponible',
      time: '2 heures',
    },
    {
      id: 4,
      title: 'Tâche en attente',
      message: 'Vous avez une communication en attente',
      time: '3 heures',
    },
  ];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              display: { xs: 'none', sm: 'block' },
              fontWeight: 600,
              background: `linear-gradient(45deg, ${alpha(
                theme.palette.common.white,
                0.9
              )}, ${alpha(theme.palette.common.white, 1)})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Système de Gestion du Churn
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              position: 'relative',
              borderRadius: theme.shape.borderRadius,
              backgroundColor: alpha(theme.palette.common.white, 0.15),
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.25),
              },
              marginRight: 2,
              marginLeft: 0,
              width: '100%',
              [theme.breakpoints.up('sm')]: {
                marginLeft: 3,
                width: 'auto',
              },
            }}
          >
            <Box
              sx={{
                padding: theme.spacing(0, 2),
                height: '100%',
                position: 'absolute',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SearchIcon />
            </Box>
            <InputBase
              placeholder="Rechercher..."
              sx={{
                color: 'inherit',
                '& .MuiInputBase-input': {
                  padding: theme.spacing(1, 1, 1, 0),
                  paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                  transition: theme.transitions.create('width'),
                  width: '100%',
                  [theme.breakpoints.up('md')]: {
                    width: '20ch',
                  },
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notifications">
              <IconButton color="inherit" onClick={handleNotificationsMenu}>
                <Badge badgeContent={notifications.length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={notificationsAnchorEl}
              open={Boolean(notificationsAnchorEl)}
              onClose={handleNotificationsClose}
              PaperProps={{
                sx: {
                  width: 320,
                  maxHeight: 400,
                  borderRadius: 2,
                  boxShadow: theme.shadows[3],
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Notifications</Typography>
                <IconButton size="small">
                  <NotificationsActiveIcon fontSize="small" />
                </IconButton>
              </Box>
              <Divider />
              {notifications.map((notification) => (
                <MenuItem key={notification.id} onClick={handleNotificationsClose} sx={{ py: 1.5 }}>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {notification.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Il y a {notification.time}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
              <Divider />
              <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'primary.main',
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Voir toutes les notifications
                </Typography>
              </Box>
            </Menu>

            <Tooltip title="Paramètres">
              <IconButton color="inherit" onClick={handleSettingsMenu}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={settingsAnchorEl}
              open={Boolean(settingsAnchorEl)}
              onClose={handleSettingsClose}
              PaperProps={{
                sx: {
                  width: 220,
                  borderRadius: 2,
                  boxShadow: theme.shadows[3],
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleSettingsClose}>
                <ListItemIcon>
                  <DarkModeIcon fontSize="small" />
                </ListItemIcon>
                Mode sombre
              </MenuItem>
              <MenuItem onClick={handleSettingsClose}>
                <ListItemIcon>
                  <LanguageIcon fontSize="small" />
                </ListItemIcon>
                Langue
              </MenuItem>
              <MenuItem onClick={handleSettingsClose}>
                <ListItemIcon>
                  <SecurityIcon fontSize="small" />
                </ListItemIcon>
                Sécurité
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleSettingsClose}>
                <ListItemIcon>
                  <HelpIcon fontSize="small" />
                </ListItemIcon>
                Aide
              </MenuItem>
            </Menu>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 500 }}>
                  {getUserFullName(user)}
                </Typography>
                <Typography variant="caption" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                  {user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                </Typography>
              </Box>

              <Tooltip title="Mon compte">
                <IconButton
                  onClick={handleMenu}
                  sx={{
                    padding: 0.5,
                    border: `2px solid ${alpha(theme.palette.common.white, 0.2)}`,
                    '&:hover': {
                      border: `2px solid ${alpha(theme.palette.common.white, 0.3)}`,
                    },
                  }}
                >
                  {user?.avatar ? (
                    <Avatar
                      src={user.avatar}
                      sx={{ width: 32, height: 32 }}
                    />
                  ) : (
                    <AccountCircle sx={{ width: 32, height: 32 }} />
                  )}
                </IconButton>
              </Tooltip>
            </Box>

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              sx={{
                '& .MuiPaper-root': {
                  borderRadius: 2,
                  minWidth: 180,
                  boxShadow: theme.shadows[3],
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {getUserFullName(user)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email || 'utilisateur@example.com'}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => {
                handleClose();
                navigate('/profile');
              }}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                Mon Profil
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Se déconnecter
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 