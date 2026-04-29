const asyncHandler = require('../utils/asyncHandler');
const salaireModel = require('../models/salaireModel');

/**
 * GET /api/salaires
 */
const getAll = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.idPers !== undefined) filters.idPers = parseInt(req.query.idPers);
  if (req.query.idAca !== undefined) filters.idAca = parseInt(req.query.idAca);
  if (req.query.mois !== undefined) filters.mois = parseInt(req.query.mois);

  const salaires = await salaireModel.findAll(filters);
  return res.status(200).json({ total: salaires.length, salaires });
});

/**
 * GET /api/salaires/:idSalaire
 */
const getOne = asyncHandler(async (req, res) => {
  const salaire = await salaireModel.findById(parseInt(req.params.idSalaire));
  if (!salaire) {
    return res.status(404).json({ message: 'Salaire introuvable' });
  }
  return res.status(200).json({ salaire });
});

/**
 * GET /api/salaires/personne/:idPers/:idAca
 */
const getByPersonneAnnee = asyncHandler(async (req, res) => {
  const salaires = await salaireModel.findByPersonneAnnee(
    parseInt(req.params.idPers),
    parseInt(req.params.idAca)
  );
  return res.status(200).json({ total: salaires.length, salaires });
});

/**
 * GET /api/salaires/total/:idPers/:idAca
 */
const getTotal = asyncHandler(async (req, res) => {
  const total = await salaireModel.getTotalAnnuel(
    parseInt(req.params.idPers),
    parseInt(req.params.idAca)
  );
  return res.status(200).json({ idPers: req.params.idPers, idAca: req.params.idAca, total });
});

/**
 * POST /api/salaires
 */
const create = asyncHandler(async (req, res) => {
  const { montant, mois, idPers, idAca } = req.body;
  
  if (!montant || !idPers || !idAca) {
    return res.status(400).json({ message: 'montant, idPers et idAca sont obligatoires' });
  }

  if (montant <= 0) {
    return res.status(400).json({ message: 'Le montant doit être positif' });
  }

  if (mois && (mois < 1 || mois > 12)) {
    return res.status(400).json({ message: 'Le mois doit être entre 1 et 12' });
  }

  const idSalaire = await salaireModel.create({
    montant,
    mois: mois || new Date().getMonth() + 1,
    idPers,
    idAca,
    idAdmin: req.user.id,
  });

  return res.status(201).json({
    message: 'Salaire enregistré avec succès',
    idSalaire,
  });
});

/**
 * PUT /api/salaires/:idSalaire
 */
const update = asyncHandler(async (req, res) => {
  const salaire = await salaireModel.findById(parseInt(req.params.idSalaire));
  if (!salaire) {
    return res.status(404).json({ message: 'Salaire introuvable' });
  }

  if (req.body.montant !== undefined && req.body.montant <= 0) {
    return res.status(400).json({ message: 'Le montant doit être positif' });
  }

  if (req.body.mois && (req.body.mois < 1 || req.body.mois > 12)) {
    return res.status(400).json({ message: 'Le mois doit être entre 1 et 12' });
  }

  const updated = await salaireModel.update(parseInt(req.params.idSalaire), req.body);
  if (!updated) {
    return res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }

  return res.status(200).json({ message: 'Salaire mis à jour avec succès' });
});

/**
 * DELETE /api/salaires/:idSalaire
 */
const remove = asyncHandler(async (req, res) => {
  const salaire = await salaireModel.findById(parseInt(req.params.idSalaire));
  if (!salaire) {
    return res.status(404).json({ message: 'Salaire introuvable' });
  }

  const deleted = await salaireModel.remove(parseInt(req.params.idSalaire));
  if (!deleted) {
    return res.status(500).json({ message: 'Erreur lors de la suppression' });
  }

  return res.status(200).json({ message: 'Salaire supprimé avec succès' });
});

module.exports = {
  getAll,
  getOne,
  getByPersonneAnnee,
  getTotal,
  create,
  update,
  remove,
};
