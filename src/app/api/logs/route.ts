// 📂 src/app/api/logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const [rows] = await db.execute(
      `SELECT 
         l.id, 
         l.utilisateur_id, 
         p.nom AS utilisateur_nom, 
         p.prenom AS utilisateur_prenom, 
         l.action, 
         l.date_action 
       FROM log l
       LEFT JOIN professeur p ON l.utilisateur_id = p.id
       ORDER BY l.date_action ASC`
    );

    console.log("✅ Logs récupérés :", rows);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des logs :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
