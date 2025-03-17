'use strict'

import sqlite3 from 'sqlite3'
import path from 'path'

const nameDB = 'database.db'
const pathDB = path.join(__dirname, `/../database/${nameDB}`)
const db = new sqlite3.Database(pathDB)
db.run('PRAGMA foreign_keys=ON')

export default db
