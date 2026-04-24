const asyncHandler = require('../utils/asyncHandler');
const eleveModel   = require('../models/eleveModel');
const path         = require('path');
const fs           = require('fs');

/**
 * GET /api/eleves
 * Liste tous les élèves. Filtres optionnels : ?actif=1 , ?idAdmin=2
 */
const getAll = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.actif  !== undefined) filters.actif  = parseInt(req.query.actif);
  if (req.query.idAdmin !== undefined) filters.idAdmin = parseInt(req.query.idAdmin);

  const eleves = await eleveModel.findAll(filters);
  return res.status(200).json({ total: eleves.length, eleves });
});

/**
 * GET /api/eleves/:matricule
 * Détail d'un élève
 */
const getOne = asyncHandler(async (req, res) => {
  const eleve = await eleveModel.findByMatricule(parseInt(req.params.matricule));
  if (!eleve) {
    return res.status(404).json({ message: 'Élève introuvable' });
  }
  return res.status(200).json({ eleve });
});

/**
 * GET /api/eleves/classe/:idClasse?idAnnee=1
 * Élèves d'une classe pour une année académique
 */
const getByClasse = asyncHandler(async (req, res) => {
  const idClasse = parseInt(req.params.idClasse);
  const idAnnee  = parseInt(req.query.idAnnee);

  if (!idAnnee) {
    return res.status(400).json({ message: 'Le paramètre idAnnee est requis' });
  }

  const eleves = await eleveModel.findByClasse(idClasse, idAnnee);
  return res.status(200).json({ total: eleves.length, eleves });
});

/**
 * POST /api/eleves
 * Créer un nouvel élève (avec photo optionnelle)
 */
const create = asyncHandler(async (req, res) => {
  const data = { ...req.body };

  // Si une photo a été uploadée, on enregistre son chemin relatif
  if (req.file) {
    data.photoURL = `/uploads/photos/${req.file.filename}`;
  }

  // L'admin qui crée l'élève = celui connecté
  data.idAdmin = req.user.id;

  const matricule = await eleveModel.create(data);
  const eleve     = await eleveModel.findByMatricule(matricule);

  return res.status(201).json({ message: 'Élève créé avec succès', eleve });
});

/**
 * PUT /api/eleves/:matricule
 * Mettre à jour un élève (avec photo optionnelle)
 */
const update = asyncHandler(async (req, res) => {
  const matricule = parseInt(req.params.matricule);

  const existing = await eleveModel.findByMatricule(matricule);
  if (!existing) {
    return res.status(404).json({ message: 'Élève introuvable' });
  }

  const data = { ...req.body };

  // Nouvelle photo uploadée → on supprime l'ancienne si elle existait
  if (req.file) {
    if (existing.photoURL && existing.photoURL !== 'INDEFINI') {
      const oldPath = path.join(__dirname, '..', '..', existing.photoURL);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    data.photoURL = `/uploads/photos/${req.file.filename}`;
  }

  const affected = await eleveModel.update(matricule, data);
  if (affected === 0) {
    return res.status(400).json({ message: 'Aucune modification effectuée' });
  }

  const updated = await eleveModel.findByMatricule(matricule);
  return res.status(200).json({ message: 'Élève mis à jour', eleve: updated });
});

/**
 * PATCH /api/eleves/:matricule/statut
 * Activer ou désactiver un élève
 * Body : { actif: 0 | 1 }
 */
const updateStatut = asyncHandler(async (req, res) => {
  const matricule = parseInt(req.params.matricule);
  const actif     = parseInt(req.body.actif);

  if (![0, 1].includes(actif)) {
    return res.status(400).json({ message: 'actif doit être 0 ou 1' });
  }

  const existing = await eleveModel.findByMatricule(matricule);
  if (!existing) {
    return res.status(404).json({ message: 'Élève introuvable' });
  }

  await eleveModel.setActif(matricule, actif);
  return res.status(200).json({
    message: actif === 1 ? 'Élève activé' : 'Élève désactivé',
    matricule,
    actif,
  });
});

/**
 * DELETE /api/eleves/:matricule
 * Suppression définitive (réservé root/admin)
 * Supprime d'abord toutes les données liées avant de supprimer l'élève
 */
const remove = asyncHandler(async (req, res) => {
  const matricule = parseInt(req.params.matricule);

  const existing = await eleveModel.findByMatricule(matricule);
  if (!existing) {
    return res.status(404).json({ message: 'Élève introuvable' });
  }

  // Supprimer la photo si elle existe
  if (existing.photoURL && existing.photoURL !== 'INDEFINI') {
    const photoPath = path.join(__dirname, '..', '..', existing.photoURL);
    if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
  }

  // Supprimer les données liées en premier (FK), puis l'élève
  await eleveModel.removeRelated(matricule);
  await eleveModel.remove(matricule);

  return res.status(200).json({ message: 'Élève supprimé définitivement', matricule });
});

module.exports = { getAll, getOne, getByClasse, create, update, updateStatut, remove };