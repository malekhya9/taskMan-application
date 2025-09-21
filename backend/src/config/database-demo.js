const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create SQLite database for demo
const dbPath = path.join(__dirname, '../../demo.db');
const db = new sqlite3.Database(dbPath);

// Initialize database with schema
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          role TEXT CHECK(role IN ('lead', 'member')) NOT NULL,
          parent_org_id INTEGER,
          is_verified INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (parent_org_id) REFERENCES users(id)
        )
      `);

      // Tasks table
      db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          status TEXT CHECK(status IN ('backlogged', 'defined', 'in-progress', 'review', 'completed')) DEFAULT 'backlogged',
          due_date DATE,
          project_tag TEXT,
          created_by INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          archived_at DATETIME NULL,
          FOREIGN KEY (created_by) REFERENCES users(id)
        )
      `);

      // Task assignees table
      db.run(`
        CREATE TABLE IF NOT EXISTS task_assignees (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (task_id) REFERENCES tasks(id),
          FOREIGN KEY (user_id) REFERENCES users(id),
          UNIQUE(task_id, user_id)
        )
      `);

      // Task attachments table
      db.run(`
        CREATE TABLE IF NOT EXISTS task_attachments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_id INTEGER NOT NULL,
          filename TEXT NOT NULL,
          original_name TEXT NOT NULL,
          file_size INTEGER NOT NULL,
          uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (task_id) REFERENCES tasks(id)
        )
      `);

      // Task comments table
      db.run(`
        CREATE TABLE IF NOT EXISTS task_comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          content TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (task_id) REFERENCES tasks(id),
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      console.log('Demo database initialized successfully');
      resolve();
    });
  });
};

// Initialize database
initDatabase().catch(console.error);

// Export database instance with MySQL-compatible methods
module.exports = {
  execute: (query, params = []) => {
    return new Promise((resolve, reject) => {
      if (query.trim().toLowerCase().startsWith('select')) {
        db.all(query, params, (err, rows) => {
          if (err) reject(err);
          else resolve([rows]);
        });
      } else {
        db.run(query, params, function(err) {
          if (err) reject(err);
          else resolve([{ insertId: this.lastID, affectedRows: this.changes }]);
        });
      }
    });
  },
  getConnection: () => Promise.resolve(db)
};
