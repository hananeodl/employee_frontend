// src/services/logService.ts
import db from "@/lib/db";


/**
 * ✅ Fonction pour enregistrer un log
 * @param utilisateurId - ID de l'utilisateur
 * @param action - Description de l'action
 */
export async function enregistrerLog(utilisateurId: number, action: string) {
  try {
    const date_action = new Date();
    await db.execute(
      "INSERT INTO log (utilisateur_id, action, date_action) VALUES (?, ?, ?)",
      [utilisateurId, action, date_action]
    );
    console.log(`✅ Log ajouté : ${action} pour utilisateur ${utilisateurId}`);
  } catch (error) {
    console.error("❌ Erreur lors de l'enregistrement du log :", error);
  }
}
