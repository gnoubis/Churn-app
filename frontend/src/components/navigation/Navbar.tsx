import React from 'react';
import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  open: boolean;
  toggleDrawer: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ open, toggleDrawer }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const handleLogout = () => {
    // Implémentez la logique de déconnexion ici
    navigate('/login');
    handleClose();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={toggleDrawer}
          edge="start"
          sx={{ marginRight: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Churn Analytics
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Notifications">
            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Paramètres">
            <IconButton color="inherit">
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Profil">
            <IconButton
              onClick={handleMenu}
              color="inherit"
              sx={{ ml: 1 }}
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                <PersonIcon />
              </Avatar>
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
        >
          <MenuItem onClick={handleProfile}>Mon Profil</MenuItem>
          <MenuItem onClick={handleLogout}>Déconnexion</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 