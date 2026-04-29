const express = require('express');
const { body, param } = require('express-validator');
const evaluationController = require('../controllers/evaluationController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowAdmin, allowAny } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const { verifyParentChildAccess } = require('../middleware/parentAccessMiddleware');

const router = express.Router();

router.use(authMiddleware);

const evaluationValidation = [
  body('note')
    .isFloat({ min: 0, max: 20 }).withMessage('La note doit être entre 0 et 20'),
  body('appreciation')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('L\'appreciation ne doit pas dépasser 255 caractères'),
  body('matricule')
    .isInt({ min: 1 }).withMessage('matricule doit être un entier positif'),
  body('idEpreuve')
    .isInt({ min: 1 }).withMessage('idEpreuve doit être un entier positif'),
  body('idCours')
    .isInt({ min: 1 }).withMessage('idCours doit être un entier positif'),
  body('idSession')
    .isInt({ min: 1 }).withMessage('idSession doit être un entier positif'),
];

/**
 * GET /api/evaluations
 */
router.get('/',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3] }),
  evaluationController.getAll
);

/**
 * GET /api/evaluations/eleve/:matricule
 */
router.get('/eleve/:matricule',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3, 4] }),
  verifyParentChildAccess,
  param('matricule').isInt({ min: 1 }).withMessage('matricule invalide'),
  validate,
  evaluationController.getByEleve
);

/**
 * GET /api/evaluations/session-cours/:idSession/:idCours
 */
router.get('/session-cours/:idSession/:idCours',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3] }),
  param('idSession').isInt({ min: 1 }).withMessage('idSession invalide'),
  param('idCours').isInt({ min: 1 }).withMessage('idCours invalide'),
  validate,
  evaluationController.getBySessionCours
);

/**
 * GET /api/evaluations/moyenne/:matricule/:idCours/:idSession
 */
router.get('/moyenne/:matricule/:idCours/:idSession',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3, 4] }),
  verifyParentChildAccess,
  param('matricule').isInt({ min: 1 }).withMessage('matricule invalide'),
  param('idCours').isInt({ min: 1 }).withMessage('idCours invalide'),
  param('idSession').isInt({ min: 1 }).withMessage('idSession invalide'),
  validate,
  evaluationController.getMoyenne
);

/**
 * GET /api/evaluations/:idEval
 */
router.get('/:idEval',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3] }),
  param('idEval').isInt({ min: 1 }).withMessage('idEval invalide'),
  validate,
  evaluationController.getOne
);

/**
 * POST /api/evaluations
 */
router.post('/',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1] }),
  evaluationValidation,
  validate,
  evaluationController.create
);

/**
 * PUT /api/evaluations/:idEval
 */
router.put('/:idEval',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1] }),
  param('idEval').isInt({ min: 1 }).withMessage('idEval invalide'),
  [
    body('note')
      .optional()
      .isFloat({ min: 0, max: 20 }).withMessage('La note doit être entre 0 et 20'),
    body('appreciation')
      .optional()
      .trim()
      .isLength({ max: 255 }).withMessage('L\'appreciation ne doit pas dépasser 255 caractères'),
  ],
  validate,
  evaluationController.update
);

/**
 * DELETE /api/evaluations/:idEval
 */
router.delete('/:idEval',
  allowAdmin([0, 1]),
  param('idEval').isInt({ min: 1 }).withMessage('idEval invalide'),
  validate,
  evaluationController.remove
);

module.exports = router;
