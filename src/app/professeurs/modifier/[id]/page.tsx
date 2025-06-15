// src/app/professeurs/modifier/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Grid, Card, CardHeader, CardContent } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FormControl, InputLabel, Select, Checkbox, ListItemText, OutlinedInput, MenuItem } from '@mui/material';

// Définition du type pour formData
interface ProfesseurFormData {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  statut: 'Permanent' | 'Vacataire';
  photo: File | null;
  photoPreview: string;
}

export default function Modifier({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState<ProfesseurFormData>({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    statut: 'Permanent',
    photo: null,
    photoPreview: '', // Variable pour stocker l'URL de la prévisualisation
  });

  const [matieres, setMatieres] = useState<{ id: number; nom: string }[]>([]); // Liste des matières disponibles
  const [selectedMatieres, setSelectedMatieres] = useState<number[]>([]); // Matières sélectionnées

  // Pour recuperer les matieres du prof
  useEffect(() => {
    const fetchMatieres = async () => {
      try {
        // Récupérer les matières disponibles
        const matieresResponse = await fetch('/api/matieres');
        if (!matieresResponse.ok) throw new Error('Erreur lors de la récupération des matières');
        const matieresData: { id: number; nom: string }[] = await matieresResponse.json(); // Typage explicite des données
        setMatieres(matieresData);

        // Récupérer les matières déjà enseignées par le professeur
        const professeurResponse = await fetch(`/api/matprof/${params.id}`);
        if (!professeurResponse.ok) throw new Error('Erreur lors de la récupération des données');
        const professeurData: { matieres: { id: number; nom: string }[] } = await professeurResponse.json(); // Typage explicite des données

        // Extraire les IDs des matières enseignées
        const matieresEnseignees: number[] = professeurData.matieres.map((m) => m.id);
        setSelectedMatieres(matieresEnseignees); // Type sûr pour selectedMatieres
      } catch (error) {
        console.error(error);
        toast.error('Erreur lors de la récupération des données');
      }
    };

    fetchMatieres();
  }, [params.id]);


  // Récupérer les données du professeur au chargement de la page
  useEffect(() => {
    const fetchProfesseur = async () => {
      try {
        const response = await fetch(`/api/professeurs/${params.id}`);
        if (!response.ok) throw new Error('Erreur lors de la récupération des données');
        const data = await response.json();

        // Typage explicite des données
        setFormData((prev) => ({
          ...prev,
          nom: data.nom || '', // Assurez-vous que les données sont sécurisées
          prenom: data.prenom || '',
          telephone: data.telephone || '',
          email: data.email || '',
          statut: data.statut || 'Permanent',
          photoPreview: data.photo || '', // Ajoute la photo de profil si elle existe
        }));
      } catch (error) {
        toast.error('Erreur lors de la récupération des données');
      }
    };

    fetchProfesseur();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // ✅ Utilisation de l'opérateur optionnel pour éviter `!`
    if (file) {
      setFormData((prev) => ({
        ...prev,
        photo: file,
        photoPreview: URL.createObjectURL(file), // Crée l'URL pour la prévisualisation
      }));
    }
  };


  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
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
      const response = await fetch(`/api/professeurs/${params.id}`, {
        method: 'PUT',
        body: data,
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour des données');
      toast.success('Professeur modifié avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour des données');
    }
  };

  return (
    <Grid container spacing={0} sx={{ paddingTop: 0, minHeight: '100vh', backgroundColor: '#f4f7fc' }}>
      <Grid lg={12} md={12} xs={12}>
        <Card sx={{ maxWidth: 600, mx: 'auto', padding: 3, boxShadow: 3 }}>
          <CardHeader title="Modification d'un Professeur" />
          <CardContent>
            <form onSubmit={handleSubmit}>
              <TextField fullWidth name="nom" label="Nom" value={formData.nom} onChange={handleChange} required sx={{ mb: 2 }} />
              <TextField fullWidth name="prenom" label="Prénom" value={formData.prenom} onChange={handleChange} required sx={{ mb: 2 }} />
              <TextField fullWidth name="telephone" label="Téléphone" value={formData.telephone} onChange={handleChange} required sx={{ mb: 2 }} />
              <TextField fullWidth name="email" label="Email" type="email" value={formData.email} onChange={handleChange} required sx={{ mb: 2 }} />
              <TextField select fullWidth name="statut" label="Statut" value={formData.statut} onChange={handleChange} required sx={{ mb: 2 }}>
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
                Modifier
              </Button>
            </form>
          </CardContent>
        </Card>
        <ToastContainer />
      </Grid>
    </Grid>
  );
}
