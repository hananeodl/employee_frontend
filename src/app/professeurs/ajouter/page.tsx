// src/app/professeurs/ajouter/page.tsx
'use client';

import React, { useState } from 'react';
import { TextField, Button, MenuItem, Box, Typography, Grid, Card, CardHeader, CardContent } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';
import { FormControl, InputLabel, Select, Checkbox, ListItemText, OutlinedInput } from '@mui/material';

export default function Ajouter() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    statut: 'Permanent',
    photo: null as File | null,
    photoPreview: '' // Variable pour stocker l'URL de la prévisualisation
  });

  const [matieres, setMatieres] = useState<{ id: number; nom: string }[]>([]); // Liste des matières disponibles
  const [selectedMatieres, setSelectedMatieres] = useState<number[]>([]); // Matières sélectionnées

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchMatieres = async () => {
      try {
        const response = await fetch('/api/matieres');
        if (!response.ok) throw new Error('Erreur lors de la récupération des matières');
        const data: { id: number; nom: string }[] = await response.json(); // Ajoutez la déclaration de type ici
        setMatieres(data);
      } catch (error) {
        console.error(error);
        toast.error('Erreur lors de la récupération des matières');
      }
    };

    fetchMatieres();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // ✅ Utilisation de l'opérateur optionnel pour éviter `!`
    if (file) {
      setFormData((prev) => ({
        ...prev,
        photo: file,
        photoPreview: URL.createObjectURL(file) // Crée l'URL pour la prévisualisation
      }));
    }
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    void (async () => {
      const data = new FormData();
      data.append('nom', formData.nom);
      data.append('prenom', formData.prenom);
      data.append('telephone', formData.telephone);
      data.append('email', formData.email);
      data.append('statut', formData.statut);
      if (formData.photo) {
        data.append('photo', formData.photo);
      }
      data.append('matieres', JSON.stringify(selectedMatieres)); // Ajouter les matières sélectionnées

      try {
        const response = await fetch('/api/professeurs/ajouter', {
          method: 'POST',
          body: data,
        });

        if (!response.ok) {
          throw new Error('Erreur lors de l\'ajout du professeur');
        }

        toast.success('Professeur ajouté avec succès !');
      } catch (error) {
        console.error(error);
        toast.error('Erreur lors de l\'ajout du professeur');
      }
    })();
  };

  return (
    <Grid container spacing={0} sx={{ paddingTop: 0, minHeight: '100vh', backgroundColor: '#f4f7fc' }}>
      <Grid lg={12} md={12} xs={12}>
        <Card sx={{ maxWidth: 600, mx: 'auto', padding: 3, boxShadow: 3 }}>
          <CardHeader title="Ajout d'un Professeur" />
          <CardContent>
            <form onSubmit={handleSubmit}>
              <TextField fullWidth name="nom" label="Nom" onChange={handleChange} required sx={{ mb: 2 }} />
              <TextField fullWidth name="prenom" label="Prénom" onChange={handleChange} required sx={{ mb: 2 }} />
              <TextField fullWidth name="telephone" label="Téléphone" onChange={handleChange} required sx={{ mb: 2 }} />
              <TextField fullWidth name="email" label="Email" type="email" onChange={handleChange} required sx={{ mb: 2 }} />
              <TextField select fullWidth name="statut" label="Statut" onChange={handleChange} required sx={{ mb: 2 }} value={formData.statut}>
                <MenuItem value="Permanent">Permanent</MenuItem>
                <MenuItem value="Vacataire">Vacataire</MenuItem>
              </TextField>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="matieres-label">Matières enseignées</InputLabel>
                <Select
                  labelId="matieres-label"
                  id="matieres"
                  multiple
                  value={selectedMatieres}
                  onChange={(e) => setSelectedMatieres(e.target.value as number[])}
                  input={<OutlinedInput label="Matières enseignées" />}
                  renderValue={(selected) => selected.map((id) => matieres.find((m) => m.id === id)?.nom).join(', ')}
                >
                  {matieres.map((matiere) => (
                    <MenuItem key={matiere.id} value={matiere.id}>
                      <Checkbox checked={selectedMatieres.includes(matiere.id)} />
                      <ListItemText primary={matiere.nom} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Upload photo */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Button variant="contained" component="label" sx={{ mr: 2 }}>
                  Upload Photo
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                </Button>
                {formData.photo && (
                  <Typography variant="body2" sx={{ color: 'gray' }}>
                    {formData.photo.name}
                  </Typography>
                )}
              </Box>

              {/* Previsualisation de la photo */}
              {formData.photoPreview && (
                <Box sx={{ mb: 2 }}>
                  <img
                    src={formData.photoPreview}
                    alt="Prévisualisation"
                    style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '8px' }}
                  />
                </Box>
              )}

              {/* Submit Button */}
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Ajouter
              </Button>
            </form>
          </CardContent>
        </Card>

        <ToastContainer />
      </Grid>
    </Grid>
  );
}
