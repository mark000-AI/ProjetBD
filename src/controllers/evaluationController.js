const asyncHandler = require('../utils/asyncHandler');
const evaluationModel = require('../models/evaluationModel');

/**
 * GET /api/evaluations
 */
const getAll = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.matricule !== undefined) filters.matricule = parseInt(req.query.matricule);
  if (req.query.idCours !== undefined) filters.idCours = parseInt(req.query.idCours);
  if (req.query.idSession !== undefined) filters.idSession = parseInt(req.query.idSession);
  if (req.query.idEpreuve !== undefined) filters.idEpreuve = parseInt(req.query.idEpreuve);

  const evaluations = await evaluationModel.findAll(filters);
  return res.status(200).json({ total: evaluations.length, evaluations });
});

/**
 * GET /api/evaluations/:idEval
 */
const getOne = asyncHandler(async (req, res) => {
  const evaluation = await evaluationModel.findById(parseInt(req.params.idEval));
  if (!evaluation) {
    return res.status(404).json({ message: 'Évaluation introuvable' });
  }
  return res.status(200).json({ evaluation });
});

/**
 * GET /api/evaluations/eleve/:matricule
 */
const getByEleve = asyncHandler(async (req, res) => {
  const evaluations = await evaluationModel.findByEleve(parseInt(req.params.matricule));
  return res.status(200).json({ total: evaluations.length, evaluations });
});

/**
 * GET /api/evaluations/session-cours/:idSession/:idCours
 */
const getBySessionCours = asyncHandler(async (req, res) => {
  const evaluations = await evaluationModel.findBySessionCours(
    parseInt(req.params.idSession),
    parseInt(req.params.idCours)
  );
  return res.status(200).json({ total: evaluations.length, evaluations });
});

/**
 * GET /api/evaluations/moyenne/:matricule/:idCours/:idSession
 */
const getMoyenne = asyncHandler(async (req, res) => {
  const moyenne = await evaluationModel.calculateMoyenne(
    parseInt(req.params.matricule),
    parseInt(req.params.idCours),
    parseInt(req.params.idSession)
  );
  return res.status(200).json({ matricule: req.params.matricule, idCours: req.params.idCours, moyenne });
});

/**
 * POST /api/evaluations
 */
const create = asyncHandler(async (req, res) => {
  const { note, appreciation, matricule, idEpreuve, idCours, idSession } = req.body;
  
  if (note === undefined || !matricule || !idEpreuve || !idCours || !idSession) {
    return res.status(400).json({ message: 'Informations manquantes' });
  }

  if (note < 0 || note > 20) {
    return res.status(400).json({ message: 'La note doit être entre 0 et 20' });
  }

  const idEval = await evaluationModel.create({
    note,
    appreciation: appreciation || '',
    matricule,
    idEpreuve,
    idCours,
    idSession,
    idPers: req.user.id,
  });

  return res.status(201).json({
    message: 'Évaluation créée avec succès',
    idEval,
  });
});

/**
 * PUT /api/evaluations/:idEval
 */
const update = asyncHandler(async (req, res) => {
  const evaluation = await evaluationModel.findById(parseInt(req.params.idEval));
  if (!evaluation) {
    return res.status(404).json({ message: 'Évaluation introuvable' });
  }

  if (req.body.note !== undefined && (req.body.note < 0 || req.body.note > 20)) {
    return res.status(400).json({ message: 'La note doit être entre 0 et 20' });
  }

  const updated = await evaluationModel.update(parseInt(req.params.idEval), req.body);
  if (!updated) {
    return res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }

  return res.status(200).json({ message: 'Évaluation mise à jour avec succès' });
});

/**
 * DELETE /api/evaluations/:idEval
 */
const remove = asyncHandler(async (req, res) => {
  const evaluation = await evaluationModel.findById(parseInt(req.params.idEval));
  if (!evaluation) {
    return res.status(404).json({ message: 'Évaluation introuvable' });
  }

  const deleted = await evaluationModel.remove(parseInt(req.params.idEval));
  if (!deleted) {
    return res.status(500).json({ message: 'Erreur lors de la suppression' });
  }

  return res.status(200).json({ message: 'Évaluation supprimée avec succès' });
});

module.exports = {
  getAll,
  getOne,
  getByEleve,
  getBySessionCours,
  getMoyenne,
  create,
  update,
  remove,
};
