const parentModel = require('../models/parentModel');

/**
 * Middleware pour s'assurer qu'un Parent (rôle 4) ne peut accéder
 * qu'aux données de ses propres enfants.
 * Requiert la présence de 'matricule' dans params, query ou body.
 */
const verifyParentChildAccess = async (req, res, next) => {
  // Si ce n'est pas un parent, on passe (l'accès est géré par allowAny / allowAdmin)
  if (req.user?.userType !== 'personne' || req.user?.role !== 4) {
    return next();
  }

  // Recherche du matricule dans la requête
  const matricule = parseInt(req.params.matricule || req.query.matricule || req.body.matricule);
  
  if (!matricule) {
    return res.status(403).json({ message: 'Accès interdit. En tant que parent, vous devez cibler une requête liée au matricule de votre enfant.' });
  }

  try {
    const enfants = await parentModel.findEnfantsByIdPers(req.user.id);
    const isMonEnfant = enfants.some(e => e.matricule === matricule);

    if (!isMonEnfant) {
      return res.status(403).json({ message: 'Accès interdit. Les données demandées n\'appartiennent pas à votre enfant.' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la vérification des droits parentaux.' });
  }
};

/**
 * Middleware pour s'assurer qu'un Parent (rôle 4) ne peut accéder
 * qu'à son propre profil (idPers).
 */
const verifyOwnProfileAccess = (req, res, next) => {
  if (req.user?.userType !== 'personne' || req.user?.role !== 4) {
    return next();
  }

  const idPers = parseInt(req.params.idPers || req.query.idPers || req.body.idPers);
  if (idPers !== req.user.id) {
    return res.status(403).json({ message: 'Accès interdit. Vous ne pouvez consulter ou modifier que votre propre profil.' });
  }

  next();
};

/**
 * Middleware pour s'assurer qu'un Parent (rôle 4) ne peut accéder
 * qu'aux notifications liées à ses enfants (idParent).
 */
const verifyOwnNotificationAccess = async (req, res, next) => {
  if (req.user?.userType !== 'personne' || req.user?.role !== 4) {
    return next();
  }

  const idParent = parseInt(req.params.idParent || req.query.idParent || req.body.idParent);
  if (!idParent) {
    return res.status(403).json({ message: 'Accès interdit. Veuillez cibler un lien parent-enfant valide (idParent).' });
  }

  try {
    const lien = await parentModel.findLienById(idParent);
    if (!lien || lien.idPers !== req.user.id) {
      return res.status(403).json({ message: 'Accès interdit. Ce lien parent-enfant ne vous appartient pas.' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Erreur interne lors de la vérification des droits.' });
  }
};

module.exports = {
  verifyParentChildAccess,
  verifyOwnProfileAccess,
  verifyOwnNotificationAccess
};
