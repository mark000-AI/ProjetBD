const express = require('express');
const { body, param } = require('express-validator');
const cycleController = require('../controllers/cycleController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowAdmin, allowAny } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();
router.use(authMiddleware);

// GET /api/cycles
router.get('/',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3, 4] }),
  cycleController.getAll
);

// GET /api/cycles/:idCycle
router.get('/:idCycle',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3, 4] }),
  [param('idCycle').isInt({ min: 1 }).withMessage('ID Cycle invalide')],
  validate,
  cycleController.getOne
);

// POST /api/cycles
router.post('/',
  allowAdmin(0, 1, 2, 3),
  [
    body('libelle').trim().notEmpty().withMessage('Le libellé est obligatoire').isLength({ max: 255 }),
    body('description').optional().trim()
  ],
  validate,
  cycleController.create
);

// PUT /api/cycles/:idCycle
router.put('/:idCycle',
  allowAdmin(0, 1, 2, 3),
  [
    param('idCycle').isInt({ min: 1 }).withMessage('ID Cycle invalide'),
    body('libelle').optional().trim().notEmpty().isLength({ max: 255 }),
    body('description').optional().trim()
  ],
  validate,
  cycleController.update
);

// DELETE /api/cycles/:idCycle
router.delete('/:idCycle',
  allowAdmin(0, 1, 2),
  [param('idCycle').isInt({ min: 1 }).withMessage('ID Cycle invalide')],
  validate,
  cycleController.remove
);

module.exports = router;
