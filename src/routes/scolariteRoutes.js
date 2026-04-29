const express = require('express');
const { body, param } = require('express-validator');
const scolariteController = require('../controllers/scolariteController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowAdmin, allowAny } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(authMiddleware);

const scolariteValidation = [
  body('inscription')
    .isFloat({ min: 0 }).withMessage('L\'inscription doit être positive'),
  body('pension')
    .isFloat({ min: 0 }).withMessage('La pension doit être positive'),
  body('idCycle')
    .isInt({ min: 1 }).withMessage('idCycle doit être un entier positif'),
  body('nbreTranche')
    .optional()
    .isInt({ min: 1, max: 12 }).withMessage('Le nombre de tranches doit être entre 1 et 12'),
  body('description')
    .optional()
    .trim(),
];

/**
 * GET /api/scolarites
 */
router.get('/',
  allowAny({ admins: [0, 1, 2, 3], personnes: [2, 3] }),
  scolariteController.getAll
);

/**
 * GET /api/scolarites/cycle/:idCycle
 */
router.get('/cycle/:idCycle',
  allowAny({ admins: [0, 1, 2, 3], personnes: [2, 3] }),
  param('idCycle').isInt({ min: 1 }).withMessage('idCycle invalide'),
  validate,
  scolariteController.getByCycle
);

/**
 * GET /api/scolarites/:idScolarite
 */
router.get('/:idScolarite',
  allowAny({ admins: [0, 1, 2, 3], personnes: [2, 3] }),
  param('idScolarite').isInt({ min: 1 }).withMessage('idScolarite invalide'),
  validate,
  scolariteController.getOne
);

/**
 * POST /api/scolarites
 */
router.post('/',
  allowAdmin([0, 1]),
  scolariteValidation,
  validate,
  scolariteController.create
);

/**
 * PUT /api/scolarites/:idScolarite
 */
router.put('/:idScolarite',
  allowAdmin([0, 1]),
  param('idScolarite').isInt({ min: 1 }).withMessage('idScolarite invalide'),
  scolariteValidation,
  validate,
  scolariteController.update
);

/**
 * DELETE /api/scolarites/:idScolarite
 */
router.delete('/:idScolarite',
  allowAdmin([0, 1]),
  param('idScolarite').isInt({ min: 1 }).withMessage('idScolarite invalide'),
  validate,
  scolariteController.remove
);

module.exports = router;
