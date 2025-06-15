"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Grid, Card, Divider, Box, Table,
  TableHead, TableBody, TableRow,
  TableCell, Typography
} from '@mui/material';
import Layout from "../dashboard/layout";

interface Log {
  id: number;
  utilisateur_id: number;
  utilisateur_nom: string;
  utilisateur_prenom: string;
  action: string;
  date_action: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    axios.get("/api/logs")
      .then((response) => {
        console.log("✅ Logs reçus depuis API :", response.data);
        // 🚨 Vérifie si logs sont dans response.data.logs
        if (Array.isArray(response.data)) {
          setLogs(response.data);
        } else if (Array.isArray(response.data.logs)) {
          setLogs(response.data.logs);
        } else {
          console.warn("🚨 Réponse inattendue :", response.data);
        }
      })
      .catch((error) => {
        console.error("❌ Erreur lors de la récupération des logs :", error);
      });
  }, []);
  console.log("📥 Logs dans page.tsx :", logs);
  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Gestion des Logs
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card>
            <Divider />
            <Box sx={{ overflowX: 'auto' }}>
              <Table sx={{ width: '100%' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ textAlign: 'center' }}>ID</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>Utilisateur</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>Action</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell sx={{ textAlign: 'center' }}>{log.id}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {log.utilisateur_nom} {log.utilisateur_prenom}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{log.action}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {new Date(log.date_action).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: 'center' }}>
                        Aucun log trouvé.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
}




