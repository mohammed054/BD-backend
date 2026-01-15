const fs = require('fs');
const path = require('path');

const dataDir = process.env.RAILWAY_VOLUME_MOUNT_PATH || process.env.DATA_DIR || (process.env.NODE_ENV === 'production' ? '/tmp' : __dirname);
const dataPath = path.join(dataDir, 'database.json');

let data = {
  categories: [],
  items: [],
  guests: []
};

let itemIdCounter = 1000;

function loadData() {
  try {
    if (fs.existsSync(dataPath)) {
      data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      console.log('Data loaded:', { categories: data.categories.length, items: data.items.length, guests: data.guests.length });
      
      const maxItemId = data.items.reduce((max, item) => Math.max(max, item.id || 0), 0);
      itemIdCounter = Math.max(maxItemId + 1, 1000);
      console.log('Item ID counter initialized to:', itemIdCounter);
    } else {
      console.log('No data file found, creating new one');
      saveData();
    }
  } catch (err) {
    console.error('Error loading data:', err.message);
    saveData();
  }
}

function saveData() {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('Created data directory:', dataDir);
    }
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(dataPath, jsonData);
    console.log('Data saved successfully');
    console.log('Current items count:', data.items.length);
  } catch (err) {
    console.error('Error saving data:', err.message, err.stack);
  }
}

loadData();
console.log('Data storage initialized at:', dataPath);

function query(table, where = null) {
  if (table === 'categories') {
    const rows = [...data.categories].sort((a, b) => a.order_index - b.order_index);
    return where ? rows.filter(r => where(r)) : rows;
  }
  if (table === 'items') {
    return where ? data.items.filter(r => where(r)) : [...data.items];
  }
  if (table === 'guests') {
    return where ? data.guests.filter(r => where(r)) : [...data.guests].reverse();
  }
  return [];
}

function get(table, id) {
  return data[table].find(r => r.id === parseInt(id));
}

function insert(table, row) {
  const newRow = { id: itemIdCounter++, ...row };
  data[table].push(newRow);
  saveData();
  return newRow;
}

function update(table, id, updates) {
  const idx = data[table].findIndex(r => r.id === parseInt(id));
  if (idx >= 0) {
    data[table][idx] = { ...data[table][idx], ...updates };
    saveData();
    return data[table][idx];
  }
  console.log(`[DB] Item not found with id=${id} in table ${table}`);
  return null;
}

function remove(table, id) {
  const idx = data[table].findIndex(r => r.id === parseInt(id));
  if (idx >= 0) {
    const row = data[table].splice(idx, 1)[0];
    saveData();
    return row;
  }
  return null;
}

module.exports = { query, get, insert, update, remove };

