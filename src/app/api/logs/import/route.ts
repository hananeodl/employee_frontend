// src/app/api/logs/import/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import * as XLSX from "xlsx";
import { enregistrerLog } from "@/services/logService";

// 🚨 Configuration Next.js
export const dynamic = "force-dynamic"; // Next.js 14+ (recharge dynamique)
export const maxDuration = 60;         // Timeout (optionnel)

// ✅ Fonction pour lire le `FormData` depuis la requête
async function parseFormData(req: NextRequest): Promise<{ file: Buffer | null }> {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof Blob)) {
    throw new Error("Aucun fichier reçu ou format incorrect.");
  }

  // Lire le contenu du fichier dans un buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return { file: buffer };
}

// ✅ Route principale d'importation
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    console.log("📥 Début de l'importation...");

    // 1️⃣ Lecture du fichier depuis FormData
    const { file } = await parseFormData(req);
    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
    }

    console.log("📊 Lecture du fichier Excel...");

    // 2️⃣ Lire et parser le fichier Excel
    const workbook = XLSX.read(file, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log(`📊 Nombre de lignes : ${data.length}`);

    // 3️⃣ Insérer les logs dans la base de données
    let logsAjoutes = 0;

    for (const row of data as any[]) {
      const utilisateurId = row.utilisateur_id || null;
      const action = `Importation : ${row.action || "Action inconnue"}`;
      const dateAction = row.date_action ? new Date(row.date_action) : new Date();

      await db.execute(
        "INSERT INTO log (utilisateur_id, action, date_action) VALUES (?, ?, ?)",
        [utilisateurId, action, dateAction]
      );
      logsAjoutes++;
    }

    console.log(`✅ Importation terminée : ${logsAjoutes} logs ajoutés`);

    return NextResponse.json(
      { message: `Importation réussie : ${logsAjoutes} logs ajoutés` },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Erreur lors de l'importation :", error.message);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'importation" },
      { status: 500 }
    );
  }
}
