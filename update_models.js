const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/models/*.js');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace DELETE queries
  content = content.replace(/DELETE\s+FROM\s+([a-zA-Z0-9_]+)\s+WHERE/g, 'UPDATE $1 SET isDelete = 1 WHERE');

  // We need to inject isDelete = 0 into SELECT queries.
  // This is tricky using regex, let's look for "WHERE" in SELECT statements
  // A heuristic: replace 'WHERE ' with 'WHERE isDelete = 0 AND '
  // But wait! Many queries use aliases, e.g. "WHERE e.matricule = ?" or "WHERE f.idSalle = ?"
  // We can just add 'isDelete = 0' to the first WHERE clause if we know the main table, but the table might be aliased.
  // Actually, wait: the requirement says "lorsqu'il n'est pas supprimer il sera par defaut a false et quand on voudra recuperer les donnees de la charge sur le frontend on recupera ce dont le isDelete est a false".
  // So adding it directly to all `SELECT` queries might be necessary.
  // E.g.: replace `WHERE ` with `WHERE isDelete = 0 AND ` or if there is no WHERE, add it.
  // Since SQL allows `WHERE isDelete = 0` without table prefix if it's unambiguous, but with JOINs it might be ambiguous.
  // Let's not blindly replace WHERE for SELECT. I can write a safer replace logic for specific functions.
  
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Update completed');
