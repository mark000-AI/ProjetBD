const pool = require('../config/db');

/**
 * Récupère tous les parents (une ligne par parent).
 */
const findAll = async () => {
  const [rows] = await pool.query(
    `SELECT
       p.idPers, p.nom, p.prenom, p.dateNaissance, p.lieuNaissance,
       p.mobile, p.phone, p.username, p.alanyaID, p.created_at
     FROM Personne p
     WHERE p.isDelete = 0 AND p.typePersonne = 4
     ORDER BY p.nom ASC, p.prenom ASC`
  );
  return rows;
};

/**
 * Récupère un parent par idPers.
 * @param {number} idPers
 */
const findById = async (idPers) => {
  const [rows] = await pool.query(
    `SELECT
       p.idPers, p.nom, p.prenom, p.dateNaissance, p.lieuNaissance,
       p.mobile, p.phone, p.username, p.alanyaID, p.created_at
     FROM Personne p
     WHERE p.isDelete = 0 AND p.idPers = ? AND p.typePersonne = 4 LIMIT 1`,
    [idPers]
  );
  return rows[0] || null;
};

/**
 * Récupère tous les enfants d'un parent via idPers.
 * @param {number} idPers
 */
const findEnfantsByIdPers = async (idPers) => {
  const [rows] = await pool.query(
    `SELECT
       pa.idParent, pa.matricule,
       e.nom, e.prenom, e.dateNaissance, e.sexe, e.actif,
       c.libelle AS classe
     FROM Parents pa
     JOIN Eleve e   ON pa.matricule  = e.matricule
     LEFT JOIN Frequente f ON e.matricule = f.matricule
     LEFT JOIN Salle s     ON f.idSalle   = s.idSalle
     LEFT JOIN Classe c    ON s.idClasse  = c.idClasse
     WHERE pa.isDelete = 0 AND pa.idPers = ?
     ORDER BY e.nom ASC`,
    [idPers]
  );
  return rows;
};

/**
 * Récupère un lien parent-enfant par idParent.
 * @param {number} idParent
 */
const findLienById = async (idParent) => {
  const [rows] = await pool.query(
    `SELECT * FROM Parents WHERE idParent = ? LIMIT 1`,
    [idParent]
  );
  return rows[0] || null;
};

/**
 * Vérifie si un élève est déjà lié à un parent.
 * Règle métier : un enfant ne peut avoir qu'un seul parent dans le système.
 * @param {number} matricule
 */
const isEnfantDejaLie = async (matricule) => {
  const [rows] = await pool.query(
    `SELECT idParent FROM Parents WHERE isDelete = 0 AND matricule = ? LIMIT 1`,
    [matricule]
  );
  return rows.length > 0;
};

/**
 * Vérifie si un username est déjà pris.
 * @param {string} username
 * @param {number|null} excludeIdPers
 */
const isUsernameTaken = async (username, excludeIdPers = null) => {
  let query = 'SELECT idPers FROM Personne WHERE username = ?';
  const params = [username];
  if (excludeIdPers) {
    query += ' AND idPers != ?';
    params.push(excludeIdPers);
  }
  const [rows] = await pool.query(query, params);
  return rows.length > 0;
};

/**
 * Crée une Personne (parent) puis un lien Parents vers un élève.
 * @param {object} personneData
 * @param {number} matricule
 * @returns {{ idPers, idParent }}
 */
const create = async (personneData, matricule) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [p] = await conn.query(
      `INSERT INTO Personne
         (nom, prenom, dateNaissance, lieuNaissance, mobile, phone,
          typePersonne, username, password, alanyaID, idAdmin, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 4, ?, ?, ?, ?, NOW())`,
      [
        personneData.nom, personneData.prenom, personneData.dateNaissance,
        personneData.lieuNaissance, personneData.mobile || '000',
        personneData.phone || '000', personneData.username,
        personneData.password, personneData.alanyaID || null,
        personneData.idAdmin,
      ]
    );
    const idPers = p.insertId;

    const [pa] = await conn.query(
      `INSERT INTO Parents (idPers, matricule, idAdmin, created_at)
       VALUES (?, ?, ?, NOW())`,
      [idPers, matricule, personneData.idAdmin]
    );
    const idParent = pa.insertId;

    await conn.commit();
    return { idPers, idParent };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/**
 * Ajoute un enfant supplémentaire à un parent existant.
 * @param {number} idPers
 * @param {number} matricule
 * @param {number} idAdmin
 */
const addEnfant = async (idPers, matricule, idAdmin) => {
  const [result] = await pool.query(
    `INSERT INTO Parents (idPers, matricule, idAdmin, created_at)
     VALUES (?, ?, ?, NOW())`,
    [idPers, matricule, idAdmin]
  );
  return result.insertId;
};

/**
 * Met à jour les infos personnelles d'un parent.
 * @param {number} idPers
 * @param {object} data
 */
const updatePersonne = async (idPers, data) => {
  const fields = [];
  const params = [];

  const allowed = ['nom', 'prenom', 'dateNaissance', 'lieuNaissance',
    'mobile', 'phone', 'alanyaID', 'password'];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(data[key]);
    }
  }

  if (fields.length === 0) return 0;
  params.push(idPers);

  const [result] = await pool.query(
    `UPDATE Personne SET ${fields.join(', ')} WHERE isDelete = 0 AND idPers = ?`,
    params
  );
  return result.affectedRows;
};

/**
 * Supprime un lien parent-enfant par idParent.
 * @param {number} idParent
 */
const removeEnfant = async (idParent) => {
  const [result] = await pool.query(
    `UPDATE Parents SET isDelete = 1 WHERE idParent = ?`,
    [idParent]
  );
  return result.affectedRows;
};

/**
 * Supprime un parent complètement (Messages + Parents + Personne).
 * @param {number} idPers
 */
const remove = async (idPers) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `UPDATE Messages SET isDelete = 1 WHERE idParent IN
         (SELECT idParent FROM Parents WHERE idPers = ?)`,
      [idPers]
    );
    await conn.query(`UPDATE Parents SET isDelete = 1 WHERE idPers = ?`, [idPers]);
    await conn.query(`UPDATE Personne SET isDelete = 1 WHERE idPers = ?`, [idPers]);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = {
  findAll, findById, findEnfantsByIdPers, findLienById,
  isEnfantDejaLie, isUsernameTaken,
  create, addEnfant, updatePersonne, removeEnfant, remove,
};