const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

// ─── Taille max depuis .env (défaut : 5 Mo) ──────────────────
const MAX_SIZE_MB   = parseInt(process.env.UPLOAD_MAX_SIZE_MB) || 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

// ─── Types MIME autorisés depuis .env ────────────────────────
const ALLOWED_TYPES = (process.env.UPLOAD_ALLOWED_TYPES || 'image/jpeg,image/png,image/webp,application/pdf')
  .split(',')
  .map(t => t.trim());

// ─── Filtre de type MIME ──────────────────────────────────────
const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé : ${file.mimetype}`), false);
  }
};

// ─── Helpers pour créer les dossiers destination ─────────────
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
};

// ─── Stockage : photos de profil (élèves, enseignants…) ──────
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, '..', '..', 'uploads', 'photos');
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = `photo_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, name);
  },
});

// ─── Stockage : reçus de paiement (PDF ou image) ─────────────
const reçuStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, '..', '..', 'uploads', 'recus');
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = `recu_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, name);
  },
});

// ─── Instances Multer exportées ───────────────────────────────

/** Upload d'une photo de profil — champ : "photo" */
const uploadPhoto = multer({
  storage:    photoStorage,
  fileFilter,
  limits:     { fileSize: MAX_SIZE_BYTES },
}).single('photo');

/** Upload d'un reçu de paiement — champ : "recu" */
const uploadRecu = multer({
  storage:    reçuStorage,
  fileFilter,
  limits:     { fileSize: MAX_SIZE_BYTES },
}).single('recu');

/**
 * Wrapper pour convertir les erreurs Multer en réponses JSON propres.
 * Usage : router.post('/route', handleUpload(uploadPhoto), controller)
 *
 * @param {Function} uploadFn  Instance multer (uploadPhoto ou uploadRecu)
 */
const handleUpload = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: `Fichier trop volumineux (max ${MAX_SIZE_MB} Mo)`,
        });
      }
      return res.status(400).json({ message: `Erreur upload : ${err.message}` });
    }
    // Erreur fileFilter (type non autorisé)
    return res.status(400).json({ message: err.message });
  });
};

module.exports = { uploadPhoto, uploadRecu, handleUpload };
