const express = require('express');
const { body, param } = require('express-validator');
const titulaireController = require('../controllers/titulaireController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowAdmin, allowAny } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(authMiddleware);

const titulaireValidation = [
  body('idPers')
    .isInt({ min: 1 }).withMessage('idPers doit être un entier positif'),
  body('idSalle')
    .isInt({ min: 1 }).withMessage('idSalle doit être un entier positif'),
];

/**
 * GET /api/titulaires
 */
router.get('/',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3] }),
  titulaireController.getAll
);

/**
 * GET /api/titulaires/salle/:idSalle
 */
router.get('/salle/:idSalle',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3] }),
  param('idSalle').isInt({ min: 1 }).withMessage('idSalle invalide'),
  validate,
  titulaireController.getBySalle
);

/**
 * GET /api/titulaires/:idTitulaire
 */
router.get('/:idTitulaire',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3] }),
  param('idTitulaire').isInt({ min: 1 }).withMessage('idTitulaire invalide'),
  validate,
  titulaireController.getOne
);

/**
 * POST /api/titulaires
 */
router.post('/',
  allowAdmin([0, 1, 2]),
  titulaireValidation,
  validate,
  titulaireController.create
);

/**
 * PUT /api/titulaires/:idTitulaire
 */
router.put('/:idTitulaire',
  allowAdmin([0, 1, 2]),
  param('idTitulaire').isInt({ min: 1 }).withMessage('idTitulaire invalide'),
  titulaireValidation,
  validate,
  titulaireController.update
);

/**
 * DELETE /api/titulaires/:idTitulaire
 */
router.delete('/:idTitulaire',
  allowAdmin([0, 1]),
  param('idTitulaire').isInt({ min: 1 }).withMessage('idTitulaire invalide'),
  validate,
  titulaireController.remove
);

module.exports = router;
