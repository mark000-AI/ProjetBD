const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/models/*.js');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // We want to add `<alias>.isDelete = 0 AND ` or `<tableName>.isDelete = 0 AND ` 
  // after `WHERE `.
  // Let's find patterns like: FROM TableName [AS] alias ... WHERE
  // This is tricky. So let's do a simpler approach: 
  // Find all `SELECT ... FROM TableName [alias] ... WHERE `
  // We can use a regex to match the FROM clause to find the primary alias.

  const regex = /FROM\s+([a-zA-Z0-9_]+)(?:\s+(AS\s+)?([a-zA-Z0-9_]+))?[\s\S]*?WHERE\s/gi;
  
  content = content.replace(regex, (match, tableName, asKeyword, alias) => {
    // Only process if it's a known table to avoid messing up subqueries or wrong matches.
    const validTables = ['Admin', 'AnneeAcademique', 'Classe', 'Cours', 'Cycle', 'Discipline', 'Eleve', 'EmploiDuTemps', 'Enseignant', 'Epreuve', 'Evaluation', 'FicheEnseignant', 'Frequente', 'JourSemaine', 'Justificatifs', 'Livres', 'Messages', 'Mode', 'NatureEpreuve', 'Paiement', 'Parents', 'Personne', 'Quartier', 'Rapport', 'Residents', 'Salle', 'Scolarite', 'Session', 'Specialite', 'Titulaire', 'Tranches', 'Trimestre', 'VilleNaissance'];
    
    if (validTables.includes(tableName)) {
      const prefix = alias ? alias : tableName;
      // skip if we already added it
      if (match.includes('isDelete')) return match;
      changed = true;
      return match + `${prefix}.isDelete = 0 AND `;
    }
    return match;
  });

  // Also handle SELECT ... FROM TableName without WHERE, but before ORDER BY or LIMIT or the end of the query string.
  // This is much harder to do safely with Regex. So we'll skip it unless it's a simple query.
  const regexNoWhere = /FROM\s+([a-zA-Z0-9_]+)(?:\s+(AS\s+)?([a-zA-Z0-9_]+))?\s*(ORDER BY|LIMIT|"|`|\n|$)/gi;
  content = content.replace(regexNoWhere, (match, tableName, asKeyword, alias, suffix) => {
      const validTables = ['Admin', 'AnneeAcademique', 'Classe', 'Cours', 'Cycle', 'Discipline', 'Eleve', 'EmploiDuTemps', 'Enseignant', 'Epreuve', 'Evaluation', 'FicheEnseignant', 'Frequente', 'JourSemaine', 'Justificatifs', 'Livres', 'Messages', 'Mode', 'NatureEpreuve', 'Paiement', 'Parents', 'Personne', 'Quartier', 'Rapport', 'Residents', 'Salle', 'Scolarite', 'Session', 'Specialite', 'Titulaire', 'Tranches', 'Trimestre', 'VilleNaissance'];
      
      // We only apply this if there is NO WHERE clause in this query chunk (this is a heuristic)
      // Actually, it's too risky. Let's not do it for NoWhere.
      return match;
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
  }
}
console.log('Update SELECT completed');
