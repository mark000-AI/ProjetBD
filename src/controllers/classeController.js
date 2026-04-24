const asyncHandler = require('../utils/asyncHandler');
const classeModel = require('../models/classeModel');
const cycleModel = require('../models/cycleModel');

/**
 * GET /api/classes
 */
const getAll = asyncHandler(async (req, res) => {
  const classes = await classeModel.findAll();
  return res.status(200).json({ total: classes.length, classes });
});

/**
 * GET /api/classes/:idClasse
 */
const getOne = asyncHandler(async (req, res) => {
  const idClasse = parseInt(req.params.idClasse);
  const classe = await classeModel.findById(idClasse);
  if (!classe) {
    return res.status(404).json({ message: 'Classe introuvable' });
  }
  return res.status(200).json({ classe });
});

/**
 * POST /api/classes
 */
const create = asyncHandler(async (req, res) => {
  const { idCycle } = req.body;

  // Vérifier que le cycle existe
  const cycle = await cycleModel.findById(idCycle);
  if (!cycle) {
    return res.status(404).json({ message: 'Le cycle spécifié est introuvable' });
  }

  const data = { ...req.body, idAdmin: req.user.id };
  const idClasse = await classeModel.create(data);
  const newClasse = await classeModel.findById(idClasse);
  return res.status(201).json({ message: 'Classe créée avec succès', classe: newClasse });
});

/**
 * PUT /api/classes/:idClasse
 */
const update = asyncHandler(async (req, res) => {
  const idClasse = parseInt(req.params.idClasse);
  const existing = await classeModel.findById(idClasse);
  if (!existing) {
    return res.status(404).json({ message: 'Classe introuvable' });
  }

  if (req.body.idCycle) {
    const cycle = await cycleModel.findById(req.body.idCycle);
    if (!cycle) {
      return res.status(404).json({ message: 'Le cycle spécifié est introuvable' });
    }
  }

  await classeModel.update(idClasse, req.body);
  const updated = await classeModel.findById(idClasse);
  return res.status(200).json({ message: 'Classe mise à jour', classe: updated });
});

/**
 * DELETE /api/classes/:idClasse
 */
const remove = asyncHandler(async (req, res) => {
  const idClasse = parseInt(req.params.idClasse);
  const existing = await classeModel.findById(idClasse);
  if (!existing) {
    return res.status(404).json({ message: 'Classe introuvable' });
  }

  try {
    await classeModel.remove(idClasse);
    return res.status(200).json({ message: 'Classe supprimée avec succès', idClasse });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ message: 'Impossible de supprimer cette classe car elle est référencée par d\'autres éléments (élèves, cours, etc.)' });
    }
    throw err;
  }
});

module.exports = {
  getAll,
  getOne,
  create,
  update,
  remove,
};
