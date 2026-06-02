// Verifies that public/admin/config.yml fields match src/data/homepage.json
// keys exactly (catches the "fields don't match JSON" Decap footgun).
import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';

const json = JSON.parse(readFileSync('src/data/homepage.json', 'utf8'));
const cfg = yaml.load(readFileSync('public/admin/config.yml', 'utf8'));
const fields = cfg.collections[0].files[0].fields;

let problems = 0;
const log = (s) => console.log(s);

// Map a Decap field's expected shape from a JSON value
function fieldNames(fieldList) {
  return new Set(fieldList.map((f) => f.name));
}

function check(path, value, fieldList) {
  if (!Array.isArray(fieldList)) { log(`✗ ${path}: no fields defined in config`); problems++; return; }
  const names = fieldNames(fieldList);
  const byName = Object.fromEntries(fieldList.map((f) => [f.name, f]));

  if (Array.isArray(value)) {
    // list — compare keys of representative element
    const rep = value[0] ?? {};
    if (typeof rep === 'object') {
      for (const k of Object.keys(rep)) {
        if (!names.has(k)) { log(`✗ ${path}[].${k}: missing in config`); problems++; }
      }
      for (const f of fieldList) {
        if (!(f.name in rep)) log(`• ${path}[].${f.name}: in config but not in sample data (ok if optional)`);
        else if (f.widget === 'object' || f.widget === 'list') check(`${path}[].${f.name}`, rep[f.name], f.fields);
      }
    }
    return;
  }

  if (value && typeof value === 'object') {
    for (const k of Object.keys(value)) {
      if (!names.has(k)) { log(`✗ ${path}.${k}: missing in config`); problems++; }
    }
    for (const f of fieldList) {
      if (!(f.name in value)) { log(`✗ ${path}.${f.name}: in config but not in JSON`); problems++; }
      else if (f.widget === 'object' || f.widget === 'list') check(`${path}.${f.name}`, value[f.name], f.fields);
    }
  }
}

// top level
const topNames = fieldNames(fields);
for (const k of Object.keys(json)) {
  if (!topNames.has(k)) { log(`✗ top-level "${k}": missing in config`); problems++; }
}
for (const f of fields) {
  if (!(f.name in json)) { log(`✗ top-level "${f.name}": in config but not in JSON`); problems++; }
  else check(f.name, json[f.name], f.fields);
}

log(problems === 0 ? '\n✅ All config fields match homepage.json keys.' : `\n❌ ${problems} mismatch(es) found.`);
process.exit(problems === 0 ? 0 : 1);
