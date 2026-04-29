const pool = require('../config/db');

/**
 * Récupère toutes les évaluations
 */
const findAll = async (filters = {}) => {
  let query = `
    SELECT e.*, el.nom AS eleveNom, el.prenom AS elevePrenom, 
           ep.libelle AS epreuveLibelle, c.libelle AS coursLibelle, s.libelle AS sessionLibelle
    FROM Evaluation e
    LEFT JOIN Eleve el ON e.matricule = el.matricule
    LEFT JOIN Epreuve ep ON e.idEpreuve = ep.idEpreuve
    LEFT JOIN Cours c ON e.idCours = c.idCours
    LEFT JOIN Session s ON e.idSession = s.idSession
    WHERE 1=1
  `;
  const params = [];

  if (filters.matricule !== undefined) query += ' AND e.matricule = ?', params.push(filters.matricule);
  if (filters.idCours !== undefined) query += ' AND e.idCours = ?', params.push(filters.idCours);
  if (filters.idSession !== undefined) query += ' AND e.idSession = ?', params.push(filters.idSession);
  if (filters.idEpreuve !== undefined) query += ' AND e.idEpreuve = ?', params.push(filters.idEpreuve);

  query += ' ORDER BY el.nom ASC, el.prenom ASC';
  const [rows] = await pool.query(query, params);
  return rows;
};

/**
 * Récupère une évaluation par son ID
 */
const findById = async (idEval) => {
  const [rows] = await pool.query(
    `SELECT e.*, el.nom AS eleveNom, el.prenom AS elevePrenom, 
            ep.libelle AS epreuveLibelle, c.libelle AS coursLibelle, s.libelle AS sessionLibelle,
            p.nom AS enseignantNom, p.prenom AS enseignantPrenom
     FROM Evaluation e
     LEFT JOIN Eleve el ON e.matricule = el.matricule
     LEFT JOIN Epreuve ep ON e.idEpreuve = ep.idEpreuve
     LEFT JOIN Cours c ON e.idCours = c.idCours
     LEFT JOIN Session s ON e.idSession = s.idSession
     LEFT JOIN Personne p ON e.idPers = p.idPers
     WHERE e.idEval = ? LIMIT 1`,
    [idEval]
  );
  return rows[0] || null;
};

/**
 * Crée une nouvelle évaluation
 */
const create = async (data) => {
  const { note, appreciation, matricule, idEpreuve, idCours, idSession, idPers } = data;
  const [result] = await pool.query(
    `INSERT INTO Evaluation (note, appreciation, matricule, idEpreuve, idCours, idSession, idPers)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [note || 0, appreciation || '', matricule, idEpreuve, idCours, idSession, idPers]
  );
  return result.insertId;
};

/**
 * Met à jour une évaluation
 */
const update = async (idEval, data) => {
  const allowedFields = ['note', 'appreciation'];
  const updates = [];
  const values = [];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(data[field]);
    }
  }

  if (updates.length === 0) return false;

  values.push(idEval);
  const [result] = await pool.query(
    `UPDATE Evaluation SET ${updates.join(', ')} WHERE idEval = ?`,
    values
  );
  return result.affectedRows > 0;
};

/**
 * Supprime une évaluation
 */
const remove = async (idEval) => {
  const [result] = await pool.query('DELETE FROM Evaluation WHERE idEval = ?', [idEval]);
  return result.affectedRows > 0;
};

/**
 * Récupère les évaluations d'un élève
 */
const findByEleve = async (matricule) => {
  const [rows] = await pool.query(
    `SELECT e.*, ep.libelle AS epreuveLibelle, c.libelle AS coursLibelle, s.libelle AS sessionLibelle
     FROM Evaluation e
     LEFT JOIN Epreuve ep ON e.idEpreuve = ep.idEpreuve
     LEFT JOIN Cours c ON e.idCours = c.idCours
     LEFT JOIN Session s ON e.idSession = s.idSession
     WHERE e.matricule = ? ORDER BY s.libelle DESC, c.libelle ASC`,
    [matricule]
  );
  return rows;
};

/**
 * Récupère les notes d'une session pour un cours
 */
const findBySessionCours = async (idSession, idCours) => {
  const [rows] = await pool.query(
    `SELECT e.*, el.nom, el.prenom, ep.libelle AS epreuveLibelle
     FROM Evaluation e
     LEFT JOIN Eleve el ON e.matricule = el.matricule
     LEFT JOIN Epreuve ep ON e.idEpreuve = ep.idEpreuve
     WHERE e.idSession = ? AND e.idCours = ? ORDER BY el.nom ASC, el.prenom ASC`,
    [idSession, idCours]
  );
  return rows;
};

/**
 * Calcule la moyenne d'un élève dans un cours
 */
const calculateMoyenne = async (matricule, idCours, idSession) => {
  const [rows] = await pool.query(
    `SELECT AVG(e.note) as moyenne FROM Evaluation e
     WHERE e.matricule = ? AND e.idCours = ? AND e.idSession = ?`,
    [matricule, idCours, idSession]
  );
  return rows[0]?.moyenne || 0;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  findByEleve,
  findBySessionCours,
  calculateMoyenne,
};
