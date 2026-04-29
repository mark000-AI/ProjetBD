const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const evaluationModel = require('../models/evaluationModel');
const eleveModel = require('../models/eleveModel');

/**
 * Génère un bulletin PDF pour un élève
 */
const generateBulletin = async (matricule, idSession) => {
  try {
    // Récupérer les informations de l'élève
    const eleve = await eleveModel.findByMatricule(matricule);
    if (!eleve) throw new Error('Élève introuvable');

    // Récupérer les évaluations
    const [evals] = await pool.query(
      `SELECT e.*, c.libelle AS coursLibelle, c.coefficient, ep.libelle AS epreuveLibelle
       FROM Evaluation e
       LEFT JOIN Cours c ON e.idCours = c.idCours
       LEFT JOIN Epreuve ep ON e.idEpreuve = ep.idEpreuve
       WHERE e.matricule = ? AND e.idSession = ?
       ORDER BY c.libelle ASC`,
      [matricule, idSession]
    );

    // Récupérer les infos de la session
    const [sessions] = await pool.query(
      `SELECT s.*, t.libelle AS trimestreLibelle, a.libelle AS anneeLibelle
       FROM Session s
       LEFT JOIN Trimestre t ON s.idTrimestre = t.idTrimes
       LEFT JOIN AnneeAcademique a ON t.idAca = a.idAnnee
       WHERE s.idSession = ?`,
      [idSession]
    );

    if (sessions.length === 0) throw new Error('Session introuvable');

    const sessionInfo = sessions[0];

    // Créer le PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
    });

    // Créer le dossier uploads s'il n'existe pas
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'bulletins');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `bulletin_${matricule}_session${idSession}_${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, fileName);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // En-tête
    doc.fontSize(20).font('Helvetica-Bold').text('BULLETIN SCOLAIRE', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica').text('Année académique: ' + sessionInfo.anneeLibelle, { align: 'center' });
    doc.fontSize(10).text('Trimestre: ' + sessionInfo.trimestreLibelle, { align: 'center' });
    doc.fontSize(10).text('Session: ' + sessionInfo.libelle, { align: 'center' });
    doc.moveDown(1);

    // Informations de l'élève
    doc.fontSize(12).font('Helvetica-Bold').text('INFORMATIONS DE L\'ÉLÈVE');
    doc.fontSize(10).font('Helvetica');
    doc.text('Matricule: ' + matricule);
    doc.text('Nom et Prénoms: ' + eleve.nom + ' ' + eleve.prenom);
    doc.text('Date de naissance: ' + eleve.dateNaissance);
    doc.text('Lieu de naissance: ' + eleve.lieuNaissance);
    doc.moveDown(1);

    // Tableau des notes
    doc.fontSize(12).font('Helvetica-Bold').text('RÉSULTATS ACADÉMIQUES');
    doc.moveDown(0.5);

    // En-têtes du tableau
    const tableTop = doc.y;
    const col1 = 50;
    const col2 = 250;
    const col3 = 340;
    const col4 = 430;
    const rowHeight = 25;

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Cours', col1, tableTop);
    doc.text('Épreuve', col2, tableTop);
    doc.text('Note/20', col3, tableTop);
    doc.text('Appréciation', col4, tableTop);

    // Ligne de séparation
    doc.moveTo(40, tableTop + 20).lineTo(550, tableTop + 20).stroke();

    // Contenu du tableau
    doc.font('Helvetica').fontSize(9);
    let currentY = tableTop + 25;
    let totalPoints = 0;
    let totalCoeff = 0;

    const courseNotes = {};
    for (const evalItem of evals) {
      if (!courseNotes[evalItem.idCours]) {
        courseNotes[evalItem.idCours] = {
          libelle: evalItem.coursLibelle,
          coefficient: evalItem.coefficient || 1,
          notes: [],
          appreciation: evalItem.appreciation,
        };
      }
      courseNotes[evalItem.idCours].notes.push(evalItem.note);
    }

    for (const [_, course] of Object.entries(courseNotes)) {
      const moyenneCours = course.notes.length > 0
        ? (course.notes.reduce((a, b) => a + b, 0) / course.notes.length).toFixed(2)
        : 0;

      doc.text(course.libelle, col1, currentY);
      doc.text('Moy. cours', col2, currentY);
      doc.text(moyenneCours, col3, currentY);
      doc.text(course.appreciation || 'N/A', col4, currentY);

      totalPoints += parseFloat(moyenneCours) * course.coefficient;
      totalCoeff += course.coefficient;
      currentY += rowHeight;

      if (currentY > 700) {
        doc.addPage();
        currentY = 40;
      }
    }

    // Ligne de séparation finale
    doc.moveTo(40, currentY).lineTo(550, currentY).stroke();
    currentY += 15;

    // Moyenne générale
    const moyenneGenerale = totalCoeff > 0 ? (totalPoints / totalCoeff).toFixed(2) : 0;
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text('MOYENNE GÉNÉRALE: ' + moyenneGenerale + '/20', col1, currentY);

    doc.moveDown(2);

    // Signature
    doc.fontSize(10).font('Helvetica');
    doc.text('Signature du directeur:', 50);
    doc.moveDown(2);
    doc.text('________________');

    // Finalize
    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve('/uploads/bulletins/' + fileName));
      stream.on('error', reject);
    });
  } catch (error) {
    throw new Error('Erreur lors de la génération du bulletin: ' + error.message);
  }
};

module.exports = {
  generateBulletin,
};
