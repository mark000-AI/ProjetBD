const express = require('express');
const { query } = require('express-validator');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowAdmin } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(allowAdmin([0, 1, 2]));

/**
 * GET /api/admin/dashboard
 * Tableau de bord administratif
 */
router.get('/dashboard', adminController.getDashboard);

/**
 * GET /api/admin/rapports/scolarites
 * Rapport sur les scolarités
 */
router.get('/rapports/scolarites', adminController.getRapportScolarites);

/**
 * GET /api/admin/rapports/presence
 * Rapport de présence
 */
router.get('/rapports/presence',
  [
    query('idClasse').isInt({ min: 1 }).withMessage('idClasse invalide'),
    query('idAnnee').isInt({ min: 1 }).withMessage('idAnnee invalide'),
  ],
  validate,
  adminController.getRapportPresence
);

/**
 * GET /api/admin/rapports/paiements
 * Rapport sur les paiements
 */
router.get('/rapports/paiements',
  [
    query('idAca').optional().isInt({ min: 1 }).withMessage('idAca invalide'),
    query('startDate').optional().isDate().withMessage('Format de date invalide'),
    query('endDate').optional().isDate().withMessage('Format de date invalide'),
  ],
  validate,
  adminController.getRapportPaiements
);

/**
 * GET /api/admin/rapports/salaires
 * Rapport sur les salaires
 */
router.get('/rapports/salaires',
  [
    query('idAca').optional().isInt({ min: 1 }).withMessage('idAca invalide'),
    query('mois').optional().isInt({ min: 1, max: 12 }).withMessage('Mois invalide'),
  ],
  validate,
  adminController.getRapportSalaires
);

/**
 * DELETE /api/admin/cleanup
 * Nettoyage (dev mode seulement)
 */
router.delete('/cleanup', adminController.cleanup);

module.exports = router;
