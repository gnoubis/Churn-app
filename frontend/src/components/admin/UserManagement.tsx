import React, { useState, useEffect } from 'react';
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
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  AddIcon,
  EditIcon,
  DeleteIcon
} from '../../mui-exports';
import { User, UserRole } from '../../types/user';
import axios from 'axios';
import { ElementType } from 'react';

const API_URL = 'http://localhost:8000/api';

const GridItem = (props: { component?: ElementType; children: React.ReactNode } & any) => (
  <Grid component={props.component || 'div'} item {...props}>
    {props.children}
  </Grid>
);

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'marketing_manager' as UserRole,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        role: 'marketing_manager',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        await axios.put(`${API_URL}/users/${selectedUser.id}`, formData);
      } else {
        await axios.post(`${API_URL}/users`, formData);
      }
      fetchUsers();
      handleCloseDialog();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDelete = async (userId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await axios.delete(`${API_URL}/users/${userId}`);
        fetchUsers();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Gestion des utilisateurs</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nouvel utilisateur
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom d'utilisateur</TableCell>
              <TableCell>Nom complet</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rôle</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={
                        user.role === 'admin'
                          ? 'error'
                          : user.role === 'data_scientist'
                          ? 'info'
                          : 'success'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Actif' : 'Inactif'}
                      color={user.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(user)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(user.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Modifier utilisateur' : 'Nouvel utilisateur'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <GridItem xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom d'utilisateur"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </GridItem>
              <GridItem xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </GridItem>
              <GridItem xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prénom"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </GridItem>
              <GridItem xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </GridItem>
              <GridItem xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Rôle</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                    label="Rôle"
                  >
                    <MenuItem value="admin">Administrateur</MenuItem>
                    <MenuItem value="data_scientist">Data Scientist</MenuItem>
                    <MenuItem value="marketing_manager">
                      Responsable Marketing
                    </MenuItem>
                  </Select>
                </FormControl>
              </GridItem>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedUser ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement; 