const express = require('express');
const { body, param } = require('express-validator');
const paiementController = require('../controllers/paiementController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowAdmin, allowAny } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const { verifyParentChildAccess } = require('../middleware/parentAccessMiddleware');

const router = express.Router();

router.use(authMiddleware);

const paiementValidation = [
  body('matricule')
    .isInt({ min: 1 }).withMessage('matricule doit être un entier positif'),
  body('idAca')
    .isInt({ min: 1 }).withMessage('idAca doit être un entier positif'),
  body('montant')
    .isFloat({ min: 0 }).withMessage('Le montant doit être positif'),
  body('comentaire')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Le commentaire ne doit pas dépasser 255 caractères'),
  body('datePaie')
    .optional()
    .isDate().withMessage('Format de date invalide (YYYY-MM-DD)'),
];

/**
 * GET /api/paiements
 */
router.get('/',
  allowAny({ admins: [0, 1, 2, 3], personnes: [2, 3] }),
  paiementController.getAll
);

/**
 * GET /api/paiements/eleve/:matricule/:idAca
 */
router.get('/eleve/:matricule/:idAca',
  allowAny({ admins: [0, 1, 2, 3], personnes: [2, 3, 4] }),
  verifyParentChildAccess,
  param('matricule').isInt({ min: 1 }).withMessage('matricule invalide'),
  param('idAca').isInt({ min: 1 }).withMessage('idAca invalide'),
  validate,
  paiementController.getByEleve
);

/**
 * GET /api/paiements/total/:matricule/:idAca
 */
router.get('/total/:matricule/:idAca',
  allowAny({ admins: [0, 1, 2, 3], personnes: [2, 3, 4] }),
  verifyParentChildAccess,
  param('matricule').isInt({ min: 1 }).withMessage('matricule invalide'),
  param('idAca').isInt({ min: 1 }).withMessage('idAca invalide'),
  validate,
  paiementController.getTotal
);

/**
 * GET /api/paiements/:idPaie
 */
router.get('/:idPaie',
  allowAny({ admins: [0, 1, 2, 3], personnes: [2, 3] }),
  param('idPaie').isInt({ min: 1 }).withMessage('idPaie invalide'),
  validate,
  paiementController.getOne
);

/**
 * POST /api/paiements
 */
router.post('/',
  allowAny({ admins: [0, 1, 2, 3], personnes: [2, 3] }),
  paiementValidation,
  validate,
  paiementController.create
);

/**
 * PUT /api/paiements/:idPaie
 */
router.put('/:idPaie',
  allowAny({ admins: [0, 1, 2, 3], personnes: [2, 3] }),
  param('idPaie').isInt({ min: 1 }).withMessage('idPaie invalide'),
  [
    body('montant')
      .optional()
      .isFloat({ min: 0 }).withMessage('Le montant doit être positif'),
    body('datePaie')
      .optional()
      .isDate().withMessage('Format de date invalide (YYYY-MM-DD)'),
  ],
  validate,
  paiementController.update
);

/**
 * DELETE /api/paiements/:idPaie
 */
router.delete('/:idPaie',
  allowAdmin([0, 1]),
  param('idPaie').isInt({ min: 1 }).withMessage('idPaie invalide'),
  validate,
  paiementController.remove
);

module.exports = router;
