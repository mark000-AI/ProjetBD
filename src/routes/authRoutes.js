const express        = require('express');
const { body }       = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validate       = require('../middleware/validateMiddleware');

const router = express.Router();

/**
 * POST /api/auth/login
 * Connexion — accessible sans token
 */
router.post(
  '/login',
  [
    body('username')
      .trim()
      .notEmpty().withMessage('Le nom d\'utilisateur est requis'),
    body('password')
      .notEmpty().withMessage('Le mot de passe est requis'),
    body('userType')
      .isIn(['admin', 'personne']).withMessage('userType doit être "admin" ou "personne"'),
  ],
  validate,
  authController.login
);

/**
 * GET /api/auth/me
 * Profil de l'utilisateur connecté — token requis
 */
router.get('/me', authMiddleware, authController.me);

module.exports = router;
