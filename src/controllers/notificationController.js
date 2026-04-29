const asyncHandler = require('../utils/asyncHandler');
const notificationModel = require('../models/notificationModel');

/**
 * GET /api/notifications
 */
const getAll = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.idParent !== undefined) filters.idParent = parseInt(req.query.idParent);
  if (req.query.type_message !== undefined) filters.type_message = parseInt(req.query.type_message);
  if (req.query.valider !== undefined) filters.valider = parseInt(req.query.valider);

  const notifications = await notificationModel.findAll(filters);
  return res.status(200).json({ total: notifications.length, notifications });
});

/**
 * GET /api/notifications/:idMessages
 */
const getOne = asyncHandler(async (req, res) => {
  const notification = await notificationModel.findById(parseInt(req.params.idMessages));
  if (!notification) {
    return res.status(404).json({ message: 'Notification introuvable' });
  }
  return res.status(200).json({ notification });
});

/**
 * GET /api/notifications/parent/:idParent
 */
const getByParent = asyncHandler(async (req, res) => {
  const notifications = await notificationModel.findByParent(parseInt(req.params.idParent));
  return res.status(200).json({ total: notifications.length, notifications });
});

/**
 * POST /api/notifications
 */
const create = asyncHandler(async (req, res) => {
  const { objet, information, type_message, idParent, AnneeAcade } = req.body;
  
  if (!objet || !information) {
    return res.status(400).json({ message: 'objet et information sont obligatoires' });
  }

  const idMessages = await notificationModel.create({
    objet,
    information,
    type_message: type_message || 0,
    idExp_Pers: req.user.id,
    idParent: idParent || null,
    AnneeAcade: AnneeAcade || '',
  });

  return res.status(201).json({
    message: 'Notification créée avec succès',
    idMessages,
  });
});

/**
 * PUT /api/notifications/:idMessages
 */
const update = asyncHandler(async (req, res) => {
  const notification = await notificationModel.findById(parseInt(req.params.idMessages));
  if (!notification) {
    return res.status(404).json({ message: 'Notification introuvable' });
  }

  const updated = await notificationModel.update(parseInt(req.params.idMessages), req.body);
  if (!updated) {
    return res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }

  return res.status(200).json({ message: 'Notification mise à jour avec succès' });
});

/**
 * PUT /api/notifications/:idMessages/validate
 */
const validate = asyncHandler(async (req, res) => {
  const notification = await notificationModel.findById(parseInt(req.params.idMessages));
  if (!notification) {
    return res.status(404).json({ message: 'Notification introuvable' });
  }

  const validated = await notificationModel.markAsValidated(parseInt(req.params.idMessages));
  if (!validated) {
    return res.status(500).json({ message: 'Erreur lors de la validation' });
  }

  return res.status(200).json({ message: 'Notification validée avec succès' });
});

/**
 * DELETE /api/notifications/:idMessages
 */
const remove = asyncHandler(async (req, res) => {
  const notification = await notificationModel.findById(parseInt(req.params.idMessages));
  if (!notification) {
    return res.status(404).json({ message: 'Notification introuvable' });
  }

  const deleted = await notificationModel.remove(parseInt(req.params.idMessages));
  if (!deleted) {
    return res.status(500).json({ message: 'Erreur lors de la suppression' });
  }

  return res.status(200).json({ message: 'Notification supprimée avec succès' });
});

module.exports = {
  getAll,
  getOne,
  getByParent,
  create,
  update,
  validate,
  remove,
};
