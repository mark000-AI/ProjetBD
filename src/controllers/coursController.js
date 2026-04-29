const asyncHandler = require('../utils/asyncHandler');
const coursModel = require('../models/coursModel');

/**
 * GET /api/cours
 * Liste tous les cours
 */
const getAll = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.actif !== undefined) filters.actif = parseInt(req.query.actif);
  if (req.query.idClasse !== undefined) filters.idClasse = parseInt(req.query.idClasse);
  if (req.query.idAdmin !== undefined) filters.idAdmin = parseInt(req.query.idAdmin);

  const cours = await coursModel.findAll(filters);
  return res.status(200).json({ total: cours.length, cours });
});

/**
 * GET /api/cours/:idCours
 * Détail d'un cours
 */
const getOne = asyncHandler(async (req, res) => {
  const cours = await coursModel.findById(parseInt(req.params.idCours));
  if (!cours) {
    return res.status(404).json({ message: 'Cours introuvable' });
  }
  return res.status(200).json({ cours });
});

/**
 * GET /api/cours/classe/:idClasse
 * Cours d'une classe
 */
const getByClasse = asyncHandler(async (req, res) => {
  const cours = await coursModel.findByClasse(parseInt(req.params.idClasse));
  return res.status(200).json({ total: cours.length, cours });
});

/**
 * POST /api/cours
 * Crée un nouveau cours
 */
const create = asyncHandler(async (req, res) => {
  const { libelle, note, coefficient, description, idClasse } = req.body;
  
  if (!libelle || !idClasse) {
    return res.status(400).json({ message: 'libelle et idClasse sont obligatoires' });
  }

  const idCours = await coursModel.create({
    libelle,
    note: note || 0,
    coefficient: coefficient || 1,
    description: description || '',
    idClasse,
    idAdmin: req.user.id,
  });

  return res.status(201).json({
    message: 'Cours créé avec succès',
    idCours,
  });
});

/**
 * PUT /api/cours/:idCours
 * Met à jour un cours
 */
const update = asyncHandler(async (req, res) => {
  const cours = await coursModel.findById(parseInt(req.params.idCours));
  if (!cours) {
    return res.status(404).json({ message: 'Cours introuvable' });
  }

  const updated = await coursModel.update(parseInt(req.params.idCours), req.body);
  if (!updated) {
    return res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }

  return res.status(200).json({ message: 'Cours mis à jour avec succès' });
});

/**
 * DELETE /api/cours/:idCours
 * Supprime un cours
 */
const remove = asyncHandler(async (req, res) => {
  const cours = await coursModel.findById(parseInt(req.params.idCours));
  if (!cours) {
    return res.status(404).json({ message: 'Cours introuvable' });
  }

  const deleted = await coursModel.remove(parseInt(req.params.idCours));
  if (!deleted) {
    return res.status(500).json({ message: 'Erreur lors de la suppression' });
  }

  return res.status(200).json({ message: 'Cours supprimé avec succès' });
});

module.exports = {
  getAll,
  getOne,
  getByClasse,
  create,
  update,
  remove,
};
