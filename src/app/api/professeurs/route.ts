/* eslint-disable no-console -- Désactivation temporaire pour gérer les erreurs avec console.error */
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  database: 'gestion_professeurs',
};

export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM Professeur');
    await connection.end();

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des professeurs:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
