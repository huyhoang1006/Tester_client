'use strict'

// 1. ĐỔI IMPORT: Dùng thư viện sqlcipher thay vì sqlite3
import sqlite3 from '@journeyapps/sqlcipher'
import path from 'path'
import fs from 'fs'
import { app } from 'electron'

const nameDB = 'database.db'
const DB_PASSWORD = 'attester'

const userDataPath = app.getPath('userData')
const userDBPath = path.join(userDataPath, nameDB)
const developmentDBPath = path.join(__dirname, `/../database/${nameDB}`)
const dbPath = process.env.NODE_ENV === 'development' ? developmentDBPath : userDBPath

fs.mkdirSync(path.dirname(dbPath), {recursive: true})

const db = new sqlite3.Database(dbPath)

// All consumers share this connection. Startup waits for this promise before
// schema initialization or IPC registration, so a fresh file is safe to use.
export const databaseReady = new Promise((resolve, reject) => {
  db.serialize(() => {
    db.run(`PRAGMA key = '${DB_PASSWORD}'`, (keyError) => {
      if (keyError) return reject(keyError)

      // Reading the header after applying the key also detects an invalid key
      // on databases created by an earlier installation.
      db.get('PRAGMA user_version', (versionError) => {
        if (versionError) return reject(versionError)

        db.run('PRAGMA foreign_keys=ON', (foreignKeyError) => {
          if (foreignKeyError) return reject(foreignKeyError)

          db.get('PRAGMA foreign_keys', (verifyError, row) => {
            if (verifyError) return reject(verifyError)
            if (!row || row.foreign_keys !== 1) {
              return reject(new Error('Could not enable SQLite foreign keys'))
            }
            resolve(db)
          })
        })
      })
    })
  })
})

export default db
