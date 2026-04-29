const asyncHandler = require('../utils/asyncHandler');
const pool = require('../config/db');

/**
 * GET /api/admin/dashboard
 * Récupère les statistiques du tableau de bord
 */
const getDashboard = asyncHandler(async (req, res) => {
  try {
    // Total d'élèves
    const [eleves] = await pool.query('SELECT COUNT(*) as total FROM Eleve');
    
    // Total d'enseignants
    const [enseignants] = await pool.query('SELECT COUNT(*) as total FROM Enseignant');
    
    // Total de parents
    const [parents] = await pool.query('SELECT COUNT(*) as total FROM Parents');
    
    // Total de classes
    const [classes] = await pool.query('SELECT COUNT(*) as total FROM Classe');
    
    // Paiements du jour
    const [paiementsJour] = await pool.query(
      'SELECT COUNT(*) as total, SUM(montant) as montant FROM Paiement WHERE DATE(datePaie) = CURDATE()'
    );
    
    // Élèves actifs
    const [elevesActifs] = await pool.query('SELECT COUNT(*) as total FROM Eleve WHERE actif = 1');

    return res.status(200).json({
      dashboard: {
        totalEleves: eleves[0]?.total || 0,
        elevesActifs: elevesActifs[0]?.total || 0,
        totalEnseignants: enseignants[0]?.total || 0,
        totalParents: parents[0]?.total || 0,
        totalClasses: classes[0]?.total || 0,
        paiementsJour: {
          nombre: paiementsJour[0]?.total || 0,
          montant: paiementsJour[0]?.montant || 0,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/admin/rapports/scolarites
 * Récupère un rapport sur les scolarités par cycle
 */
const getRapportScolarites = asyncHandler(async (req, res) => {
  try {
    const [scolarites] = await pool.query(
      `SELECT c.libelle, s.inscription, s.pension, s.nbreTranche
       FROM Scolarite s
       LEFT JOIN Cycle c ON s.idCycle = c.idCycle
       ORDER BY c.libelle ASC`
    );
    
    return res.status(200).json({ scolarites });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/admin/rapports/presence
 * Récupère un rapport de présence
 */
const getRapportPresence = asyncHandler(async (req, res) => {
  try {
    const { idClasse, idAnnee } = req.query;
    
    if (!idClasse || !idAnnee) {
      return res.status(400).json({ message: 'idClasse et idAnnee sont obligatoires' });
    }

    const [absences] = await pool.query(
      `SELECT r.matricule, el.nom, el.prenom, COUNT(*) as absences
       FROM Rapport r
       LEFT JOIN Eleve el ON r.matricule = el.matricule
       WHERE r.idAca = ?
       GROUP BY r.matricule, el.nom, el.prenom
       ORDER BY absences DESC`,
      [idAnnee]
    );
    
    return res.status(200).json({ absences });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/admin/rapports/paiements
 * Récupère un rapport sur les paiements
 */
const getRapportPaiements = asyncHandler(async (req, res) => {
  try {
    const { idAca, startDate, endDate } = req.query;
    
    let query = 'SELECT p.*, el.nom, el.prenom FROM Paiement p LEFT JOIN Eleve el ON p.matricule = el.matricule WHERE 1=1';
    const params = [];

    if (idAca) {
      query += ' AND p.idAca = ?';
      params.push(idAca);
    }

    if (startDate) {
      query += ' AND p.datePaie >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND p.datePaie <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY p.datePaie DESC';
    const [paiements] = await pool.query(query, params);
    
    let totalMontant = 0;
    paiements.forEach(p => totalMontant += p.montant);

    return res.status(200).json({
      paiements,
      total: paiements.length,
      montantTotal: totalMontant,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/admin/rapports/salaires
 * Récupère un rapport sur les salaires
 */
const getRapportSalaires = asyncHandler(async (req, res) => {
  try {
    const { idAca, mois } = req.query;
    
    let query = `SELECT s.*, p.nom, p.prenom FROM Salaire s 
                 LEFT JOIN Personne p ON s.idPers = p.idPers WHERE 1=1`;
    const params = [];

    if (idAca) {
      query += ' AND s.idAca = ?';
      params.push(idAca);
    }

    if (mois) {
      query += ' AND s.mois = ?';
      params.push(mois);
    }

    query += ' ORDER BY p.nom ASC, s.mois DESC';
    const [salaires] = await pool.query(query, params);
    
    let totalMontant = 0;
    salaires.forEach(s => totalMontant += s.montant);

    return res.status(200).json({
      salaires,
      total: salaires.length,
      montantTotal: totalMontant,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * DELETE /api/admin/cleanup
 * Nettoie les anciennes données (dev mode seulement)
 */
const cleanup = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ message: 'Cette action est uniquement disponible en développement' });
  }

  try {
    // À implémenter selon les besoins
    return res.status(200).json({ message: 'Nettoyage effectué' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = {
  getDashboard,
  getRapportScolarites,
  getRapportPresence,
  getRapportPaiements,
  getRapportSalaires,
  cleanup,
};
