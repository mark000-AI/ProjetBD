const bcrypt            = require('bcryptjs');
const asyncHandler      = require('../utils/asyncHandler');
const enseignantModel   = require('../models/enseignantModel');

/**
 * GET /api/enseignants
 * Liste tous les enseignants avec leur cours
 */
const getAll = asyncHandler(async (req, res) => {
  const enseignants = await enseignantModel.findAll();
  return res.status(200).json({ total: enseignants.length, enseignants });
});

/**
 * GET /api/enseignants/:idEnseignant
 * Détail d'un enseignant
 */
const getOne = asyncHandler(async (req, res) => {
  const enseignant = await enseignantModel.findById(parseInt(req.params.idEnseignant));
  if (!enseignant) {
    return res.status(404).json({ message: 'Enseignant introuvable' });
  }
  return res.status(200).json({ enseignant });
});

/**
 * POST /api/enseignants
 * Créer un enseignant (Personne + Enseignant en transaction)
 * Body : { nom, prenom, dateNaissance, lieuNaissance, mobile, phone,
 *           username, password, alanyaID, idCours }
 */
const create = asyncHandler(async (req, res) => {
  const {
    nom, prenom, dateNaissance, lieuNaissance,
    mobile, phone, username, password, alanyaID, idCours,
  } = req.body;

  // Vérifier que le username n'est pas déjà pris
  const taken = await enseignantModel.isUsernameTaken(username);
  if (taken) {
    return res.status(409).json({ message: 'Ce nom d\'utilisateur est déjà utilisé' });
  }

  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);

  const personneData = {
    nom, prenom, dateNaissance, lieuNaissance,
    mobile, phone, username,
    password: hashedPassword,
    alanyaID: alanyaID || null,
    idAdmin: req.user.id,
  };

  const enseignantData = {
    idCours,
    idAdmin: req.user.id,
  };

  const { idPers, idEnseignant } = await enseignantModel.create(personneData, enseignantData);
  const enseignant = await enseignantModel.findById(idEnseignant);

  return res.status(201).json({ message: 'Enseignant créé avec succès', enseignant });
});

/**
 * PUT /api/enseignants/:idEnseignant
 * Modifier les infos personnelles d'un enseignant
 * Body : { nom, prenom, dateNaissance, lieuNaissance, mobile, phone, alanyaID, idCours }
 */
const update = asyncHandler(async (req, res) => {
  const idEnseignant = parseInt(req.params.idEnseignant);

  const existing = await enseignantModel.findById(idEnseignant);
  if (!existing) {
    return res.status(404).json({ message: 'Enseignant introuvable' });
  }

  // Mettre à jour les infos Personne
  await enseignantModel.updatePersonne(existing.idPers, req.body);

  // Mettre à jour le cours si fourni
  if (req.body.idCours) {
    await enseignantModel.updateCours(idEnseignant, req.body.idCours);
  }

  const updated = await enseignantModel.findById(idEnseignant);
  return res.status(200).json({ message: 'Enseignant mis à jour', enseignant: updated });
});

/**
 * PATCH /api/enseignants/:idEnseignant/statut
 * Activer ou désactiver un enseignant
 * Body : { actif: 0 | 1 }
 */
const updateStatut = asyncHandler(async (req, res) => {
  const idEnseignant = parseInt(req.params.idEnseignant);
  const actif        = parseInt(req.body.actif);

  const existing = await enseignantModel.findById(idEnseignant);
  if (!existing) {
    return res.status(404).json({ message: 'Enseignant introuvable' });
  }

  await enseignantModel.setActif(idEnseignant, actif);
  return res.status(200).json({
    message: actif === 1 ? 'Enseignant activé' : 'Enseignant désactivé',
    idEnseignant,
    actif,
  });
});

/**
 * PATCH /api/enseignants/:idEnseignant/password
 * Changer le mot de passe d'un enseignant
 * Body : { newPassword }
 */
const updatePassword = asyncHandler(async (req, res) => {
  const idEnseignant = parseInt(req.params.idEnseignant);

  const existing = await enseignantModel.findById(idEnseignant);
  if (!existing) {
    return res.status(404).json({ message: 'Enseignant introuvable' });
  }

  const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
  await enseignantModel.updatePersonne(existing.idPers, { password: hashedPassword });

  return res.status(200).json({ message: 'Mot de passe mis à jour avec succès' });
});

/**
 * DELETE /api/enseignants/:idEnseignant
 * Suppression définitive — réservé root/admin
 */
const remove = asyncHandler(async (req, res) => {
  const idEnseignant = parseInt(req.params.idEnseignant);

  const existing = await enseignantModel.findById(idEnseignant);
  if (!existing) {
    return res.status(404).json({ message: 'Enseignant introuvable' });
  }

  await enseignantModel.remove(idEnseignant, existing.idPers);
  return res.status(200).json({ message: 'Enseignant supprimé définitivement', idEnseignant });
});

module.exports = { getAll, getOne, create, update, updateStatut, updatePassword, remove };
