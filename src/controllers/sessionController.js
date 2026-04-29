const asyncHandler = require('../utils/asyncHandler');
const sessionModel = require('../models/sessionModel');

/**
 * GET /api/sessions
 */
const getAll = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.idTrimestre !== undefined) filters.idTrimestre = parseInt(req.query.idTrimestre);
  if (req.query.idPers !== undefined) filters.idPers = parseInt(req.query.idPers);

  const sessions = await sessionModel.findAll(filters);
  return res.status(200).json({ total: sessions.length, sessions });
});

/**
 * GET /api/sessions/:idSession
 */
const getOne = asyncHandler(async (req, res) => {
  const session = await sessionModel.findById(parseInt(req.params.idSession));
  if (!session) {
    return res.status(404).json({ message: 'Session introuvable' });
  }
  return res.status(200).json({ session });
});

/**
 * GET /api/sessions/trimestre/:idTrimestre
 */
const getByTrimestre = asyncHandler(async (req, res) => {
  const sessions = await sessionModel.findByTrimestre(parseInt(req.params.idTrimestre));
  return res.status(200).json({ total: sessions.length, sessions });
});

/**
 * POST /api/sessions
 */
const create = asyncHandler(async (req, res) => {
  const { libelle, description, idTrimestre, idPers } = req.body;
  
  if (!libelle || !idTrimestre || !idPers) {
    return res.status(400).json({ message: 'libelle, idTrimestre et idPers sont obligatoires' });
  }

  const idSession = await sessionModel.create({
    libelle,
    description: description || null,
    idTrimestre,
    idPers,
  });

  return res.status(201).json({
    message: 'Session créée avec succès',
    idSession,
  });
});

/**
 * PUT /api/sessions/:idSession
 */
const update = asyncHandler(async (req, res) => {
  const session = await sessionModel.findById(parseInt(req.params.idSession));
  if (!session) {
    return res.status(404).json({ message: 'Session introuvable' });
  }

  const updated = await sessionModel.update(parseInt(req.params.idSession), req.body);
  if (!updated) {
    return res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }

  return res.status(200).json({ message: 'Session mise à jour avec succès' });
});

/**
 * DELETE /api/sessions/:idSession
 */
const remove = asyncHandler(async (req, res) => {
  const session = await sessionModel.findById(parseInt(req.params.idSession));
  if (!session) {
    return res.status(404).json({ message: 'Session introuvable' });
  }

  const deleted = await sessionModel.remove(parseInt(req.params.idSession));
  if (!deleted) {
    return res.status(500).json({ message: 'Erreur lors de la suppression' });
  }

  return res.status(200).json({ message: 'Session supprimée avec succès' });
});

module.exports = {
  getAll,
  getOne,
  getByTrimestre,
  create,
  update,
  remove,
};
