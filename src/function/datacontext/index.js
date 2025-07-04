'use strict'

import sqlite3 from 'sqlite3'
import path from 'path'
import fs from 'fs'
import { app } from 'electron'

const nameDB = 'database.db'

// Lấy đường dẫn database ở userData (nơi lưu dữ liệu người dùng)
const userDataPath = app.getPath('userData')
const userDBPath = path.join(userDataPath, nameDB)

// Đường dẫn database gốc (khi dev hoặc trong resources khi build)
let sourceDBPath
if (process.env.NODE_ENV === 'development') {
  sourceDBPath = path.join(__dirname, `/../database/${nameDB}`)
  console.log('Using development database path:', sourceDBPath)
} else {
  sourceDBPath = path.join(process.resourcesPath, 'database', nameDB)
}

// Nếu chưa có database ở userData, copy từ source vào
if (!fs.existsSync(userDBPath)) {
  fs.copyFileSync(sourceDBPath, userDBPath)
}

// Luôn mở database ở userData (production), còn development thì mở ở source
let db
if (process.env.NODE_ENV === 'development') {
  db = new sqlite3.Database(sourceDBPath)
} else {
  db = new sqlite3.Database(userDBPath)
}
db.run('PRAGMA foreign_keys=ON')

export default db
