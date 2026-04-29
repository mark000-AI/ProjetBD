const asyncHandler = require('../utils/asyncHandler');
const trimestreModel = require('../models/trimestreModel');

/**
 * GET /api/trimestres
 */
const getAll = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.idAca !== undefined) filters.idAca = parseInt(req.query.idAca);
  if (req.query.idAdmin !== undefined) filters.idAdmin = parseInt(req.query.idAdmin);

  const trimestres = await trimestreModel.findAll(filters);
  return res.status(200).json({ total: trimestres.length, trimestres });
});

/**
 * GET /api/trimestres/:idTrimes
 */
const getOne = asyncHandler(async (req, res) => {
  const trimestre = await trimestreModel.findById(parseInt(req.params.idTrimes));
  if (!trimestre) {
    return res.status(404).json({ message: 'Trimestre introuvable' });
  }
  return res.status(200).json({ trimestre });
});

/**
 * GET /api/trimestres/annee/:idAca
 */
const getByAnnee = asyncHandler(async (req, res) => {
  const trimestres = await trimestreModel.findByAnnee(parseInt(req.params.idAca));
  return res.status(200).json({ total: trimestres.length, trimestres });
});

/**
 * POST /api/trimestres
 */
const create = asyncHandler(async (req, res) => {
  const { libelle, periode, idAca } = req.body;
  
  if (!libelle || !periode || !idAca) {
    return res.status(400).json({ message: 'libelle, periode et idAca sont obligatoires' });
  }

  const idTrimes = await trimestreModel.create({
    libelle,
    periode,
    idAca,
    idAdmin: req.user.id,
  });

  return res.status(201).json({
    message: 'Trimestre créé avec succès',
    idTrimes,
  });
});

/**
 * PUT /api/trimestres/:idTrimes
 */
const update = asyncHandler(async (req, res) => {
  const trimestre = await trimestreModel.findById(parseInt(req.params.idTrimes));
  if (!trimestre) {
    return res.status(404).json({ message: 'Trimestre introuvable' });
  }

  const updated = await trimestreModel.update(parseInt(req.params.idTrimes), req.body);
  if (!updated) {
    return res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }

  return res.status(200).json({ message: 'Trimestre mis à jour avec succès' });
});

/**
 * DELETE /api/trimestres/:idTrimes
 */
const remove = asyncHandler(async (req, res) => {
  const trimestre = await trimestreModel.findById(parseInt(req.params.idTrimes));
  if (!trimestre) {
    return res.status(404).json({ message: 'Trimestre introuvable' });
  }

  const deleted = await trimestreModel.remove(parseInt(req.params.idTrimes));
  if (!deleted) {
    return res.status(500).json({ message: 'Erreur lors de la suppression' });
  }

  return res.status(200).json({ message: 'Trimestre supprimé avec succès' });
});

module.exports = {
  getAll,
  getOne,
  getByAnnee,
  create,
  update,
  remove,
};
