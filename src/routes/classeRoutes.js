const express = require('express');
const { body, param } = require('express-validator');
const classeController = require('../controllers/classeController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowAdmin, allowAny } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();
router.use(authMiddleware);

// GET /api/classes
router.get('/',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3, 4] }),
  classeController.getAll
);

// GET /api/classes/:idClasse
router.get('/:idClasse',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3, 4] }),
  [param('idClasse').isInt({ min: 1 }).withMessage('ID Classe invalide')],
  validate,
  classeController.getOne
);

// POST /api/classes
router.post('/',
  allowAdmin(0, 1, 2, 3),
  [
    body('libelle').trim().notEmpty().withMessage('Le libellé est obligatoire').isLength({ max: 100 }),
    body('idCycle').isInt({ min: 1 }).withMessage('L\'ID du cycle est obligatoire et doit être valide')
  ],
  validate,
  classeController.create
);

// PUT /api/classes/:idClasse
router.put('/:idClasse',
  allowAdmin(0, 1, 2, 3),
  [
    param('idClasse').isInt({ min: 1 }).withMessage('ID Classe invalide'),
    body('libelle').optional().trim().notEmpty().isLength({ max: 100 }),
    body('idCycle').optional().isInt({ min: 1 }).withMessage('L\'ID du cycle doit être valide')
  ],
  validate,
  classeController.update
);

// DELETE /api/classes/:idClasse
router.delete('/:idClasse',
  allowAdmin(0, 1, 2),
  [param('idClasse').isInt({ min: 1 }).withMessage('ID Classe invalide')],
  validate,
  classeController.remove
);

module.exports = router;
