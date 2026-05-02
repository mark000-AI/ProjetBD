const pool = require('../config/db');

/**
 * Récupère tous les élèves avec leur ville de naissance.
 * @param {object} filters - { actif, idAdmin }
 */
const findAll = async (filters = {}) => {
  let query = `
    SELECT e.*, v.libelle AS villeNaissance
    FROM Eleve e
    LEFT JOIN VilleNaissance v ON e.idVilleNaissance = v.idVille
    WHERE e.isDelete = 0 AND 1=1
  `;
  const params = [];

  if (filters.actif !== undefined) {
    query += ' AND e.actif = ?';
    params.push(filters.actif);
  }
  if (filters.idAdmin !== undefined) {
    query += ' AND e.idAdmin = ?';
    params.push(filters.idAdmin);
  }

  query += ' ORDER BY e.nom ASC, e.prenom ASC';

  const [rows] = await pool.query(query, params);
  return rows;
};

/**
 * Récupère un élève par son matricule.
 * @param {number} matricule
 */
const findByMatricule = async (matricule) => {
  const [rows] = await pool.query(
    `SELECT e.*, v.libelle AS villeNaissance
     FROM Eleve e
     LEFT JOIN VilleNaissance v ON e.idVilleNaissance = v.idVille
     WHERE e.isDelete = 0 AND e.matricule = ? LIMIT 1`,
    [matricule]
  );
  return rows[0] || null;
};

/**
 * Récupère les élèves d'une classe via la table Frequente → Salle → Classe.
 * @param {number} idClasse
 * @param {number} idAnnee
 */
const findByClasse = async (idClasse, idAnnee) => {
  const [rows] = await pool.query(
    `SELECT e.*, v.libelle AS villeNaissance
     FROM Eleve e
     JOIN Frequente f ON e.matricule = f.matricule
     JOIN Salle s     ON f.idSalle   = s.idSalle
     LEFT JOIN VilleNaissance v ON e.idVilleNaissance = v.idVille
     WHERE e.isDelete = 0 AND s.idClasse = ? AND f.idAcademi = ?
     ORDER BY e.nom ASC, e.prenom ASC`,
    [idClasse, idAnnee]
  );
  return rows;
};

/**
 * Crée un nouvel élève.
 * @param {object} data
 */
const create = async (data) => {
  const {
    nom, prenom, dateNaissance, lieuNaissance,
    sexe, langue, photoURL, actif,
    idVilleNaissance, idAdmin,
  } = data;

  const [result] = await pool.query(
    `INSERT INTO Eleve
       (nom, prenom, dateNaissance, lieuNaissance, sexe, langue, photoURL, actif, idVilleNaissance, idAdmin, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [nom, prenom, dateNaissance, lieuNaissance, sexe,
     langue || 'NON DEFINI', photoURL || 'INDEFINI', actif ?? 0,
     idVilleNaissance, idAdmin]
  );
  return result.insertId;
};

/**
 * Met à jour un élève existant.
 * @param {number} matricule
 * @param {object} data
 */
const update = async (matricule, data) => {
  const fields = [];
  const params = [];

  const allowed = [
    'nom', 'prenom', 'dateNaissance', 'lieuNaissance',
    'sexe', 'langue', 'photoURL', 'actif', 'idVilleNaissance',
  ];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(data[key]);
    }
  }

  if (fields.length === 0) return 0;

  params.push(matricule);
  const [result] = await pool.query(
    `UPDATE Eleve SET ${fields.join(', ')} WHERE matricule = ?`,
    params
  );
  return result.affectedRows;
};

/**
 * Active ou désactive un élève (soft delete).
 * @param {number} matricule
 * @param {number} actif - 0 ou 1
 */
const setActif = async (matricule, actif) => {
  const [result] = await pool.query(
    'UPDATE Eleve SET actif = ? WHERE matricule = ?',
    [actif, matricule]
  );
  return result.affectedRows;
};

/**
 * Supprime toutes les données liées à un élève (dans le bon ordre FK).
 * @param {number} matricule
 */
const removeRelated = async (matricule) => {
  await pool.query('UPDATE Evaluation SET isDelete = 1 WHERE matricule = ?', [matricule]);
  await pool.query('UPDATE Rapport SET isDelete = 1 WHERE matricule = ?', [matricule]);
  await pool.query('UPDATE Paiement SET isDelete = 1 WHERE matricule = ?', [matricule]);
  await pool.query('UPDATE Frequente SET isDelete = 1 WHERE matricule = ?', [matricule]);
  await pool.query('UPDATE Parents SET isDelete = 1 WHERE matricule = ?', [matricule]);
};

/**
 * Supprime définitivement un élève (à utiliser avec précaution).
 * @param {number} matricule
 */
const remove = async (matricule) => {
  const [result] = await pool.query(
    'UPDATE Eleve SET isDelete = 1 WHERE matricule = ?',
    [matricule]
  );
  return result.affectedRows;
};

module.exports = { findAll, findByMatricule, findByClasse, create, update, setActif, removeRelated, remove };