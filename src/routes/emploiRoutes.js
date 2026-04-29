const express = require('express');
const { body, param, query } = require('express-validator');
const emploiController = require('../controllers/emploiController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowAdmin, allowAny } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(authMiddleware);

const emploiValidation = [
  body('jour')
    .trim().notEmpty().withMessage('Le jour est obligatoire')
    .isIn(['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']).withMessage('Jour invalide'),
  body('heure')
    .trim().notEmpty().withMessage('L\'heure est obligatoire')
    .matches(/^\d{2}:\d{2}$/).withMessage('Format invalide (HH:MM)'),
  body('idClasse')
    .isInt({ min: 1 }).withMessage('idClasse doit être un entier positif'),
  body('idCours')
    .isInt({ min: 1 }).withMessage('idCours doit être un entier positif'),
];

/**
 * GET /api/emplois
 */
router.get('/',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3] }),
  emploiController.getAll
);

/**
 * GET /api/emplois/classe/:idClasse
 */
router.get('/classe/:idClasse',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3] }),
  param('idClasse').isInt({ min: 1 }).withMessage('idClasse invalide'),
  validate,
  emploiController.getByClasse
);

/**
 * GET /api/emplois/jour/:jour
 */
router.get('/jour/:jour',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3] }),
  param('jour').isIn(['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']).withMessage('Jour invalide'),
  validate,
  emploiController.getByJour
);

/**
 * GET /api/emplois/:idTemps
 */
router.get('/:idTemps',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3] }),
  param('idTemps').isInt({ min: 1 }).withMessage('idTemps invalide'),
  validate,
  emploiController.getOne
);

/**
 * POST /api/emplois
 */
router.post('/',
  allowAdmin([0, 1, 2]),
  emploiValidation,
  validate,
  emploiController.create
);

/**
 * PUT /api/emplois/:idTemps
 */
router.put('/:idTemps',
  allowAdmin([0, 1, 2]),
  param('idTemps').isInt({ min: 1 }).withMessage('idTemps invalide'),
  emploiValidation,
  validate,
  emploiController.update
);

/**
 * DELETE /api/emplois/:idTemps
 */
router.delete('/:idTemps',
  allowAdmin([0, 1]),
  param('idTemps').isInt({ min: 1 }).withMessage('idTemps invalide'),
  validate,
  emploiController.remove
);

module.exports = router;
