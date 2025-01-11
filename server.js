import express from 'express';
    import sqlite3 from 'sqlite3';
    import { open } from 'sqlite';

    const app = express();
    app.use(express.json());

    async function initDb() {
      const db = await open({
        filename: './database.db',
        driver: sqlite3.Database
      });

      await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          gender TEXT NOT NULL
        )
      `);

      return db;
    }

    initDb().then(db => {
      app.post('/save', async (req, res) => {
        const { name, gender } = req.body;
        await db.run('INSERT INTO users (name, gender) VALUES (?, ?)', [name, gender]);
        res.sendStatus(200);
      });

      app.get('/data', async (req, res) => {
        const data = await db.all('SELECT * FROM users');
        res.json(data);
      });

      app.listen(3000, () => {
        console.log('Server running on http://localhost:3000');
      });
    });
