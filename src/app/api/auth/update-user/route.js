
import db from '../../../lib/db';
import { verifyToken } from '../../../lib/auth';

export async function PUT(req) {
  // Récupérer le token depuis l'en-tête Authorization
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  // Vérifier si le token est présent
  if (!token) {
    console.error("Token manquant");
    return new Response(JSON.stringify({ message: "Accès refusé, token manquant" }), { status: 403 });
  }

  // Vérifier et décoder le token
  const decoded = verifyToken(token);
  if (!decoded) {
    console.error("Token invalide");
    return new Response(JSON.stringify({ message: "Token invalide" }), { status: 403 });
  }

  // Extraire les données du corps de la requête
  const { nom, prenom, email,statut,telephone,photo } = await req.json();

  // Préparer la requête de mise à jour, en vérifiant les champs reçus
  const updates = [];
  const values = [];

  if (nom) {
    updates.push("nom = ?");
    values.push(nom);
  }

  if (prenom) {
    updates.push("prenom = ?");
    values.push(prenom);
  }

  if (email) {
    updates.push("email = ?");
    values.push(email);
  }
  if (telephone) {
    updates.push("telephone = ?");
    values.push(telephone);
  }
  if (statut) {
    updates.push("statut = ?");
    values.push(statut);
  }
  if (photo) {
    updates.push("photo = ?");
    values.push(photo);
  }
  // Si aucun champ n'est fourni, renvoyer une erreur
  if (updates.length === 0) {
    console.error("Aucune donnée à mettre à jour");
    return new Response(JSON.stringify({ message: "Aucune donnée à mettre à jour" }), { status: 400 });
  }

  // Ajouter l'ID de l'utilisateur à la fin des valeurs
  values.push(decoded.id);

  // Mise à jour de l'utilisateur dans la base de données
  try {
    const updateQuery = `UPDATE professeur SET ${updates.join(", ")} WHERE id = ?`;
    const result = await db.execute(updateQuery, values);

    // Vérifier si l'utilisateur a été trouvé et mis à jour
    if (result.affectedRows === 0) {
      console.error("Utilisateur non trouvé");
      return new Response(JSON.stringify({ message: "Utilisateur non trouvé" }), { status: 404 });
    }

    // Retourner une réponse de succès
    return new Response(JSON.stringify({ message: "Utilisateur mis à jour avec succès" }), { status: 200 });

  } catch (error) {
    // Capturer les erreurs de la requête SQL ou autres erreurs
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    return new Response(JSON.stringify({ message: "Erreur serveur", error: error.message }), { status: 500 });
  }
}
