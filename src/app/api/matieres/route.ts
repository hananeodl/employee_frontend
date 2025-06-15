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
    const [rows] = await connection.execute('SELECT id, nom FROM Matiere');
    await connection.end();
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}
