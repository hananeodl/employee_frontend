'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

interface User {
  id?: string;
  nom?: string;
  prenom?: string;
  statut?: string;
  photo?: string;
}

export function AccountInfo(): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const decoded: User & { id: string } = jwtDecode(token);
      setUser({
        id: decoded.id,
        nom: decoded.nom ?? 'Inconnu',
        prenom: decoded.prenom ?? '',
        statut: decoded.statut ?? 'Utilisateur',
        photo: decoded.photo ?? '/default-avatar.png'
      });
    } catch (error) {
      console.error('Token invalide', error);
      localStorage.removeItem('token');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setSnackbar({ open: true, message: "Vous devez être connecté pour mettre à jour votre photo.", severity: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const response = await fetch("/api/auth/update-photo", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const data = await response.json();
      setUser((prev) => ({ ...prev, photo: data.photo }));
      setSnackbar({ open: true, message: "Image mise à jour avec succès !", severity: "success" });
      setOpenSuccess(true);
    } catch (error) {
      console.error("Erreur upload:", error);
      setSnackbar({ open: true, message: "Erreur de connexion au serveur.", severity: "error" });
    }
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <>
      <Card>
        <CardContent>
          <Stack spacing={2} sx={{ alignItems: "center" }}>
            <Avatar src={image ?? user?.photo} sx={{ height: 80, width: 80 }} />
            <Stack spacing={1} sx={{ textAlign: "center" }}>
              <Typography variant="h5">{`${user?.nom ?? ''} ${user?.prenom ?? ''}`.trim()}</Typography>
              <Typography color="text.secondary" variant="body2">
                {user?.statut ?? ''}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
        <Divider />
        <CardActions>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
            id="upload-photo"
          />
          <label htmlFor="upload-photo" style={{ width: "100%" }}>
            <Button fullWidth variant="text" component="span">
              Choisir une photo
            </Button>
          </label>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={!file}
          >
            Mettre à jour
          </Button>
        </CardActions>
      </Card>

      {/* Dialog de confirmation */}
      <Dialog open={openSuccess} onClose={() => setOpenSuccess(false)}>
        <DialogTitle>Succès</DialogTitle>
        <DialogContent>
          <DialogContentText>Image mise à jour avec succès !</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSuccess(false)} variant="contained" color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour afficher les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
