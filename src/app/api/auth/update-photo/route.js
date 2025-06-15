import db from '../../../lib/db';
import { verifyToken } from '../../../lib/auth';
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function PUT(req) {
    try {
        // Vérifier l'authentification via le token
        const authHeader = req.headers.get("authorization");
        if (!authHeader) {
          return NextResponse.json({ error: "Accès refusé, token manquant" }, { status: 403 });
        }

        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);
        if (!decoded) {
          return NextResponse.json({ error: "Token invalide" }, { status: 403 });
        }

        // Récupérer le fichier envoyé via FormData
        const formData = await req.formData();
        const file = formData.get("photo");

        if (!file || !(file instanceof Blob)) {
          return NextResponse.json({ error: "Aucune image valide envoyée" }, { status: 400 });
        }

        // Définir le chemin du fichier
        const uploadDir = path.join(process.cwd(), "public/uploads");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = `/uploads/${Date.now()}-${file.name}`;
        const fullPath = path.join(process.cwd(), "public", filePath);

        // Sauvegarder le fichier sur le serveur
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(fullPath, fileBuffer);

        // Mettre à jour l'utilisateur avec la nouvelle photo
        await db.query("UPDATE professeur SET photo = ? WHERE id = ?", [filePath, decoded.id]);

        return NextResponse.json({ message: "Photo mise à jour avec succès", photo: filePath }, { status: 200 });
      } catch (error) {
        console.error("Erreur API:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
      }
    }
