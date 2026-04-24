const express = require('express');
const { body, param } = require('express-validator');
const parentController = require('../controllers/parentController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowAdmin, allowAny } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();
router.use(authMiddleware);

// ─── Validations ─────────────────────────────────────────────
const parentValidation = [
  body('nom').trim().notEmpty().withMessage('Le nom est obligatoire')
    .isLength({ max: 255 }).withMessage('Max 255 caractères'),
  body('prenom').trim().notEmpty().withMessage('Le prénom est obligatoire')
    .isLength({ max: 255 }).withMessage('Max 255 caractères'),
  body('dateNaissance').notEmpty().withMessage('La date de naissance est obligatoire')
    .isDate().withMessage('Format invalide (YYYY-MM-DD)'),
  body('lieuNaissance').trim().notEmpty().withMessage('Le lieu de naissance est obligatoire'),
  body('mobile').optional().isLength({ max: 15 }).withMessage('Mobile max 15 caractères'),
];

const createValidation = [
  ...parentValidation,
  body('username').trim().notEmpty().withMessage('Le nom d\'utilisateur est obligatoire')
    .isLength({ min: 3, max: 100 }).withMessage('Username : 3 à 100 caractères'),
  body('password').notEmpty().withMessage('Le mot de passe est obligatoire')
    .isLength({ min: 6 }).withMessage('Minimum 6 caractères'),
  body('matricule').isInt({ min: 1 }).withMessage('matricule de l\'enfant est obligatoire'),
];

// ─── Routes ──────────────────────────────────────────────────

// GET /api/parents
router.get('/',
  allowAny({ admins: [0, 1, 2, 3], personnes: [2, 3] }),
  parentController.getAll
);

// GET /api/parents/:idPers
router.get('/:idPers',
  allowAny({ admins: [0, 1, 2, 3], personnes: [2, 3, 4] }),
  [param('idPers').isInt({ min: 1 }).withMessage('idPers invalide')],
  validate,
  parentController.getOne
);

// GET /api/parents/:idPers/enfants
router.get('/:idPers/enfants',
  allowAny({ admins: [0, 1, 2, 3], personnes: [2, 3, 4] }),
  [param('idPers').isInt({ min: 1 }).withMessage('idPers invalide')],
  validate,
  parentController.getEnfants
);

// POST /api/parents
router.post('/',
  allowAny({ admins: [0, 1, 3], personnes: [3] }),
  createValidation,
  validate,
  parentController.create
);

// POST /api/parents/:idPers/enfants
router.post('/:idPers/enfants',
  allowAny({ admins: [0, 1, 3], personnes: [3] }),
  [
    param('idPers').isInt({ min: 1 }).withMessage('idPers invalide'),
    body('matricule').isInt({ min: 1 }).withMessage('matricule invalide'),
  ],
  validate,
  parentController.addEnfant
);

// PUT /api/parents/:idPers
router.put('/:idPers',
  allowAny({ admins: [0, 1, 3], personnes: [3] }),
  [param('idPers').isInt({ min: 1 }).withMessage('idPers invalide'), ...parentValidation],
  validate,
  parentController.update
);

// PATCH /api/parents/:idPers/password
router.patch('/:idPers/password',
  allowAny({ admins: [0, 1, 3], personnes: [3] }),
  [
    param('idPers').isInt({ min: 1 }).withMessage('idPers invalide'),
    body('newPassword').notEmpty().withMessage('Le nouveau mot de passe est obligatoire')
      .isLength({ min: 6 }).withMessage('Minimum 6 caractères'),
  ],
  validate,
  parentController.updatePassword
);

// DELETE /api/parents/:idPers/enfants/:idParent
// :idParent = identifiant du LIEN dans la table Parents (visible dans GET /enfants)
router.delete('/:idPers/enfants/:idParent',
  allowAny({ admins: [0, 1, 3], personnes: [3] }),
  [
    param('idPers').isInt({ min: 1 }).withMessage('idPers invalide'),
    param('idParent').isInt({ min: 1 }).withMessage('idParent invalide'),
  ],
  validate,
  parentController.removeEnfant
);

// DELETE /api/parents/:idPers
router.delete('/:idPers',
  allowAdmin(0, 1),
  [param('idPers').isInt({ min: 1 }).withMessage('idPers invalide')],
  validate,
  parentController.remove
);

module.exports = router;