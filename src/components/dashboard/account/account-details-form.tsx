'use client';

import * as React from 'react';
import { jwtDecode } from 'jwt-decode';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Grid from '@mui/material/Grid';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

// Déclare un type personnalisé pour le JWT payload
interface CustomJwtPayload {
  nom?: string;
  prenom?: string;
  email?: string;
  statut?: string;
  telephone?: string;
}

export function AccountDetailsForm() {
  const [user, setUser] = useState({
    nom: '',
    prenom: '',
    email: '',
    statut: '',
    telephone: '',
  });
  const [loading, setLoading] = useState(true);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = () => {
      if (typeof window === 'undefined') return;
      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/auth/sign-in');
        return;
      }
      try {
        const decoded = jwtDecode<CustomJwtPayload>(token);
        setUser({
          nom: decoded.nom ?? '',
          prenom: decoded.prenom ?? '',
          email: decoded.email ?? '',
          statut: decoded.statut ?? '',
          telephone: decoded.telephone ?? '',
        });
      } catch (error) {
        console.error('Token invalide', error);
        localStorage.removeItem('token');
        router.replace('/auth/sign-in');
      }
      setLoading(false);
    };
    fetchUser();
  }, [router]);

  // Fonction pour gérer les changements dans les champs de texte
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  // Fonction pour gérer les changements dans le Select
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target as { name: string; value: string };
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleSubmit = async () => {
    setOpenConfirm(false);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Vous devez être connecté pour effectuer cette action.');
        return;
      }
      const response = await fetch('/api/auth/update-user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });
      if (response.ok) {
        setOpenSuccess(true);
      } else {
        const errorData = await response.json();
        console.error(`Erreur: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Erreur de mise à jour:', error);
      console.error('Une erreur est survenue.');
    }
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <>
      <form onSubmit={(event) => event.preventDefault()}>
        <Card>
          <CardHeader subheader="Les informations peuvent être modifiées" title="Profil" />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              <Grid md={6} xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Prénom</InputLabel>
                  <OutlinedInput value={user.nom} onChange={handleInputChange} label="Prénom" name="nom" />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Nom</InputLabel>
                  <OutlinedInput value={user.prenom} onChange={handleInputChange} label="Nom" name="prenom" />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Email</InputLabel>
                  <OutlinedInput value={user.email} onChange={handleInputChange} label="Email" name="email" />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Téléphone</InputLabel>
                  <OutlinedInput value={user.telephone} onChange={handleInputChange} label="Téléphone" name="telephone" type="tel" />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Statut</InputLabel>
                  <Select value={user.statut || ''} onChange={handleSelectChange} label="Statut" name="statut">
                    <MenuItem value="vacataire">Vacataire</MenuItem>
                    <MenuItem value="permanent">Permanent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
          <Divider />
          <CardActions sx={{ justifyContent: 'flex-end' }}>
            <Button variant="contained" onClick={() => setOpenConfirm(true)}>Enregistrer</Button>
          </CardActions>
        </Card>
      </form>

      {/* Modal de confirmation */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>Voulez-vous vraiment modifier ces informations ?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Non</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">Oui</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de succès */}
      <Dialog open={openSuccess} onClose={() => setOpenSuccess(false)}>
        <DialogTitle>Succès</DialogTitle>
        <DialogContent>
          <DialogContentText>Informations mises à jour avec succès !</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSuccess(false)} variant="contained" color="primary">OK</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
