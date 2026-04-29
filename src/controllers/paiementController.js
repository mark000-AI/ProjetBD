const asyncHandler = require('../utils/asyncHandler');
const paiementModel = require('../models/paiementModel');

/**
 * GET /api/paiements
 */
const getAll = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.matricule !== undefined) filters.matricule = parseInt(req.query.matricule);
  if (req.query.idAca !== undefined) filters.idAca = parseInt(req.query.idAca);
  if (req.query.datePaie !== undefined) filters.datePaie = req.query.datePaie;

  const paiements = await paiementModel.findAll(filters);
  return res.status(200).json({ total: paiements.length, paiements });
});

/**
 * GET /api/paiements/:idPaie
 */
const getOne = asyncHandler(async (req, res) => {
  const paiement = await paiementModel.findById(parseInt(req.params.idPaie));
  if (!paiement) {
    return res.status(404).json({ message: 'Paiement introuvable' });
  }
  return res.status(200).json({ paiement });
});

/**
 * GET /api/paiements/eleve/:matricule/:idAca
 */
const getByEleve = asyncHandler(async (req, res) => {
  const paiements = await paiementModel.findByEleve(
    parseInt(req.params.matricule),
    parseInt(req.params.idAca)
  );
  return res.status(200).json({ total: paiements.length, paiements });
});

/**
 * GET /api/paiements/total/:matricule/:idAca
 */
const getTotal = asyncHandler(async (req, res) => {
  const total = await paiementModel.getTotalPaid(
    parseInt(req.params.matricule),
    parseInt(req.params.idAca)
  );
  return res.status(200).json({ matricule: req.params.matricule, idAca: req.params.idAca, total });
});

/**
 * POST /api/paiements
 */
const create = asyncHandler(async (req, res) => {
  const { matricule, idAca, montant, comentaire, idMode, operation_ID, datePaie } = req.body;
  
  if (!matricule || !idAca || !montant) {
    return res.status(400).json({ message: 'matricule, idAca et montant sont obligatoires' });
  }

  if (montant <= 0) {
    return res.status(400).json({ message: 'Le montant doit être positif' });
  }

  const idPaie = await paiementModel.create({
    matricule,
    idAca,
    montant,
    comentaire: comentaire || '',
    idMode: idMode || 1,
    operation_ID: operation_ID || '',
    datePaie: datePaie || new Date().toISOString().split('T')[0],
    idPers: req.user.id,
  });

  return res.status(201).json({
    message: 'Paiement enregistré avec succès',
    idPaie,
  });
});

/**
 * PUT /api/paiements/:idPaie
 */
const update = asyncHandler(async (req, res) => {
  const paiement = await paiementModel.findById(parseInt(req.params.idPaie));
  if (!paiement) {
    return res.status(404).json({ message: 'Paiement introuvable' });
  }

  if (req.body.montant !== undefined && req.body.montant <= 0) {
    return res.status(400).json({ message: 'Le montant doit être positif' });
  }

  const updated = await paiementModel.update(parseInt(req.params.idPaie), req.body);
  if (!updated) {
    return res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }

  return res.status(200).json({ message: 'Paiement mis à jour avec succès' });
});

/**
 * DELETE /api/paiements/:idPaie
 */
const remove = asyncHandler(async (req, res) => {
  const paiement = await paiementModel.findById(parseInt(req.params.idPaie));
  if (!paiement) {
    return res.status(404).json({ message: 'Paiement introuvable' });
  }

  const deleted = await paiementModel.remove(parseInt(req.params.idPaie));
  if (!deleted) {
    return res.status(500).json({ message: 'Erreur lors de la suppression' });
  }

  return res.status(200).json({ message: 'Paiement supprimé avec succès' });
});

module.exports = {
  getAll,
  getOne,
  getByEleve,
  getTotal,
  create,
  update,
  remove,
};
