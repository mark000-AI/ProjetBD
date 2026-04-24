const pool = require('../config/db');

/**
 * Récupère tous les cycles
 */
const findAll = async () => {
  const [rows] = await pool.query(
    `SELECT idCycle, libelle, description, idAdmin, created
     FROM Cycle
     ORDER BY libelle ASC`
  );
  return rows;
};

/**
 * Récupère un cycle par son ID
 * @param {number} idCycle
 */
const findById = async (idCycle) => {
  const [rows] = await pool.query(
    `SELECT idCycle, libelle, description, idAdmin, created
     FROM Cycle
     WHERE idCycle = ? LIMIT 1`,
    [idCycle]
  );
  return rows[0] || null;
};

/**
 * Crée un nouveau cycle
 * @param {object} cycleData
 */
const create = async (cycleData) => {
  // Generer l'idCycle, souvent auto increment, mais idCycle n'est pas defini auto increment dans le script SQL fourni
  // D'après school_fixed.sql: CREATE TABLE `Cycle` ( `idCycle` int UNSIGNED NOT NULL, ... )
  // Wait, let's verify if idCycle should be auto increment. I will assume we should use max(idCycle) + 1 if not auto increment.
  // I'll query MAX(idCycle) and insert.
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [maxRows] = await conn.query('SELECT MAX(idCycle) as maxId FROM Cycle');
    const newId = (maxRows[0].maxId || 0) + 1;

    await conn.query(
      `INSERT INTO Cycle (idCycle, libelle, description, idAdmin, created)
       VALUES (?, ?, ?, ?, NOW())`,
      [newId, cycleData.libelle, cycleData.description || 'INDEFINI', cycleData.idAdmin]
    );
    await conn.commit();
    return newId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/**
 * Met à jour un cycle
 * @param {number} idCycle
 * @param {object} data
 */
const update = async (idCycle, data) => {
  const fields = [];
  const params = [];

  const allowed = ['libelle', 'description'];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(data[key]);
    }
  }

  if (fields.length === 0) return 0;
  params.push(idCycle);

  const [result] = await pool.query(
    `UPDATE Cycle SET ${fields.join(', ')} WHERE idCycle = ?`,
    params
  );
  return result.affectedRows;
};

/**
 * Supprime un cycle
 * @param {number} idCycle
 */
const remove = async (idCycle) => {
  const [result] = await pool.query(
    `DELETE FROM Cycle WHERE idCycle = ?`,
    [idCycle]
  );
  return result.affectedRows;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
