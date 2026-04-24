const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');
const parentModel = require('../models/parentModel');
const eleveModel = require('../models/eleveModel');

/**
 * GET /api/parents
 */
const getAll = asyncHandler(async (req, res) => {
  const parents = await parentModel.findAll();
  return res.status(200).json({ total: parents.length, parents });
});

/**
 * GET /api/parents/:idPers
 */
const getOne = asyncHandler(async (req, res) => {
  const idPers = parseInt(req.params.idPers);
  const parent = await parentModel.findById(idPers);
  if (!parent) {
    return res.status(404).json({ message: 'Parent introuvable' });
  }
  const enfants = await parentModel.findEnfantsByIdPers(idPers);
  return res.status(200).json({ parent, enfants });
});

/**
 * GET /api/parents/:idPers/enfants
 */
const getEnfants = asyncHandler(async (req, res) => {
  const idPers = parseInt(req.params.idPers);
  const parent = await parentModel.findById(idPers);
  if (!parent) {
    return res.status(404).json({ message: 'Parent introuvable' });
  }
  const enfants = await parentModel.findEnfantsByIdPers(idPers);
  return res.status(200).json({ total: enfants.length, enfants });
});

/**
 * POST /api/parents
 * Crée un parent et le lie à un élève.
 * Règle : un élève ne peut être lié qu'à un seul parent.
 */
const create = asyncHandler(async (req, res) => {
  const { username, password, matricule } = req.body;

  // 1. Vérifier que l'élève existe
  const eleve = await eleveModel.findByMatricule(parseInt(matricule));
  if (!eleve) {
    return res.status(404).json({
      message: `Élève avec matricule ${matricule} introuvable`,
    });
  }

  // 2. Vérifier que l'élève n'est pas déjà lié à un parent
  const dejaLie = await parentModel.isEnfantDejaLie(parseInt(matricule));
  if (dejaLie) {
    return res.status(409).json({
      message: `L'élève matricule ${matricule} est déjà associé à un parent`,
    });
  }

  // 3. Vérifier que le username est libre
  const taken = await parentModel.isUsernameTaken(username);
  if (taken) {
    return res.status(409).json({ message: 'Ce nom d\'utilisateur est déjà utilisé' });
  }

  // 4. Hasher le mot de passe et créer
  const hashedPassword = await bcrypt.hash(password, 10);
  const personneData = { ...req.body, password: hashedPassword, idAdmin: req.user.id };

  const { idPers } = await parentModel.create(personneData, parseInt(matricule));
  const parent = await parentModel.findById(idPers);
  const enfants = await parentModel.findEnfantsByIdPers(idPers);

  return res.status(201).json({ message: 'Parent créé avec succès', parent, enfants });
});

/**
 * POST /api/parents/:idPers/enfants
 * Ajoute un enfant supplémentaire à un parent existant.
 * Règle : l'enfant ne doit pas déjà avoir un parent.
 */
const addEnfant = asyncHandler(async (req, res) => {
  const idPers = parseInt(req.params.idPers);
  const matricule = parseInt(req.body.matricule);

  // 1. Vérifier que le parent existe
  const parent = await parentModel.findById(idPers);
  if (!parent) {
    return res.status(404).json({ message: 'Parent introuvable' });
  }

  // 2. Vérifier que l'élève existe
  const eleve = await eleveModel.findByMatricule(matricule);
  if (!eleve) {
    return res.status(404).json({
      message: `Élève avec matricule ${matricule} introuvable`,
    });
  }

  // 3. Vérifier que l'élève n'est pas déjà lié à un parent
  const dejaLie = await parentModel.isEnfantDejaLie(matricule);
  if (dejaLie) {
    return res.status(409).json({
      message: `L'élève matricule ${matricule} est déjà associé à un parent`,
    });
  }

  await parentModel.addEnfant(idPers, matricule, req.user.id);
  const enfants = await parentModel.findEnfantsByIdPers(idPers);

  return res.status(201).json({
    message: 'Enfant ajouté avec succès',
    nomEnfant: `${eleve.nom} ${eleve.prenom}`,
    totalEnfants: enfants.length,
    enfants,
  });
});

/**
 * PUT /api/parents/:idPers
 * Modifier les infos personnelles d'un parent
 */
const update = asyncHandler(async (req, res) => {
  const idPers = parseInt(req.params.idPers);

  const existing = await parentModel.findById(idPers);
  if (!existing) {
    return res.status(404).json({ message: 'Parent introuvable' });
  }

  await parentModel.updatePersonne(idPers, req.body);
  const updated = await parentModel.findById(idPers);
  return res.status(200).json({ message: 'Parent mis à jour', parent: updated });
});

/**
 * PATCH /api/parents/:idPers/password
 */
const updatePassword = asyncHandler(async (req, res) => {
  const idPers = parseInt(req.params.idPers);

  const existing = await parentModel.findById(idPers);
  if (!existing) {
    return res.status(404).json({ message: 'Parent introuvable' });
  }

  const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
  await parentModel.updatePersonne(idPers, { password: hashedPassword });

  return res.status(200).json({ message: 'Mot de passe mis à jour avec succès' });
});

/**
 * DELETE /api/parents/:idPers/enfants/:idParent
 * Supprime le lien parent-enfant identifié par idParent (ID du lien).
 * Vérifie que ce lien appartient bien au parent idPers.
 */
const removeEnfant = asyncHandler(async (req, res) => {
  const idPers = parseInt(req.params.idPers);
  const idParent = parseInt(req.params.idParent);

  // 1. Vérifier que le parent existe
  const parent = await parentModel.findById(idPers);
  if (!parent) {
    return res.status(404).json({ message: 'Parent introuvable' });
  }

  // 2. Vérifier que le lien existe ET appartient à ce parent
  const lien = await parentModel.findLienById(idParent);
  if (!lien) {
    return res.status(404).json({ message: 'Lien parent-enfant introuvable' });
  }
  if (lien.idPers !== idPers) {
    return res.status(403).json({ message: 'Ce lien n\'appartient pas à ce parent' });
  }

  await parentModel.removeEnfant(idParent);
  const enfants = await parentModel.findEnfantsByIdPers(idPers);

  return res.status(200).json({
    message: 'Lien parent-enfant supprimé avec succès',
    enfantsRestants: enfants.length,
    enfants,
  });
});

/**
 * DELETE /api/parents/:idPers
 * Suppression définitive du parent
 */
const remove = asyncHandler(async (req, res) => {
  const idPers = parseInt(req.params.idPers);

  const existing = await parentModel.findById(idPers);
  if (!existing) {
    return res.status(404).json({ message: 'Parent introuvable' });
  }

  await parentModel.remove(idPers);
  return res.status(200).json({ message: 'Parent supprimé définitivement', idPers });
});

module.exports = {
  getAll, getOne, getEnfants, create, addEnfant,
  update, updatePassword, removeEnfant, remove,
};