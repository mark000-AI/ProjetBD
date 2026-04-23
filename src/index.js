require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { mountSwagger } = require('./utils/swagger');

const app = express();

// ─── Middleware globaux ───────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Fichiers statiques (photos, reçus uploadés) ─────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── Documentation Swagger ───────────────────────────────────
mountSwagger(app);

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/authRoutes'));
app.use('/api/eleves',     require('./routes/eleveRoutes'));
app.use('/api/enseignants', require('./routes/enseignantRoutes'));
// Les prochaines routes seront ajoutées ici au fur et à mesure

// ─── Route de santé ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ─── Gestion des routes inconnues ────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// ─── Gestionnaire d'erreurs global ───────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── Démarrage ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📚 Swagger disponible sur http://localhost:${PORT}/api-docs`);
});

module.exports = app;
