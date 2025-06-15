import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { PrismaClient } from '@prisma/client';  // Suppression de l'import de Statut

/* eslint-disable-next-line @typescript-eslint/no-unsafe-call -- Pour cette fois*/
const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    console.log('Début de la génération du PDF');

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    console.log('ID du professeur:', id);

    if (!id) {
      return new NextResponse(JSON.stringify({ message: 'ID du professeur requis' }));
    }

    // Récupérer les infos du professeur
    const professeur = await prisma.professeur.findUnique({
      where: { id: parseInt(id) },
      include: {
        Professeur_Matiere: {
          include: {
            matiere: { select: { nom: true } },
          },
        },
      },
    }) as {
      nom: string;
      prenom: string;
      email: string;
      statut: string;  // Utiliser un type générique pour le statut
      telephone?: string;
      photo?: string;
      Professeur_Matiere: { matiere: { nom: string } }[];
    } | null;


    console.log('Professeur récupéré:', professeur);

    if (!professeur) {
      return NextResponse.json({ message: 'Professeur non trouvé' });
    }

    // Générer le QR Code
    console.log('Génération du QR Code...');
    const qrData = `Nom: ${professeur.nom}\nPrénom: ${professeur.prenom}\nEmail: ${professeur.email}\nTéléphone: ${professeur.telephone}`;
    const qrCodeDataURL = await QRCode.toDataURL(qrData);
    console.log('QR Code généré:', qrCodeDataURL);

    // Créer un document PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([350, 250]);

    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Ajouter une bordure bleue
    page.drawRectangle({
      x: 5,
      y: 5,
      width: width - 10,
      height: height - 10,
      borderColor: rgb(53 / 255, 156 / 255, 191 / 255),
      borderWidth: 5,
    });

    // Charger et afficher le logo de l’université
    try {
      const logoUrl = "http://localhost:3000/assets/logo-udc.png";
      const response = await fetch(logoUrl);
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

      const logoBytes = await response.arrayBuffer();
      const logoImage = await pdfDoc.embedPng(logoBytes);
      page.drawImage(logoImage, { x: width / 2 - 40, y: height - 50, width: 80, height: 30 });
    } catch (err) {
      console.error("Erreur lors du chargement du logo:", err);
    }

    // Ajouter le texte principal
    page.drawText(`Nom : ${professeur.nom}`, { x: 20, y: height - 70, size: 12, font, color: rgb(0, 0, 0) });
    page.drawText(`Prénom: ${professeur.prenom}`, { x: 20, y: height - 90, size: 12, font, color: rgb(0, 0, 0) });
    page.drawText(`Statut: ${professeur.statut}`, { x: 20, y: height - 110, size: 12, font, color: rgb(0, 0, 0) });

    const matieres = professeur.Professeur_Matiere.map(m => m.matiere.nom).join(', ');
    page.drawText(`Matière:`, { x: 20, y: height - 130, size: 12, font, color: rgb(0, 0, 0) });
    page.drawText(matieres, { x: 20, y: height - 150, size: 10, color: rgb(0, 0, 0) });

    // Ajouter la photo du professeur si disponible
    if (professeur.photo) {
      try {
        const baseUrl = "http://localhost:3000";
        const photoUrl = encodeURI(`${baseUrl}${professeur.photo}`);

        console.log("Chargement de l'image:", photoUrl);

        const response = await fetch(photoUrl);
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

        const photoArrayBuffer = await response.arrayBuffer();

        let photoImage;
        if (photoUrl.endsWith('.jpg') || photoUrl.endsWith('.jpeg')) {
          photoImage = await pdfDoc.embedJpg(photoArrayBuffer);
        } else if (photoUrl.endsWith('.png')) {
          photoImage = await pdfDoc.embedPng(photoArrayBuffer);
        } else {
          throw new Error("Format d'image non supporté");
        }

        page.drawImage(photoImage, { x: width - 90, y: height - 130, width: 70, height: 70 });

      } catch (err) {
        console.error("Erreur lors du chargement de la photo:", err);
      }
    }

    // Ajouter le QR Code
    const qrImageBytes = Buffer.from(qrCodeDataURL.replace(/^data:image\/png;base64,/, ""), 'base64');
    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    page.drawImage(qrImage, { x: 20, y: 20, width: 50, height: 50 });

    // Générer le PDF
    const pdfBytes = await pdfDoc.save();

    // Retourner le PDF sous forme de réponse NextResponse
    return new Response(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="carte_professeur_${professeur.nom}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    return NextResponse.json({ message: 'Erreur serveur' });
  }
}
