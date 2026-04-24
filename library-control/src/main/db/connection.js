const Database = require("better-sqlite3");
const { app } = require("electron");
const path = require("node:path");
const fs = require("node:fs");

let db = null;

function getDatabase() {
  if (db) return db;

  const userDataPath = app.getPath("userData");
  const dbPath = path.join(userDataPath, "bibliotecario.db");
  const bundledDb = path.join(app.getAppPath(), "bibliotecario.db");

  if (!fs.existsSync(dbPath) && fs.existsSync(bundledDb)) {
    fs.copyFileSync(bundledDb, dbPath);
  }

  db = new Database(dbPath);
  return db;
}

function getDatabasePath() {
  const userDataPath = app.getPath("userData");
  return path.join(userDataPath, "bibliotecario.db");
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

function getDatabasePath() {
  return path.join(app.getPath("userData"), "bibliotecario.db");
}

function getMigrationsDir() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "migrations")
    : path.join(__dirname, "migrations");
}

function runMigrations(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL UNIQUE,
      executed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const migrationsDir = getMigrationsDir();

  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Pasta de migrations não encontrada: ${migrationsDir}`);
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  const applied = database
    .prepare("SELECT filename FROM schema_migrations")
    .all()
    .map((row) => row.filename);

  files.forEach((file) => {
    if (applied.includes(file)) return;

    const fullPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(fullPath, "utf8");

    const tx = database.transaction(() => {
      database.exec(sql);
      database
        .prepare("INSERT INTO schema_migrations (filename) VALUES (?)")
        .run(file);
    });

    tx();
  });
}

function getDatabase() {
  if (db) return db;

  const dbPath = getDatabasePath();

  db = new Database(dbPath);

  runMigrations(db);

  return db;
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getDatabase, getDatabasePath, closeDatabase, runMigrations };
