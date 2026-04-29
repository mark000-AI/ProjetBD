const asyncHandler = require('../utils/asyncHandler');
const anneeModel = require('../models/anneeModel');

/**
 * GET /api/annees
 */
const getAll = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.idAdmin !== undefined) filters.idAdmin = parseInt(req.query.idAdmin);

  const annees = await anneeModel.findAll(filters);
  return res.status(200).json({ total: annees.length, annees });
});

/**
 * GET /api/annees/:idAnnee
 */
const getOne = asyncHandler(async (req, res) => {
  const annee = await anneeModel.findById(parseInt(req.params.idAnnee));
  if (!annee) {
    return res.status(404).json({ message: 'Année académique introuvable' });
  }
  return res.status(200).json({ annee });
});

/**
 * POST /api/annees
 */
const create = asyncHandler(async (req, res) => {
  const { libelle, periode } = req.body;
  
  if (!libelle || !periode) {
    return res.status(400).json({ message: 'libelle et periode sont obligatoires' });
  }

  const idAnnee = await anneeModel.create({
    libelle,
    periode,
    idAdmin: req.user.id,
  });

  return res.status(201).json({
    message: 'Année académique créée avec succès',
    idAnnee,
  });
});

/**
 * PUT /api/annees/:idAnnee
 */
const update = asyncHandler(async (req, res) => {
  const annee = await anneeModel.findById(parseInt(req.params.idAnnee));
  if (!annee) {
    return res.status(404).json({ message: 'Année académique introuvable' });
  }

  const updated = await anneeModel.update(parseInt(req.params.idAnnee), req.body);
  if (!updated) {
    return res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }

  return res.status(200).json({ message: 'Année académique mise à jour avec succès' });
});

/**
 * DELETE /api/annees/:idAnnee
 */
const remove = asyncHandler(async (req, res) => {
  const annee = await anneeModel.findById(parseInt(req.params.idAnnee));
  if (!annee) {
    return res.status(404).json({ message: 'Année académique introuvable' });
  }

  const deleted = await anneeModel.remove(parseInt(req.params.idAnnee));
  if (!deleted) {
    return res.status(500).json({ message: 'Erreur lors de la suppression' });
  }

  return res.status(200).json({ message: 'Année académique supprimée avec succès' });
});

module.exports = {
  getAll,
  getOne,
  create,
  update,
  remove,
};
