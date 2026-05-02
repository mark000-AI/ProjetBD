const pool = require('../config/db');

/**
 * Récupère tous les paiements
 */
const findAll = async (filters = {}) => {
  let query = `
    SELECT p.*, el.nom AS eleveNom, el.prenom AS elevePrenom, 
           a.libelle AS anneeLibelle, m.libelle AS modeLibelle, pers.nom AS personneNom
    FROM Paiement p
    LEFT JOIN Eleve el ON p.matricule = el.matricule
    LEFT JOIN AnneeAcademique a ON p.idAca = a.idAnnee
    LEFT JOIN Mode m ON p.idMode = m.idMode
    LEFT JOIN Personne pers ON p.idPers = pers.idPers
    WHERE p.isDelete = 0 AND 1=1
  `;
  const params = [];

  if (filters.matricule !== undefined) query += ' AND p.matricule = ?', params.push(filters.matricule);
  if (filters.idAca !== undefined) query += ' AND p.idAca = ?', params.push(filters.idAca);
  if (filters.datePaie !== undefined) query += ' AND DATE(p.datePaie) = ?', params.push(filters.datePaie);

  query += ' ORDER BY p.datePaie DESC';
  const [rows] = await pool.query(query, params);
  return rows;
};

/**
 * Récupère un paiement par son ID
 */
const findById = async (idPaie) => {
  const [rows] = await pool.query(
    `SELECT p.*, el.nom AS eleveNom, el.prenom AS elevePrenom, 
            a.libelle AS anneeLibelle, m.libelle AS modeLibelle, pers.nom AS personneNom
     FROM Paiement p
     LEFT JOIN Eleve el ON p.matricule = el.matricule
     LEFT JOIN AnneeAcademique a ON p.idAca = a.idAnnee
     LEFT JOIN Mode m ON p.idMode = m.idMode
     LEFT JOIN Personne pers ON p.idPers = pers.idPers
     WHERE p.isDelete = 0 AND p.idPaie = ? LIMIT 1`,
    [idPaie]
  );
  return rows[0] || null;
};

/**
 * Crée un nouveau paiement
 */
const create = async (data) => {
  const { matricule, idAca, montant, comentaire, idMode, operation_ID, datePaie, idPers } = data;
  const [result] = await pool.query(
    `INSERT INTO Paiement (matricule, idAca, montant, comentaire, idMode, operation_ID, datePaie, idPers)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [matricule, idAca, montant, comentaire || 'INDEFINI', idMode || 1, operation_ID || 'INDEFINI', 
     datePaie || new Date().toISOString().split('T')[0], idPers]
  );
  return result.insertId;
};

/**
 * Met à jour un paiement
 */
const update = async (idPaie, data) => {
  const allowedFields = ['montant', 'comentaire', 'idMode', 'operation_ID', 'datePaie'];
  const updates = [];
  const values = [];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(data[field]);
    }
  }

  if (updates.length === 0) return false;

  values.push(idPaie);
  const [result] = await pool.query(
    `UPDATE Paiement SET ${updates.join(', ')} WHERE idPaie = ?`,
    values
  );
  return result.affectedRows > 0;
};

/**
 * Supprime un paiement
 */
const remove = async (idPaie) => {
  const [result] = await pool.query('UPDATE Paiement SET isDelete = 1 WHERE idPaie = ?', [idPaie]);
  return result.affectedRows > 0;
};

/**
 * Récupère les paiements d'un élève
 */
const findByEleve = async (matricule, idAca) => {
  const [rows] = await pool.query(
    `SELECT p.*, a.libelle AS anneeLibelle, m.libelle AS modeLibelle
     FROM Paiement p
     LEFT JOIN AnneeAcademique a ON p.idAca = a.idAnnee
     LEFT JOIN Mode m ON p.idMode = m.idMode
     WHERE p.isDelete = 0 AND p.matricule = ? AND p.idAca = ? ORDER BY p.datePaie DESC`,
    [matricule, idAca]
  );
  return rows;
};

/**
 * Récupère le montant total payé par un élève pour une année
 */
const getTotalPaid = async (matricule, idAca) => {
  const [rows] = await pool.query(
    `SELECT SUM(montant) as total FROM Paiement
     WHERE Paiement.isDelete = 0 AND matricule = ? AND idAca = ?`,
    [matricule, idAca]
  );
  return rows[0]?.total || 0;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  findByEleve,
  getTotalPaid,
};
