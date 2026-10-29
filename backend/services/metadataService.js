import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const METADATA_FILE = path.join(DATA_DIR, 'metadata.json');

// Ensure data folder and metadata.json exist
function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(METADATA_FILE)) {
    fs.writeFileSync(METADATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readAll() {
  ensureStorage();
  try {
    const raw = fs.readFileSync(METADATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading metadata file, resetting:', err.message);
    return [];
  }
}

function writeAll(data) {
  ensureStorage();
  fs.writeFileSync(METADATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function getAllFiles() {
  return readAll();
}

export function getFileById(fileId) {
  const all = readAll();
  return all.find(f => f.fileId === fileId) || null;
}

export function saveFileRecord(record) {
  const all = readAll();
  all.unshift(record); // Prepend to show latest first
  writeAll(all);
  return record;
}

export function removeFileRecord(fileId) {
  const all = readAll();
  const filtered = all.filter(f => f.fileId !== fileId);
  writeAll(filtered);
  return filtered;
}
