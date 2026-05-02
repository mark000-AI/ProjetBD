require('dotenv').config();
const axios = require('axios');
const API_URL = 'http://localhost:5000/api';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateData() {
  console.log('🚀 Démarrage de la génération des données de test...');
  let token = '';

  try {
    // 1. Authentification Admin
    const resAuth = await axios.post(`${API_URL}/auth/login`, {
      username: 'admin',
      password: 'admin',
      userType: 'admin'
    });
    token = resAuth.data.token;
    console.log('✅ Connecté en tant que Admin');
  } catch (err) {
    console.error('❌ Echec Auth Login:', err.response?.data || err.message);
    return;
  }

  const config = { headers: { Authorization: `Bearer ${token}` } };

  try {
    // 2. Année Académique
    const resAnnee = await axios.post(`${API_URL}/annees`, {
      libelle: '2026-2027',
      periode: 'Sept 2026 - Juin 2027'
    }, config);
    const idAca = resAnnee.data.idAnnee || 1;
    console.log('✅ Année académique créée (ID:', idAca, ')');

    // 3. Trimestre
    const resTrim = await axios.post(`${API_URL}/trimestres`, {
      libelle: '1er Trimestre',
      periode: 'Septembre - Décembre',
      idAca: idAca
    }, config);
    console.log('✅ Trimestre créé');

    // 4. Cycles
    const resCycle1 = await axios.post(`${API_URL}/cycles`, {
      libelle: 'Maternelle',
      description: 'Cycle Maternelle'
    }, config);
    const idCycleMat = resCycle1.data.idCycle || 1;
    
    const resCycle2 = await axios.post(`${API_URL}/cycles`, {
      libelle: 'Primaire',
      description: 'Cycle Primaire'
    }, config);
    const idCyclePrim = resCycle2.data.idCycle || 2;
    console.log('✅ Cycles créés (Maternelle, Primaire)');

    // 5. Classes
    const resClasse1 = await axios.post(`${API_URL}/classes`, {
      libelle: 'Maternelle Grande Section',
      idCycle: idCycleMat
    }, config);
    const idClasseMat = resClasse1.data.idClasse || 1;

    const resClasse2 = await axios.post(`${API_URL}/classes`, {
      libelle: 'CP',
      idCycle: idCyclePrim
    }, config);
    const idClassePrim = resClasse2.data.idClasse || 2;
    console.log('✅ Classes créées (Grande Section, CP)');

    // 6. Salles
    await axios.post(`${API_URL}/salles`, { libelle: 'Salle M1', position: 'Bâtiment A', surface: '40m2', idClasse: idClasseMat }, config);
    await axios.post(`${API_URL}/salles`, { libelle: 'Salle P1', position: 'Bâtiment B', surface: '50m2', idClasse: idClassePrim }, config);
    console.log('✅ Salles créées');

    // 7. Cours
    const resCours1 = await axios.post(`${API_URL}/cours`, { libelle: 'Dessin', coefficient: 1, note: 20, idClasse: idClasseMat }, config);
    const idCoursMat = resCours1.data.idCours || 1;
    
    const resCours2 = await axios.post(`${API_URL}/cours`, { libelle: 'Mathématiques', coefficient: 3, note: 20, idClasse: idClassePrim }, config);
    const idCoursPrim = resCours2.data.idCours || 2;
    console.log('✅ Cours créés');

    const randId = Math.floor(Math.random() * 10000);
    // 8. Enseignants
    await axios.post(`${API_URL}/enseignants`, {
      nom: 'Durand', prenom: 'Sophie', dateNaissance: '1990-05-12', lieuNaissance: 'Paris',
      mobile: '0601020304', phone: '0102030405', username: `sdurand${randId}`, password: 'password123', idCours: idCoursMat
    }, config);
    await axios.post(`${API_URL}/enseignants`, {
      nom: 'Lefebvre', prenom: 'Marc', dateNaissance: '1985-08-22', lieuNaissance: 'Lyon',
      mobile: '0611223344', phone: '0112233445', username: `mlefebvre${randId}`, password: 'password123', idCours: idCoursPrim
    }, config);
    console.log('✅ Enseignants créés');

    // Insert a VilleNaissance if not exists
    const pool = require('./src/config/db');
    await pool.query('INSERT IGNORE INTO VilleNaissance (idVille, libelle) VALUES (1, "Paris")');

    // 9. Élèves
    const resEleve1 = await axios.post(`${API_URL}/eleves`, {
      nom: 'Martin', prenom: 'Léo', dateNaissance: '2021-02-14', lieuNaissance: 'Marseille', sexe: 1, idVilleNaissance: 1
    }, config);
    const matEleve1 = resEleve1.data.eleve?.matricule || 1;

    const resEleve2 = await axios.post(`${API_URL}/eleves`, {
      nom: 'Bernard', prenom: 'Emma', dateNaissance: '2019-11-05', lieuNaissance: 'Bordeaux', sexe: 0, idVilleNaissance: 1
    }, config);
    const matEleve2 = resEleve2.data.eleve?.matricule || 2;
    console.log('✅ Élèves créés');

    // 10. Parents
    await axios.post(`${API_URL}/parents`, {
      nom: 'Martin', prenom: 'Pierre', dateNaissance: '1980-01-01', lieuNaissance: 'Marseille',
      username: `pmartin${randId}`, password: 'password123', matricule: matEleve1
    }, config);

    await axios.post(`${API_URL}/parents`, {
      nom: 'Bernard', prenom: 'Marie', dateNaissance: '1982-04-10', lieuNaissance: 'Bordeaux',
      username: `mbernard${randId}`, password: 'password123', matricule: matEleve2
    }, config);
    console.log('✅ Parents créés et liés aux élèves');

    console.log('🎉 Génération des données terminée avec succès !');

  } catch (err) {
    console.error('❌ Echec lors de la génération:', err.response?.data || err.message);
  }
}

generateData();
