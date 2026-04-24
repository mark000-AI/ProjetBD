const bcrypt          = require('bcryptjs');
const asyncHandler    = require('../utils/asyncHandler');
const { generateToken } = require('../utils/jwtHelper');
const adminModel      = require('../models/adminModel');
const personneModel   = require('../models/personneModel');

// Message générique pour ne pas révéler si c'est le username ou le password qui est faux
const INVALID_CREDENTIALS = 'Identifiants incorrects';

/**
 * POST /api/auth/login
 * Body : { username, password, userType: 'admin' | 'personne' }
 */
const login = asyncHandler(async (req, res) => {
  const { username, password, userType } = req.body;

  // ─── 1. Chercher l'utilisateur selon son type ─────────────
  let user = null;

  if (userType === 'admin') {
    user = await adminModel.findByUsername(username);
  } else if (userType === 'personne') {
    user = await personneModel.findByUsername(username);
  } else {
    return res.status(400).json({ message: 'userType invalide (admin | personne)' });
  }

  if (!user) {
    return res.status(401).json({ message: INVALID_CREDENTIALS });
  }

  // ─── 2. Vérifier le mot de passe ──────────────────────────
  const passwordOK = await bcrypt.compare(password, user.password);
  if (!passwordOK) {
    return res.status(401).json({ message: INVALID_CREDENTIALS });
  }

  // ─── 3. Construire le payload JWT selon le type ───────────
  let payload;
  let userData;

  if (userType === 'admin') {
    payload = {
      id:       user.ID,
      userType: 'admin',
      role:     user.typeAdmin,   // 0=root, 1=admin, 2=fondateur, 3=directeur
    };
    userData = {
      id:        user.ID,
      nom:       user.nom,
      username:  user.username,
      typeAdmin: user.typeAdmin,
      mobile:    user.mobile,
    };
  } else {
    payload = {
      id:          user.idPers,
      userType:    'personne',
      role:        user.typePersonne, // 1=enseignant, 2=admin, 3=scolarité, 4=parent
    };
    userData = {
      id:           user.idPers,
      nom:          user.nom,
      prenom:       user.prenom,
      typePersonne: user.typePersonne,
      mobile:       user.mobile,
    };
  }

  // ─── 4. Générer le token et répondre ──────────────────────
  const token = generateToken(payload);

  return res.status(200).json({
    message: 'Connexion réussie',
    token,
    user: userData,
  });
});

/**
 * GET /api/auth/me
 * Retourne les infos de l'utilisateur connecté (depuis req.user injecté par authMiddleware)
 */
const me = asyncHandler(async (req, res) => {
  const { id, userType } = req.user;

  let user;
  if (userType === 'admin') {
    user = await adminModel.findById(id);
  } else {
    user = await personneModel.findById(id);
  }

  if (!user) {
    return res.status(404).json({ message: 'Utilisateur introuvable' });
  }

  return res.status(200).json({ user });
});

module.exports = { login, me };
