const express = require('express');
const { body, param, query } = require('express-validator');
const salaireController = require('../controllers/salaireController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowAdmin, allowAny } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(authMiddleware);

const salaireValidation = [
  body('montant')
    .isFloat({ min: 0 }).withMessage('Le montant doit être positif'),
  body('idPers')
    .isInt({ min: 1 }).withMessage('idPers doit être un entier positif'),
  body('idAca')
    .isInt({ min: 1 }).withMessage('idAca doit être un entier positif'),
  body('mois')
    .optional()
    .isInt({ min: 1, max: 12 }).withMessage('Le mois doit être entre 1 et 12'),
];

/**
 * GET /api/salaires
 */
router.get('/',
  allowAdmin([0, 1, 2]),
  salaireController.getAll
);

/**
 * GET /api/salaires/personne/:idPers/:idAca
 */
router.get('/personne/:idPers/:idAca',
  allowAdmin([0, 1, 2]),
  param('idPers').isInt({ min: 1 }).withMessage('idPers invalide'),
  param('idAca').isInt({ min: 1 }).withMessage('idAca invalide'),
  validate,
  salaireController.getByPersonneAnnee
);

/**
 * GET /api/salaires/total/:idPers/:idAca
 */
router.get('/total/:idPers/:idAca',
  allowAdmin([0, 1, 2]),
  param('idPers').isInt({ min: 1 }).withMessage('idPers invalide'),
  param('idAca').isInt({ min: 1 }).withMessage('idAca invalide'),
  validate,
  salaireController.getTotal
);

/**
 * GET /api/salaires/:idSalaire
 */
router.get('/:idSalaire',
  allowAdmin([0, 1, 2]),
  param('idSalaire').isInt({ min: 1 }).withMessage('idSalaire invalide'),
  validate,
  salaireController.getOne
);

/**
 * POST /api/salaires
 */
router.post('/',
  allowAdmin([0, 1, 2]),
  salaireValidation,
  validate,
  salaireController.create
);

/**
 * PUT /api/salaires/:idSalaire
 */
router.put('/:idSalaire',
  allowAdmin([0, 1, 2]),
  param('idSalaire').isInt({ min: 1 }).withMessage('idSalaire invalide'),
  salaireValidation,
  validate,
  salaireController.update
);

/**
 * DELETE /api/salaires/:idSalaire
 */
router.delete('/:idSalaire',
  allowAdmin([0, 1]),
  param('idSalaire').isInt({ min: 1 }).withMessage('idSalaire invalide'),
  validate,
  salaireController.remove
);

module.exports = router;
