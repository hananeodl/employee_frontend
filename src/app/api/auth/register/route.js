
import db from '../../../lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const formData = await req.formData();

    const nom = formData.get("nom");
    const prenom = formData.get("prenom");
    const email = formData.get("email");
    const password = formData.get("password");
    const file = formData.get("photo"); // Récupérer le fichier
    const telephone = formData.get("telephone");
    const statut = formData.get("statut");

    if (!nom || !prenom || !email || !password || !file || !telephone || !statut ) {
      return Response.json({ error: "Tous les champs sont obligatoires" }, { status: 400 });
    }

    // Vérifier si l'email existe déjà
    const [existingUser] = await db.query('SELECT * FROM professeur WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return Response.json({ error: 'Email déjà utilisé' }, { status: 400 });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Stocker la photo (supposons qu'on utilise un dossier `/uploads`)
    const photoPath = `/uploads/${Date.now()}-${file.name}`;
    const fileBuffer = await file.arrayBuffer();
    const fs = require("fs");
    fs.writeFileSync(`./public${photoPath}`, Buffer.from(fileBuffer));

    // Insérer dans la base de données
    await db.query(
      'INSERT INTO professeur (nom, prenom, email, password, photo,telephone,statut) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nom, prenom, email, hashedPassword, photoPath,telephone,statut]
    );

    return Response.json({ message: 'Inscription réussie', photo: photoPath }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de l’inscription :', error);
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
