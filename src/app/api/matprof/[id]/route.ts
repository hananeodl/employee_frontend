import { NextRequest, NextResponse } from "next/server";
import mysql, {RowDataPacket} from 'mysql2/promise';
import { writeFile, mkdir} from 'fs/promises';
import path from 'path';

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "gestion_professeurs",
});

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

    // Récupérer les matières avec leur ID et nom
    const [matiereRows] = await pool.execute<RowDataPacket[]>(
      `SELECT Matiere.id, Matiere.nom
       FROM Matiere
              JOIN Professeur_Matiere ON Professeur_Matiere.id_matiere = Matiere.id
       WHERE Professeur_Matiere.id_professeur = ?`,
      [id]
    );

    // Créer un tableau d'objets avec id et nom
    const matieres = matiereRows.map((row) => ({ id: row.id, nom: row.nom }));

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

    return NextResponse.json({ message: "Professeur modifié avec succès" }, { status: 200 });
  } catch (error) {
    console.error("Erreur serveur :", error);
    return NextResponse.json({ message: "Erreur serveur", error: (error as Error).message }, { status: 500 });
  }
}
