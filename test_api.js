const axios = require('axios');
const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Démarrage des tests API ---');
  let tokenRoot = '';

  try {
    // 1. Auth Login (Admin Root)
    console.log('1. Test Auth Login...');
    const resAuth = await axios.post(`${API_URL}/auth/login`, {
      username: 'admin',
      password: 'admin',
      userType: 'admin'
    });
    console.log('✅ Auth Login réussi');
    tokenRoot = resAuth.data.token;
  } catch (err) {
    console.error('❌ Echec Auth Login:', err.response?.data || err.message);
    return;
  }

  const config = { headers: { Authorization: `Bearer ${tokenRoot}` } };

  try {
    // 2. Création Année
    console.log('2. Création Année...');
    const resAnnee = await axios.post(`${API_URL}/annees`, {
      libelle: '2025-2026',
      periode: 'Sept 2025 - Juin 2026'
    }, config);
    console.log('✅ Année créée:', resAnnee.data.idAnnee || 'Succès');
  } catch (err) {
    console.error('❌ Echec Création Année:', err.response?.data || err.message);
  }

  try {
    // 3. Création Cycle
    console.log('3. Création Cycle...');
    const resCycle = await axios.post(`${API_URL}/cycles`, {
      libelle: 'Primaire',
      description: 'Cycle Primaire'
    }, config);
    console.log('✅ Cycle créé:', resCycle.data.idCycle || 'Succès');
  } catch (err) {
    console.error('❌ Echec Création Cycle:', err.response?.data || err.message);
  }

  try {
    // 4. Liste Élèves
    console.log('4. Récupération liste élèves...');
    const resEleves = await axios.get(`${API_URL}/eleves`, config);
    console.log('✅ Liste élèves récupérée, nombre:', resEleves.data.length);
  } catch (err) {
    console.error('❌ Echec Récupération élèves:', err.response?.data || err.message);
  }

  console.log('--- Fin des tests ---');
}

runTests();
