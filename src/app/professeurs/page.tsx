// src/app/professeurs/page.tsx
'use client';
import React, { useEffect, useState, useRef } from 'react';
import axios from "axios";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {Upload as UploadIcon} from "@phosphor-icons/react/dist/ssr/Upload";
import {Download as DownloadIcon} from "@phosphor-icons/react/dist/ssr/Download";
import {Plus as PlusIcon} from "@phosphor-icons/react/dist/ssr/Plus";
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-toastify/dist/ReactToastify.css'; // Import CSS pour Toastify
import { CircularProgress, Menu, MenuItem } from '@mui/material';
import { ArrowDropDownIcon } from '@mui/x-date-pickers';

export interface Professeur {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  statut: 'Permanent' | 'Vacataire';
  photo: string | null;
  matieres: string[];
}

export default function Page(): React.JSX.Element {

  const [importMessage, setImportMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      alert("🚫 Aucun fichier sélectionné !");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("📤 Envoi du fichier :", file.name);
      const response = await axios.post("/api/logs/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("✅ Réponse de l'importation :", response.data);
      alert(`✅ Succès : ${response.data.message}`);
      setImportMessage(`✅ Importation réussie : ${file.name}`);
    } catch (error: any) {
      console.error("❌ Erreur d'importation :", error.response?.data || error.message);
      alert(`❌ Erreur : ${error.response?.data?.error || error.message}`);
      setImportMessage(`❌ Échec de l'importation`);
    }
  };

   // ✅ Gérer l'exportation CSV/JSON avec un seul bouton
   const handleExport = async (format: "csv" | "json") => {
    try {
      setExportLoading(true);
      const response = await axios.get(`/api/logs/export?format=${format}`, {
        responseType: "blob",
      });

      const url = URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `logs.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setExportLoading(false);
    } catch (error) {
      console.error("❌ Erreur d'exportation :", error);
      setExportLoading(false);
    }
  };

  // ✅ Ouvrir et fermer le menu déroulant
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };


  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Nombre d'éléments par page

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentProfesseurs = professeurs.slice(indexOfFirstItem, indexOfLastItem);

  const [selectedProfesseur, setSelectedProfesseur] = useState<Professeur | null>(null);

  const fetchProfesseurs = async (): Promise<void> => {
    try {
      const response = await fetch('/api/professeurs');
      if (!response.ok) throw new Error('Erreur serveur');
      const data: Professeur[] = await response.json();
      if (Array.isArray(data)) {
        setProfesseurs(data);
      } else {
        throw new Error('Données incorrectes reçues');
      }
    } catch (error) {
      console.error('Erreur de récupération des professeurs:', error);
    }
  };

  useEffect(() => {
    fetchProfesseurs().catch((error) => console.error(error));
  }, []);

  const handleDelete = async (professeurId: number) => {
    const result = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action est irréversible !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer !",
      cancelButtonText: "Annuler",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/professeurs/${professeurId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProfesseurs(professeurs.filter((p) => p.id !== professeurId));
        Swal.fire("Supprimé !", "Le professeur a été supprimé.", "success");
      } else {
        Swal.fire("Erreur", `Impossible de supprimer`, "error");
      }
    } catch (error) {
      console.error("Erreur de suppression :", error);
      Swal.fire("Erreur", "Une erreur s'est produite.", "error");
    }
  };

  const handleDownload = async (id: number) => {
    try {
      const response = await fetch(`/api/professeurs/generateCarte?id=${id}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du PDF');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `carte_professeur_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erreur lors du téléchargement du PDF :", error);
    }
  };


  const handleViewDetails = (professeur: Professeur) => {
    setSelectedProfesseur(professeur);
    fetch(`/api/professeurs/${professeur.id}`)
      .then((response) => response.json())
      .then((data) => {
        setSelectedProfesseur({
          ...(data as Professeur),
          matieres: data.matieres || [], // Si pas de matières, tableau vide
        });
      })
      .catch((error) => {
        console.error("Erreur de récupération des détails :", error);
        toast.error("Erreur lors de l'affichage des détails !");
      });
  };


  const handleCloseDetails = () => {
    setSelectedProfesseur(null);
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Professeurs</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button onClick={() => fileInputRef.current?.click()} color="inherit" startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />}>
              Importer
              <input
            type="file"
            hidden
            accept=".xlsx,.xls"
            ref={fileInputRef}
            onChange={handleImport}
          />
            </Button>
            <Button color="inherit" startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />} endIcon={<ArrowDropDownIcon />}
          onClick={handleMenuOpen}
          disabled={exportLoading}>
              Exporter
            </Button>
            {/* Bouton Export avec Menu déroulant */}
            <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => { handleExport("csv"); handleMenuClose(); }}>
            📑 Exporter en CSV
          </MenuItem>
          <MenuItem onClick={() => { handleExport("json"); handleMenuClose(); }}>
            📄 Exporter en JSON
          </MenuItem>
        </Menu>
          </Stack>
        </Stack>
        <div>
          <Link href="/professeurs/ajouter">
            <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained">
              Ajouter
            </Button>
          </Link>
        </div>
      </Stack>

      {/* Liste des professeurs */}
      <Grid container spacing={0} sx={{ paddingTop: 0 }}>
        <Grid lg={12} md={12} xs={12}>
          <Card>
            <Divider />
            <Box sx={{ overflowX: 'auto' }}>
              <Table sx={{ width: '100%' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ textAlign: 'center' }}>Nom & Prénom</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>Téléphone</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>Email</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>Statut</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>Photo</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentProfesseurs.map((prof) => (
                    <TableRow hover key={prof.id} onClick={() => handleViewDetails(prof)}>
                      <TableCell sx={{ textAlign: 'center' }}>{prof.nom} {prof.prenom}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{prof.telephone}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{prof.email}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{prof.statut}</TableCell>
                      <TableCell sx={{textAlign: 'center'}}>
                        {prof.photo ? (
                          <img src={prof.photo} alt={`${prof.nom} ${prof.prenom}`} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '50%' }} />
                        ) : (
                          <span>Aucune photo</span>
                        )}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Stack direction="row" spacing={1}>
                          <Link href={`/professeurs/modifier/${prof.id}`} passHref>
                            <Button variant="outlined" color="primary" startIcon={<EditIcon />} size="small">
                              Modifier
                            </Button>
                          </Link>
                          <Button variant="outlined" color="error" startIcon={<DeleteIcon />} size="small" onClick={() => handleDelete(prof.id)}>
                            Supprimer
                          </Button>
                          {/* Bouton pour télécharger */}
                          <Button variant="outlined" color="info" startIcon={<DownloadIcon />} size="small" onClick={() => handleDownload(prof.id)}>
                            Télécharger
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            <Divider />
            <CardActions sx={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
              <Button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} variant="outlined">
                Première page
              </Button>
              <Button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}
                      variant="outlined">
                Précédent
              </Button>
              <span>
                Page {currentPage} / {Math.ceil(professeurs.length / itemsPerPage)}
              </span>
              <span>
                  Affichés {Math.min(currentPage * itemsPerPage, professeurs.length)} / {professeurs.length}
              </span>
              <Button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(professeurs.length / itemsPerPage)))}
                disabled={currentPage === Math.ceil(professeurs.length / itemsPerPage)} variant="outlined">
                Suivant
              </Button>
              <Button onClick={() => setCurrentPage(Math.ceil(professeurs.length / itemsPerPage))} disabled={currentPage === Math.ceil(professeurs.length / itemsPerPage)} variant="outlined">
                Dernière page
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      <ToastContainer/>

      {/* Détails du professeur */}
      {selectedProfesseur && (
        <Card sx={{ marginTop: 1, padding: 1 }}>
          <Typography variant="h6" gutterBottom>
            Détails du professeur
          </Typography>
          <Stack direction="row" spacing={2}>
            <div>
              <Typography><strong>Nom :</strong> {selectedProfesseur.nom}</Typography>
              <Typography><strong>Prénom :</strong> {selectedProfesseur.prenom}</Typography>
              <Typography><strong>Téléphone :</strong> {selectedProfesseur.telephone}</Typography>
              <Typography><strong>Email :</strong> {selectedProfesseur.email}</Typography>
              <Typography><strong>Statut :</strong> {selectedProfesseur.statut}</Typography>
            </div>
            <div>
              {selectedProfesseur.photo ? (
                <img src={selectedProfesseur.photo} alt={`${selectedProfesseur.nom} ${selectedProfesseur.prenom}`} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                <Typography>Aucune photo</Typography>
              )}
      {/* ✅ Affichage du message d'importation */}
              {importMessage && (
        <p style={{ color: importMessage.includes("réussie") ? "green" : "red" }}>
          {importMessage}
        </p>
      )}
      {/* ✅ Loader lors de l'export */}
      {exportLoading && (
        <Box display="flex" justifyContent="center" mt={2}>
          <CircularProgress size={24} />
          <Typography ml={1}>Exportation en cours...</Typography>
        </Box>
      )}
            </div>
          </Stack>
          <Typography variant="body1" sx={{ marginTop: 2 }}><strong>Matières :</strong></Typography>
          <ul>
            {Array.isArray(selectedProfesseur.matieres) && selectedProfesseur.matieres.map((matiere: string, index: number) => (
              <li key={index}>{matiere}</li>
            ))}
          </ul>
          <Button variant="contained" color="secondary" onClick={handleCloseDetails} sx={{ marginTop: 2 }}>
            Fermer
          </Button>
        </Card>
      )}
    </Stack>
  );
}
