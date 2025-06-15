// src/app/api/professeurs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import mysql, {RowDataPacket} from 'mysql2/promise';
import { writeFile, mkdir} from 'fs/promises';
import path from 'path';
import { enregistrerLog } from "@/services/logService";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "gestion_professeurs",
});

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      console.error("ID invalide :", params.id);
      return NextResponse.json({ message: "ID invalide" }, { status: 400 });
    }

    console.log("Suppression du professeur avec ID :", id);

    // Vérifier si le professeur existe
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM Professeur WHERE id = ?",
      [id]
    );

    console.log("Résultat de la requête SELECT :", rows);

    if (!Array.isArray(rows) || rows.length === 0) {
      console.error("Professeur non trouvé :", id);
      return NextResponse.json({ message: "Professeur non trouvé" }, { status: 404 });
    }

    await pool.execute("DELETE FROM Professeur WHERE id = ?", [id]);
    console.log("Professeur supprimé avec succès :", id);

    return NextResponse.json({ message: "Professeur supprimé" }, { status: 200 });
  } catch (error) {
    console.error("Erreur serveur :", error);
    return NextResponse.json({ message: "Erreur serveur", error: (error as Error).message }, { status: 500 });
  }
}


export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: "ID invalide" }, { status: 400 });
    }

    const [professeurRows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, nom, prenom, telephone, email, statut, photo FROM Professeur WHERE id = ?",
      [id]
    );

    if (professeurRows.length === 0) {
      return NextResponse.json({ message: "Professeur non trouvé" }, { status: 404 });
    }

    const professeur = professeurRows[0];

    const [matiereRows] = await pool.execute<RowDataPacket[]>(
      `SELECT Matiere.nom
       FROM Matiere
              JOIN Professeur_Matiere ON Professeur_Matiere.id_matiere = Matiere.id
       WHERE Professeur_Matiere.id_professeur = ?`,
      [id]
    );

    const matieres = matiereRows.map((row) => row.nom);

    return NextResponse.json({ ...professeur, matieres }, { status: 200 });
  } catch (error) {
    console.error("Erreur serveur :", error);
    return NextResponse.json({ message: "Erreur serveur", error: (error as Error).message }, { status: 500 });
  }
}


export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: "ID invalide" }, { status: 400 });
    }

    const formData = await req.formData();
    const nom = formData.get('nom')?.toString();
    const prenom = formData.get('prenom')?.toString();
    const telephone = formData.get('telephone')?.toString();
    const email = formData.get('email')?.toString();
    const statut = formData.get('statut')?.toString();
    const photoFile = formData.get('photo') as File | null;
    const matieres = JSON.parse(formData.get('matieres') as string) as number[]; // Récupérer les matières sélectionnées

    // Gérer la photo si elle est mise à jour
    let photoUrl: string | null = null;

    if (photoFile) {
      const buffer = Buffer.from(await photoFile.arrayBuffer());
      const fileName = `${Date.now().toString()}-${photoFile.name}`;
      const uploadDir = path.join(process.cwd(), 'public/uploads');
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      photoUrl = `/uploads/${fileName}`;
    }

    // Mise à jour dans la base de données
    await pool.execute(
      "UPDATE Professeur SET nom = ?, prenom = ?, telephone = ?, email = ?, statut = ?, photo = ? WHERE id = ?",
      [nom, prenom, telephone, email, statut, photoUrl, id]
    );

    // Mettre à jour les matières enseignées
    await pool.execute("DELETE FROM Professeur_Matiere WHERE id_professeur = ?", [id]); // Supprimer les anciennes matières
    for (const matiereId of matieres) {
      await pool.execute(
        "INSERT INTO Professeur_Matiere (id_professeur, id_matiere) VALUES (?, ?)",
        [id, matiereId]
      );
    }

    const professeurId = Number(params.id);
    const utilisateurId = Number(req.nextUrl.searchParams.get("utilisateurId"));

     // ✅ Enregistrer dans les logs
     await enregistrerLog(utilisateurId, `Modification des informations du professeur ID ${professeurId}`);


    return NextResponse.json({ message: "Professeur modifié avec succès" }, { status: 200 });
  } catch (error) {
    console.error("Erreur serveur :", error);
    return NextResponse.json({ message: "Erreur serveur", error: (error as Error).message }, { status: 500 });
  }
}
