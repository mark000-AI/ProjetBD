const express = require('express');
const { body, param } = require('express-validator');
const coursController = require('../controllers/coursController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowAdmin, allowAny } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authMiddleware);

// Règles de validation
const coursValidation = [
  body('libelle')
    .trim().notEmpty().withMessage('Le libelle est obligatoire')
    .isLength({ max: 255 }).withMessage('Le libelle ne doit pas dépasser 255 caractères'),
  body('idClasse')
    .isInt({ min: 1 }).withMessage('idClasse doit être un entier positif'),
  body('coefficient')
    .optional()
    .isFloat({ min: 0.1 }).withMessage('Le coefficient doit être > 0'),
  body('note')
    .optional()
    .isFloat({ min: 0 }).withMessage('La note doit être >= 0'),
];

// ─── Routes ──────────────────────────────────────────────────

/**
 * GET /api/cours
 */
router.get('/',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3] }),
  coursController.getAll
);

/**
 * GET /api/cours/classe/:idClasse
 */
router.get('/classe/:idClasse',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3] }),
  param('idClasse').isInt({ min: 1 }).withMessage('idClasse invalide'),
  validate,
  coursController.getByClasse
);

/**
 * GET /api/cours/:idCours
 */
router.get('/:idCours',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3] }),
  param('idCours').isInt({ min: 1 }).withMessage('idCours invalide'),
  validate,
  coursController.getOne
);

/**
 * POST /api/cours
 */
router.post('/',
  allowAdmin([0, 1, 2]),
  coursValidation,
  validate,
  coursController.create
);

/**
 * PUT /api/cours/:idCours
 */
router.put('/:idCours',
  allowAdmin([0, 1, 2]),
  param('idCours').isInt({ min: 1 }).withMessage('idCours invalide'),
  coursValidation,
  validate,
  coursController.update
);

/**
 * DELETE /api/cours/:idCours
 */
router.delete('/:idCours',
  allowAdmin([0, 1]),
  param('idCours').isInt({ min: 1 }).withMessage('idCours invalide'),
  validate,
  coursController.remove
);

module.exports = router;
