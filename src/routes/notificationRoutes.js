const express = require('express');
const { body, param } = require('express-validator');
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowAdmin, allowAny } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const { verifyOwnNotificationAccess } = require('../middleware/parentAccessMiddleware');

const router = express.Router();

router.use(authMiddleware);

const notificationValidation = [
  body('objet')
    .trim().notEmpty().withMessage('L\'objet est obligatoire')
    .isLength({ max: 255 }).withMessage('L\'objet ne doit pas dépasser 255 caractères'),
  body('information')
    .trim().notEmpty().withMessage('L\'information est obligatoire'),
  body('type_message')
    .optional()
    .isInt({ min: 0, max: 2 }).withMessage('Type de message invalide'),
];

/**
 * GET /api/notifications
 */
router.get('/',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3] }),
  notificationController.getAll
);

/**
 * GET /api/notifications/parent/:idParent
 */
router.get('/parent/:idParent',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3, 4] }),
  verifyOwnNotificationAccess,
  param('idParent').isInt({ min: 1 }).withMessage('idParent invalide'),
  validate,
  notificationController.getByParent
);

/**
 * GET /api/notifications/:idMessages
 */
router.get('/:idMessages',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3] }),
  param('idMessages').isInt({ min: 1 }).withMessage('idMessages invalide'),
  validate,
  notificationController.getOne
);

/**
 * POST /api/notifications
 */
router.post('/',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3] }),
  notificationValidation,
  validate,
  notificationController.create
);

/**
 * PUT /api/notifications/:idMessages
 */
router.put('/:idMessages',
  allowAny({ admins: [0, 1, 2, 3], personnes: [1, 2, 3] }),
  param('idMessages').isInt({ min: 1 }).withMessage('idMessages invalide'),
  [
    body('objet')
      .optional()
      .trim()
      .notEmpty().withMessage('L\'objet ne doit pas être vide')
      .isLength({ max: 255 }).withMessage('L\'objet ne doit pas dépasser 255 caractères'),
    body('information')
      .optional()
      .trim()
      .notEmpty().withMessage('L\'information ne doit pas être vide'),
  ],
  validate,
  notificationController.update
);

/**
 * PUT /api/notifications/:idMessages/validate
 */
router.put('/:idMessages/validate',
  allowAdmin([0, 1, 2]),
  param('idMessages').isInt({ min: 1 }).withMessage('idMessages invalide'),
  validate,
  notificationController.validate
);

/**
 * DELETE /api/notifications/:idMessages
 */
router.delete('/:idMessages',
  allowAdmin([0, 1]),
  param('idMessages').isInt({ min: 1 }).withMessage('idMessages invalide'),
  validate,
  notificationController.remove
);

module.exports = router;
