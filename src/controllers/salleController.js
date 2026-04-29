const asyncHandler = require('../utils/asyncHandler');
const salleModel = require('../models/salleModel');

/**
 * GET /api/salles
 */
const getAll = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.actif !== undefined) filters.actif = parseInt(req.query.actif);
  if (req.query.idClasse !== undefined) filters.idClasse = parseInt(req.query.idClasse);
  if (req.query.idAdmin !== undefined) filters.idAdmin = parseInt(req.query.idAdmin);

  const salles = await salleModel.findAll(filters);
  return res.status(200).json({ total: salles.length, salles });
});

/**
 * GET /api/salles/:idSalle
 */
const getOne = asyncHandler(async (req, res) => {
  const salle = await salleModel.findById(parseInt(req.params.idSalle));
  if (!salle) {
    return res.status(404).json({ message: 'Salle introuvable' });
  }
  return res.status(200).json({ salle });
});

/**
 * GET /api/salles/classe/:idClasse
 */
const getByClasse = asyncHandler(async (req, res) => {
  const salles = await salleModel.findByClasse(parseInt(req.params.idClasse));
  return res.status(200).json({ total: salles.length, salles });
});

/**
 * POST /api/salles
 */
const create = asyncHandler(async (req, res) => {
  const { libelle, position, surface, idClasse } = req.body;
  
  if (!libelle || !idClasse) {
    return res.status(400).json({ message: 'libelle et idClasse sont obligatoires' });
  }

  const idSalle = await salleModel.create({
    libelle,
    position: position || 'NON DEFINI',
    surface: surface || '',
    idClasse,
    idAdmin: req.user.id,
  });

  return res.status(201).json({
    message: 'Salle créée avec succès',
    idSalle,
  });
});

/**
 * PUT /api/salles/:idSalle
 */
const update = asyncHandler(async (req, res) => {
  const salle = await salleModel.findById(parseInt(req.params.idSalle));
  if (!salle) {
    return res.status(404).json({ message: 'Salle introuvable' });
  }

  const updated = await salleModel.update(parseInt(req.params.idSalle), req.body);
  if (!updated) {
    return res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }

  return res.status(200).json({ message: 'Salle mise à jour avec succès' });
});

/**
 * DELETE /api/salles/:idSalle
 */
const remove = asyncHandler(async (req, res) => {
  const salle = await salleModel.findById(parseInt(req.params.idSalle));
  if (!salle) {
    return res.status(404).json({ message: 'Salle introuvable' });
  }

  const deleted = await salleModel.remove(parseInt(req.params.idSalle));
  if (!deleted) {
    return res.status(500).json({ message: 'Erreur lors de la suppression' });
  }

  return res.status(200).json({ message: 'Salle supprimée avec succès' });
});

module.exports = {
  getAll,
  getOne,
  getByClasse,
  create,
  update,
  remove,
};
