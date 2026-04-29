const express = require('express');
const { body, param } = require('express-validator');
const anneeController = require('../controllers/anneeController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowAdmin, allowAny } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(authMiddleware);

const anneeValidation = [
  body('libelle')
    .trim().notEmpty().withMessage('Le libelle est obligatoire')
    .isLength({ max: 200 }).withMessage('Le libelle ne doit pas dépasser 200 caractères'),
  body('periode')
    .trim().notEmpty().withMessage('La période est obligatoire')
    .isLength({ max: 255 }).withMessage('La période ne doit pas dépasser 255 caractères'),
];

/**
 * GET /api/annees
 */
router.get('/',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3] }),
  anneeController.getAll
);

/**
 * GET /api/annees/:idAnnee
 */
router.get('/:idAnnee',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3] }),
  param('idAnnee').isInt({ min: 1 }).withMessage('idAnnee invalide'),
  validate,
  anneeController.getOne
);

/**
 * POST /api/annees
 */
router.post('/',
  allowAdmin([0, 1, 2, 3]),
  anneeValidation,
  validate,
  anneeController.create
);

/**
 * PUT /api/annees/:idAnnee
 */
router.put('/:idAnnee',
  allowAdmin([0, 1, 2, 3]),
  param('idAnnee').isInt({ min: 1 }).withMessage('idAnnee invalide'),
  anneeValidation,
  validate,
  anneeController.update
);

/**
 * DELETE /api/annees/:idAnnee
 */
router.delete('/:idAnnee',
  allowAdmin([0, 1]),
  param('idAnnee').isInt({ min: 1 }).withMessage('idAnnee invalide'),
  validate,
  anneeController.remove
);

module.exports = router;
