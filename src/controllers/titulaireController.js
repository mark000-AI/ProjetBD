const asyncHandler = require('../utils/asyncHandler');
const titulaireModel = require('../models/titulaireModel');

/**
 * GET /api/titulaires
 */
const getAll = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.actif !== undefined) filters.actif = parseInt(req.query.actif);
  if (req.query.idSalle !== undefined) filters.idSalle = parseInt(req.query.idSalle);
  if (req.query.idAdmin !== undefined) filters.idAdmin = parseInt(req.query.idAdmin);

  const titulaires = await titulaireModel.findAll(filters);
  return res.status(200).json({ total: titulaires.length, titulaires });
});

/**
 * GET /api/titulaires/:idTitulaire
 */
const getOne = asyncHandler(async (req, res) => {
  const titulaire = await titulaireModel.findById(parseInt(req.params.idTitulaire));
  if (!titulaire) {
    return res.status(404).json({ message: 'Titulaire introuvable' });
  }
  return res.status(200).json({ titulaire });
});

/**
 * GET /api/titulaires/salle/:idSalle
 */
const getBySalle = asyncHandler(async (req, res) => {
  const titulaire = await titulaireModel.findBySalle(parseInt(req.params.idSalle));
  if (!titulaire) {
    return res.status(404).json({ message: 'Pas de titulaire pour cette salle' });
  }
  return res.status(200).json({ titulaire });
});

/**
 * POST /api/titulaires
 */
const create = asyncHandler(async (req, res) => {
  const { idPers, idSalle } = req.body;
  
  if (!idPers || !idSalle) {
    return res.status(400).json({ message: 'idPers et idSalle sont obligatoires' });
  }

  try {
    const idTitulaire = await titulaireModel.create({
      idPers,
      idSalle,
      idAdmin: req.user.id,
    });

    return res.status(201).json({
      message: 'Titulaire assigné avec succès',
      idTitulaire,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

/**
 * PUT /api/titulaires/:idTitulaire
 */
const update = asyncHandler(async (req, res) => {
  const titulaire = await titulaireModel.findById(parseInt(req.params.idTitulaire));
  if (!titulaire) {
    return res.status(404).json({ message: 'Titulaire introuvable' });
  }

  const updated = await titulaireModel.update(parseInt(req.params.idTitulaire), req.body);
  if (!updated) {
    return res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }

  return res.status(200).json({ message: 'Titulaire mis à jour avec succès' });
});

/**
 * DELETE /api/titulaires/:idTitulaire
 */
const remove = asyncHandler(async (req, res) => {
  const titulaire = await titulaireModel.findById(parseInt(req.params.idTitulaire));
  if (!titulaire) {
    return res.status(404).json({ message: 'Titulaire introuvable' });
  }

  const deleted = await titulaireModel.remove(parseInt(req.params.idTitulaire));
  if (!deleted) {
    return res.status(500).json({ message: 'Erreur lors de la suppression' });
  }

  return res.status(200).json({ message: 'Titulaire supprimé avec succès' });
});

module.exports = {
  getAll,
  getOne,
  getBySalle,
  create,
  update,
  remove,
};
