-- Création de la table Salaire (manquante)
CREATE TABLE IF NOT EXISTS `Salaire` (
  `idSalaire` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `montant` float UNSIGNED NOT NULL DEFAULT 0,
  `mois` int UNSIGNED NOT NULL DEFAULT 1 COMMENT '1-12',
  `idPers` int UNSIGNED NOT NULL,
  `idAca` int UNSIGNED NOT NULL,
  `idAdmin` int UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idSalaire`),
  FOREIGN KEY (`idPers`) REFERENCES `Personne` (`idPers`) ON DELETE NO ACTION ON UPDATE CASCADE,
  FOREIGN KEY (`idAca`) REFERENCES `AnneeAcademique` (`idAnnee`) ON DELETE NO ACTION ON UPDATE CASCADE
);

-- Assurez-vous que la table Mode existe pour les paiements
CREATE TABLE IF NOT EXISTS `Mode` (
  `idMode` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `libelle` varchar(100) NOT NULL DEFAULT 'INDEFINI',
  `information` tinytext CHARACTER SET utf8mb4 NOT NULL,
  `actif` tinyint(1) UNSIGNED NOT NULL DEFAULT 1,
  `idFondateur` int UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idMode`)
);

-- Optionnel : Ajouter des modes de paiement standard si la table est vide
INSERT IGNORE INTO `Mode` (idMode, libelle, information, idFondateur) VALUES
(1, 'Espèce', 'Paiement en espèces', 1),
(2, 'Chèque', 'Paiement par chèque', 1),
(3, 'Virement', 'Paiement par virement bancaire', 1),
(4, 'Mobilemoney', 'Paiement par service mobile money', 1);
