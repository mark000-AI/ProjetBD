const asyncHandler = require('../utils/asyncHandler');
const cycleModel = require('../models/cycleModel');

/**
 * GET /api/cycles
 */
const getAll = asyncHandler(async (req, res) => {
  const cycles = await cycleModel.findAll();
  return res.status(200).json({ total: cycles.length, cycles });
});

/**
 * GET /api/cycles/:idCycle
 */
const getOne = asyncHandler(async (req, res) => {
  const idCycle = parseInt(req.params.idCycle);
  const cycle = await cycleModel.findById(idCycle);
  if (!cycle) {
    return res.status(404).json({ message: 'Cycle introuvable' });
  }
  return res.status(200).json({ cycle });
});

/**
 * POST /api/cycles
 */
const create = asyncHandler(async (req, res) => {
  const data = { ...req.body, idAdmin: req.user.id };
  const idCycle = await cycleModel.create(data);
  const newCycle = await cycleModel.findById(idCycle);
  return res.status(201).json({ message: 'Cycle créé avec succès', cycle: newCycle });
});

/**
 * PUT /api/cycles/:idCycle
 */
const update = asyncHandler(async (req, res) => {
  const idCycle = parseInt(req.params.idCycle);
  const existing = await cycleModel.findById(idCycle);
  if (!existing) {
    return res.status(404).json({ message: 'Cycle introuvable' });
  }

  await cycleModel.update(idCycle, req.body);
  const updated = await cycleModel.findById(idCycle);
  return res.status(200).json({ message: 'Cycle mis à jour', cycle: updated });
});

/**
 * DELETE /api/cycles/:idCycle
 */
const remove = asyncHandler(async (req, res) => {
  const idCycle = parseInt(req.params.idCycle);
  const existing = await cycleModel.findById(idCycle);
  if (!existing) {
    return res.status(404).json({ message: 'Cycle introuvable' });
  }

  // Vérifier si des classes sont liées avant de supprimer
  // MySQL devrait le bloquer via la contrainte de clé étrangère (si ON DELETE RESTRICT),
  // mais notre script a ON DELETE NO ACTION ON UPDATE CASCADE.
  try {
    await cycleModel.remove(idCycle);
    return res.status(200).json({ message: 'Cycle supprimé avec succès', idCycle });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ message: 'Impossible de supprimer ce cycle car il contient des classes' });
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
