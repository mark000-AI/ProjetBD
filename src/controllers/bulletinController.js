const asyncHandler = require('../utils/asyncHandler');
const { generateBulletin } = require('../utils/bulletinGenerator');

/**
 * POST /api/bulletins/generate/:matricule/:idSession
 * Génère et télécharge un bulletin PDF
 */
const generate = asyncHandler(async (req, res) => {
  const matricule = parseInt(req.params.matricule);
  const idSession = parseInt(req.params.idSession);

  if (!matricule || !idSession) {
    return res.status(400).json({ message: 'matricule et idSession sont obligatoires' });
  }

  try {
    const filePath = await generateBulletin(matricule, idSession);
    return res.status(200).json({
      message: 'Bulletin généré avec succès',
      filePath,
      downloadUrl: `/downloads${filePath}`,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/bulletins/download/:matricule/:idSession
 * Télécharge le bulletin PDF
 */
const download = asyncHandler(async (req, res) => {
  const matricule = parseInt(req.params.matricule);
  const idSession = parseInt(req.params.idSession);
  const path = require('path');
  const fs = require('fs');

  if (!matricule || !idSession) {
    return res.status(400).json({ message: 'matricule et idSession sont obligatoires' });
  }

  try {
    // Chercher le bulletin généré récemment
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'bulletins');
    
    if (!fs.existsSync(uploadsDir)) {
      return res.status(404).json({ message: 'Bulletin non trouvé' });
    }

    const files = fs.readdirSync(uploadsDir)
      .filter(f => f.startsWith(`bulletin_${matricule}_session${idSession}`))
      .sort((a, b) => fs.statSync(path.join(uploadsDir, b)).mtime - 
                      fs.statSync(path.join(uploadsDir, a)).mtime);

    if (files.length === 0) {
      return res.status(404).json({ message: 'Bulletin non trouvé. Générez-le d\'abord.' });
    }

    const filePath = path.join(uploadsDir, files[0]);
    return res.download(filePath, `bulletin_${matricule}.pdf`);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = {
  generate,
  download,
};
