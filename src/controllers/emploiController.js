const asyncHandler = require('../utils/asyncHandler');
const emploiModel = require('../models/emploiModel');

/**
 * GET /api/emplois
 */
const getAll = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.idClasse !== undefined) filters.idClasse = parseInt(req.query.idClasse);
  if (req.query.jour !== undefined) filters.jour = req.query.jour;
  if (req.query.idAdmin !== undefined) filters.idAdmin = parseInt(req.query.idAdmin);

  const emplois = await emploiModel.findAll(filters);
  return res.status(200).json({ total: emplois.length, emplois });
});

/**
 * GET /api/emplois/:idTemps
 */
const getOne = asyncHandler(async (req, res) => {
  const emploi = await emploiModel.findById(parseInt(req.params.idTemps));
  if (!emploi) {
    return res.status(404).json({ message: 'Emploi de temps introuvable' });
  }
  return res.status(200).json({ emploi });
});

/**
 * GET /api/emplois/classe/:idClasse
 */
const getByClasse = asyncHandler(async (req, res) => {
  const emplois = await emploiModel.findByClasse(parseInt(req.params.idClasse));
  return res.status(200).json({ total: emplois.length, emplois });
});

/**
 * GET /api/emplois/jour/:jour
 */
const getByJour = asyncHandler(async (req, res) => {
  const emplois = await emploiModel.findByJour(req.params.jour);
  return res.status(200).json({ total: emplois.length, emplois });
});

/**
 * POST /api/emplois
 */
const create = asyncHandler(async (req, res) => {
  const { jour, heure, idClasse, idCours } = req.body;
  
  if (!jour || !heure || !idClasse || !idCours) {
    return res.status(400).json({ message: 'jour, heure, idClasse et idCours sont obligatoires' });
  }

  // Validation du format de l'heure (HH:MM)
  if (!/^\d{2}:\d{2}$/.test(heure)) {
    return res.status(400).json({ message: 'Format de l\'heure invalide (HH:MM)' });
  }

  const idTemps = await emploiModel.create({
    jour,
    heure,
    idClasse,
    idCours,
    idAdmin: req.user.id,
  });

  return res.status(201).json({
    message: 'Emploi de temps créé avec succès',
    idTemps,
  });
});

/**
 * PUT /api/emplois/:idTemps
 */
const update = asyncHandler(async (req, res) => {
  const emploi = await emploiModel.findById(parseInt(req.params.idTemps));
  if (!emploi) {
    return res.status(404).json({ message: 'Emploi de temps introuvable' });
  }

  if (req.body.heure && !/^\d{2}:\d{2}$/.test(req.body.heure)) {
    return res.status(400).json({ message: 'Format de l\'heure invalide (HH:MM)' });
  }

  const updated = await emploiModel.update(parseInt(req.params.idTemps), req.body);
  if (!updated) {
    return res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }

  return res.status(200).json({ message: 'Emploi de temps mis à jour avec succès' });
});

/**
 * DELETE /api/emplois/:idTemps
 */
const remove = asyncHandler(async (req, res) => {
  const emploi = await emploiModel.findById(parseInt(req.params.idTemps));
  if (!emploi) {
    return res.status(404).json({ message: 'Emploi de temps introuvable' });
  }

  const deleted = await emploiModel.remove(parseInt(req.params.idTemps));
  if (!deleted) {
    return res.status(500).json({ message: 'Erreur lors de la suppression' });
  }

  return res.status(200).json({ message: 'Emploi de temps supprimé avec succès' });
});

module.exports = {
  getAll,
  getOne,
  getByClasse,
  getByJour,
  create,
  update,
  remove,
};
