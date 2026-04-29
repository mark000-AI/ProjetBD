const express = require('express');
const { body, param } = require('express-validator');
const salleController = require('../controllers/salleController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowAdmin, allowAny } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(authMiddleware);

const salleValidation = [
  body('libelle')
    .trim().notEmpty().withMessage('Le libelle est obligatoire')
    .isLength({ max: 30 }).withMessage('Le libelle ne doit pas dépasser 30 caractères'),
  body('idClasse')
    .isInt({ min: 1 }).withMessage('idClasse doit être un entier positif'),
  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('La position ne doit pas dépasser 100 caractères'),
  body('surface')
    .optional()
    .trim()
    .isLength({ max: 30 }).withMessage('La surface ne doit pas dépasser 30 caractères'),
];

/**
 * GET /api/salles
 */
router.get('/',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3] }),
  salleController.getAll
);

/**
 * GET /api/salles/classe/:idClasse
 */
router.get('/classe/:idClasse',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3] }),
  param('idClasse').isInt({ min: 1 }).withMessage('idClasse invalide'),
  validate,
  salleController.getByClasse
);

/**
 * GET /api/salles/:idSalle
 */
router.get('/:idSalle',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3] }),
  param('idSalle').isInt({ min: 1 }).withMessage('idSalle invalide'),
  validate,
  salleController.getOne
);

/**
 * POST /api/salles
 */
router.post('/',
  allowAdmin([0, 1, 2]),
  salleValidation,
  validate,
  salleController.create
);

/**
 * PUT /api/salles/:idSalle
 */
router.put('/:idSalle',
  allowAdmin([0, 1, 2]),
  param('idSalle').isInt({ min: 1 }).withMessage('idSalle invalide'),
  salleValidation,
  validate,
  salleController.update
);

/**
 * DELETE /api/salles/:idSalle
 */
router.delete('/:idSalle',
  allowAdmin([0, 1]),
  param('idSalle').isInt({ min: 1 }).withMessage('idSalle invalide'),
  validate,
  salleController.remove
);

module.exports = router;
