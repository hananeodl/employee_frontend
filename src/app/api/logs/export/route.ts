// src/app/api/logs/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { Parser } from "json2csv";

export async function GET(req: NextRequest) {
  try {
    const format = req.nextUrl.searchParams.get("format") || "csv";

    // Récupérer les logs
    const [rows] = await db.execute("SELECT * FROM log");
    const logs = Array.isArray(rows) ? rows : [];

    if (logs.length === 0) {
      return NextResponse.json({ error: "Aucun log trouvé." }, { status: 404 });
    }

    // Définir les champs du CSV
    const fields = ["id", "utilisateur_id", "action", "date_action"];
    const opts = { fields };

    // Convertir en CSV
    const parser = new Parser(opts);
    const csv = parser.parse(logs);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Disposition": "attachment; filename=logs.csv",
        "Content-Type": "text/csv; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'exportation :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
