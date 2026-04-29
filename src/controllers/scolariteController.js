const asyncHandler = require('../utils/asyncHandler');
const scolariteModel = require('../models/scolariteModel');

/**
 * GET /api/scolarites
 */
const getAll = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.idCycle !== undefined) filters.idCycle = parseInt(req.query.idCycle);

  const scolarites = await scolariteModel.findAll(filters);
  return res.status(200).json({ total: scolarites.length, scolarites });
});

/**
 * GET /api/scolarites/:idScolarite
 */
const getOne = asyncHandler(async (req, res) => {
  const scolarite = await scolariteModel.findById(parseInt(req.params.idScolarite));
  if (!scolarite) {
    return res.status(404).json({ message: 'Scolarité introuvable' });
  }
  return res.status(200).json({ scolarite });
});

/**
 * GET /api/scolarites/cycle/:idCycle
 */
const getByCycle = asyncHandler(async (req, res) => {
  const scolarite = await scolariteModel.findByCycle(parseInt(req.params.idCycle));
  if (!scolarite) {
    return res.status(404).json({ message: 'Pas de scolarité définie pour ce cycle' });
  }
  return res.status(200).json({ scolarite });
});

/**
 * POST /api/scolarites
 */
const create = asyncHandler(async (req, res) => {
  const { inscription, pension, nbreTranche, description, idCycle } = req.body;
  
  if (!inscription || !pension || !idCycle) {
    return res.status(400).json({ message: 'inscription, pension et idCycle sont obligatoires' });
  }

  if (inscription <= 0 || pension <= 0) {
    return res.status(400).json({ message: 'Les montants doivent être positifs' });
  }

  const idScolarite = await scolariteModel.create({
    inscription,
    pension,
    nbreTranche: nbreTranche || 3,
    description: description || '',
    idCycle,
    idFondateur: req.user.id,
  });

  return res.status(201).json({
    message: 'Scolarité créée avec succès',
    idScolarite,
  });
});

/**
 * PUT /api/scolarites/:idScolarite
 */
const update = asyncHandler(async (req, res) => {
  const scolarite = await scolariteModel.findById(parseInt(req.params.idScolarite));
  if (!scolarite) {
    return res.status(404).json({ message: 'Scolarité introuvable' });
  }

  if ((req.body.inscription !== undefined && req.body.inscription <= 0) ||
      (req.body.pension !== undefined && req.body.pension <= 0)) {
    return res.status(400).json({ message: 'Les montants doivent être positifs' });
  }

  const updated = await scolariteModel.update(parseInt(req.params.idScolarite), req.body);
  if (!updated) {
    return res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }

  return res.status(200).json({ message: 'Scolarité mise à jour avec succès' });
});

/**
 * DELETE /api/scolarites/:idScolarite
 */
const remove = asyncHandler(async (req, res) => {
  const scolarite = await scolariteModel.findById(parseInt(req.params.idScolarite));
  if (!scolarite) {
    return res.status(404).json({ message: 'Scolarité introuvable' });
  }

  const deleted = await scolariteModel.remove(parseInt(req.params.idScolarite));
  if (!deleted) {
    return res.status(500).json({ message: 'Erreur lors de la suppression' });
  }

  return res.status(200).json({ message: 'Scolarité supprimée avec succès' });
});

module.exports = {
  getAll,
  getOne,
  getByCycle,
  create,
  update,
  remove,
};
