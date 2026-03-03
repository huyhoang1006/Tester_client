'use strict'

// 1. ĐỔI IMPORT: Dùng thư viện sqlcipher thay vì sqlite3
import sqlite3 from '@journeyapps/sqlcipher'
import path from 'path'
import fs from 'fs'
import { app } from 'electron'

const DB_KEY = 'attester'
const nameDB = 'database.db'
// THÊM: Mật khẩu bạn đã đặt ở DB Browser
const DB_PASSWORD = 'attester'

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

// Lấy đúng đường dẫn dựa trên môi trường
const dbPath = process.env.NODE_ENV === 'development' ? sourceDBPath : userDBPath;

// 2. KHỞI TẠO DATABASE
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Lỗi khi kết nối Database:', err.message)
  } else {
    console.log('Kết nối Database thành công!')
  }
})

// 3. CUNG CẤP MẬT KHẨU VÀ CẤU HÌNH
// Sử dụng serialize để đảm bảo chạy tuần tự: Nhập mật khẩu XONG mới bật foreign_keys
db.serialize(() => {
  // Lệnh này BẮT BUỘC phải chạy đầu tiên để giải mã file
  db.run(`PRAGMA key = '${DB_PASSWORD}'`);
  
  // Sau khi giải mã thành công, thiết lập các PRAGMA khác như bình thường
  db.run('PRAGMA foreign_keys=ON');
})

export default db
