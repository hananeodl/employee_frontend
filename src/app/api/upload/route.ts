// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { enregistrerLog } from "@/services/logService";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const utilisateurId = Number(req.nextUrl.searchParams.get("utilisateurId"));

    // 🗂 Simulation de l'upload
    console.log("📂 Fichier uploadé avec succès");

    // ✅ Enregistrer dans les logs
    await enregistrerLog(utilisateurId, "Upload de fichier");

    return NextResponse.json({ success: true, message: "Upload réussi" });
  } catch (error) {
    console.error("❌ Erreur lors de l'upload :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
