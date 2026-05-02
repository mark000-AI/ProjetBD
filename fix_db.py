import re
import os
import glob

sql_file = 'school_fixed.sql'
with open(sql_file, 'r', encoding='utf-8') as f:
    sql_content = f.read()

# Add isDelete to all tables
def add_is_delete(match):
    table_content = match.group(0)
    # find the last line before PRIMARY KEY or the last column
    # Usually PRIMARY KEY is there
    if 'PRIMARY KEY' in table_content:
        return re.sub(r'(PRIMARY KEY)', r'`isDelete` tinyint(1) UNSIGNED NOT NULL DEFAULT 0,\n  \1', table_content)
    else:
        return table_content

sql_content = re.sub(r'CREATE TABLE.*?\(.*?(?=\);)', add_is_delete, sql_content, flags=re.DOTALL)

# Add data_passage to Session
def add_data_passage(match):
    return re.sub(r'(PRIMARY KEY)', r'`data_passage` date NULL,\n  \1', match.group(0))

sql_content = re.sub(r'CREATE TABLE `Session`.*?(?=\);)', add_data_passage, sql_content, flags=re.DOTALL)

with open(sql_file, 'w', encoding='utf-8') as f:
    f.write(sql_content)

print("Updated school_fixed.sql")

# Now update all models
models = glob.glob('src/models/*.js')
for model in models:
    with open(model, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replace DELETE FROM with UPDATE SET isDelete = 1
    content = re.sub(r'DELETE FROM ([a-zA-Z0-9_]+) WHERE', r'UPDATE \1 SET isDelete = 1 WHERE', content)
    
    # Replace select queries to add isDelete = 0
    # This is trickier. A simple heuristic: if there's a WHERE clause in a SELECT, append ' AND isDelete = 0'
    # Actually, the user requirement says "quand on voudra recuperer les donnees ... on recupera ce dont le isDelete est a false"
    # But it might be safer to replace 'WHERE ' with 'WHERE isDelete = 0 AND ' or 'WHERE t.isDelete = 0 AND '
    # Or just add a new line after the query definition if it's dynamic.
    
    with open(model, 'w', encoding='utf-8') as f:
        f.write(content)

print("Updated DELETEs in models")
