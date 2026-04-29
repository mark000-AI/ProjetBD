const express = require('express');
const { body, param } = require('express-validator');
const sessionController = require('../controllers/sessionController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowAdmin, allowAny } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(authMiddleware);

const sessionValidation = [
  body('libelle')
    .trim().notEmpty().withMessage('Le libelle est obligatoire')
    .isLength({ max: 255 }).withMessage('Le libelle ne doit pas dépasser 255 caractères'),
  body('idTrimestre')
    .isInt({ min: 1 }).withMessage('idTrimestre doit être un entier positif'),
  body('idPers')
    .isInt({ min: 1 }).withMessage('idPers doit être un entier positif'),
  body('description')
    .optional()
    .trim(),
];

/**
 * GET /api/sessions
 */
router.get('/',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3] }),
  sessionController.getAll
);

/**
 * GET /api/sessions/trimestre/:idTrimestre
 */
router.get('/trimestre/:idTrimestre',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3] }),
  param('idTrimestre').isInt({ min: 1 }).withMessage('idTrimestre invalide'),
  validate,
  sessionController.getByTrimestre
);

/**
 * GET /api/sessions/:idSession
 */
router.get('/:idSession',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3] }),
  param('idSession').isInt({ min: 1 }).withMessage('idSession invalide'),
  validate,
  sessionController.getOne
);

/**
 * POST /api/sessions
 */
router.post('/',
  allowAdmin([0, 1, 2]),
  sessionValidation,
  validate,
  sessionController.create
);

/**
 * PUT /api/sessions/:idSession
 */
router.put('/:idSession',
  allowAdmin([0, 1, 2]),
  param('idSession').isInt({ min: 1 }).withMessage('idSession invalide'),
  sessionValidation,
  validate,
  sessionController.update
);

/**
 * DELETE /api/sessions/:idSession
 */
router.delete('/:idSession',
  allowAdmin([0, 1]),
  param('idSession').isInt({ min: 1 }).withMessage('idSession invalide'),
  validate,
  sessionController.remove
);

module.exports = router;
