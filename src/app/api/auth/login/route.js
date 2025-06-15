import db from '../../../lib/db';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../../lib/auth';
import { NextResponse } from "next/server";
import { enregistrerLog } from "@/services/logService";


export async function POST(req) {
  try{
  const { email, password } = await req.json();

  if (!email || !password) {
    return new Response(JSON.stringify({ message: 'Email et mot de passe sont requis' }), { status: 400 });
  }


  const [rows] = await db.execute('SELECT * FROM professeur WHERE email = ?', [email]);
  const user = rows[0];
// ✅ Vérifier que `rows` contient bien un utilisateur
const utilisateur = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  if (!user) {
    return new Response(JSON.stringify({ message: 'Utilisateur non trouvé' }), { status: 404 });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
     // 📌 Connexion échouée → Enregistrer le log
    await enregistrerLog(utilisateur.id, "Connexion échouée");
    return new Response(JSON.stringify({ message: 'Mot de passe incorrect' }), { status: 400 });
  }
// ✅ Connexion réussie → Enregistrer le log
await enregistrerLog(utilisateur.id, "Connexion réussie");

  const token = generateToken(user);
  return new Response(JSON.stringify({ token }), { status: 200 });

} catch (error) {
  console.error("❌ Erreur lors de la connexion :", error);
  return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
}
}

export async function getLogs() {
  try {
    const [rows] = await db.execute(`
      SELECT l.id, l.utilisateur_id, u.nom AS utilisateur_nom, u.prenom AS utilisateur_prenom, l.action, l.date_action 
      FROM log l
      LEFT JOIN utilisateur u ON l.utilisateur_id = u.id
      ORDER BY l.date_action ASC`);
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des logs :', error);
    return [];
  }
}


