const express = require('express');
const { body, param } = require('express-validator');
const trimestreController = require('../controllers/trimestreController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowAdmin, allowAny } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(authMiddleware);

const trimestreValidation = [
  body('libelle')
    .trim().notEmpty().withMessage('Le libelle est obligatoire')
    .isLength({ max: 255 }).withMessage('Le libelle ne doit pas dépasser 255 caractères'),
  body('periode')
    .trim().notEmpty().withMessage('La période est obligatoire')
    .isLength({ max: 255 }).withMessage('La période ne doit pas dépasser 255 caractères'),
  body('idAca')
    .isInt({ min: 1 }).withMessage('idAca doit être un entier positif'),
];

/**
 * GET /api/trimestres
 */
router.get('/',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3] }),
  trimestreController.getAll
);

/**
 * GET /api/trimestres/annee/:idAca
 */
router.get('/annee/:idAca',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3] }),
  param('idAca').isInt({ min: 1 }).withMessage('idAca invalide'),
  validate,
  trimestreController.getByAnnee
);

/**
 * GET /api/trimestres/:idTrimes
 */
router.get('/:idTrimes',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3] }),
  param('idTrimes').isInt({ min: 1 }).withMessage('idTrimes invalide'),
  validate,
  trimestreController.getOne
);

/**
 * POST /api/trimestres
 */
router.post('/',
  allowAdmin([0, 1, 2]),
  trimestreValidation,
  validate,
  trimestreController.create
);

/**
 * PUT /api/trimestres/:idTrimes
 */
router.put('/:idTrimes',
  allowAdmin([0, 1, 2]),
  param('idTrimes').isInt({ min: 1 }).withMessage('idTrimes invalide'),
  trimestreValidation,
  validate,
  trimestreController.update
);

/**
 * DELETE /api/trimestres/:idTrimes
 */
router.delete('/:idTrimes',
  allowAdmin([0, 1]),
  param('idTrimes').isInt({ min: 1 }).withMessage('idTrimes invalide'),
  validate,
  trimestreController.remove
);

module.exports = router;
