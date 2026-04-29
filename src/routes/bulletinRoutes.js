const express = require('express');
const { param } = require('express-validator');
const bulletinController = require('../controllers/bulletinController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowAny } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const { verifyParentChildAccess } = require('../middleware/parentAccessMiddleware');

const router = express.Router();

router.use(authMiddleware);

/**
 * POST /api/bulletins/generate/:matricule/:idSession
 * Génère un bulletin PDF
 */
router.post('/generate/:matricule/:idSession',
  allowAny({ admins: [0, 1, 2, 3], personnes: [2, 3] }),
  param('matricule').isInt({ min: 1 }).withMessage('matricule invalide'),
  param('idSession').isInt({ min: 1 }).withMessage('idSession invalide'),
  validate,
  bulletinController.generate
);

/**
 * GET /api/bulletins/download/:matricule/:idSession
 * Télécharge un bulletin PDF
 */
router.get('/download/:matricule/:idSession',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3, 4] }),
  verifyParentChildAccess,
  param('matricule').isInt({ min: 1 }).withMessage('matricule invalide'),
  param('idSession').isInt({ min: 1 }).withMessage('idSession invalide'),
  validate,
  bulletinController.download
);

module.exports = router;
