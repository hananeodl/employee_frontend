import * as React from "react";
import RouterLink from "next/link";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { paths } from "@/paths";
import { DynamicLogo } from "@/components/core/logo";

export interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
        minHeight: "100vh",
        backgroundColor: "#E5E7EB", // Fond gris clair
      }}
    >
      {/* Section principale */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 4 },
          backgroundColor: "#FFFFFF", // Fond blanc pour un effet propre
        }}
      >
        {/* Logo */}
        <Box sx={{ position: "absolute", top: 20, left: 20 }}>
          <Box
            component={RouterLink}
            href={paths.home}
            sx={{ display: "inline-block" }}
          >
            <DynamicLogo colorDark="dark" colorLight="light" height={32} width={122} />
          </Box>
        </Box>

        {/* Contenu principal */}
        <Box sx={{ maxWidth: 450, width: "100%", textAlign: "center" }}>
          {children}
        </Box>
      </Box>

      {/* Section visuelle */}
      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          p: 3,
          background: "linear-gradient(135deg, #1E3A8A, #2563EB)", // Dégradé Bleu
          color: "#F8FAFC", // Texte blanc cassé
        }}
      >
        <Box
          sx={{
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            padding: 4,
            borderRadius: 3,
            textAlign: "center",
            maxWidth: 400,
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: "26px",
              fontWeight: "bold",
              lineHeight: "1.4",
              textTransform: "uppercase",
              color: "#38BDF8", // Bleu clair accent
            }}
          >
            Bienvenue dans
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: "22px",
              fontWeight: "bold",
              color: "#F8FAFC",
            }}
          >
            Gestion des Employées
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
            Une plateforme intuitive et optimisée pour une meilleure gestion.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
