import { type SQLiteDatabase } from "expo-sqlite"

export async function migrate(database: SQLiteDatabase) {
  await database.execAsync(`
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            password TEXT NOT NULL,
            created_at timestamp NOT NULL DEFAULT current_timestamp,
            updated_at timestamp NOT NULL DEFAULT current_timestamp
        );

        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            latitude REAL NOT NULL,        -- Ex: -22.7394
            longitude REAL NOT NULL,       -- Ex: -47.3312
            title TEXT NOT NULL,           -- Ex: "Buraco na pista", "Iluminação queimada"
            status TEXT DEFAULT 'open',    -- Ex: 'open', 'in_progress', 'resolved'
            ilink TEXT NULL,               -- Link/caminho da imagem
            observation TEXT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        `)
}