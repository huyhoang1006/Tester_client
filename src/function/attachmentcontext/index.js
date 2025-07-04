import path from 'path'
import { app } from 'electron'
import fs from 'fs'

let attachmentDir

if (process.env.NODE_ENV === 'development') {
  // Khi dev, lưu ở thư mục /attachment cùng cấp với /src
  attachmentDir = path.join(__dirname, '/../attachment')
} else {
  // Khi build, lưu cùng thư mục với database (userData/attachment)
  attachmentDir = path.join(app.getPath('userData'), 'attachment')
}

// Đảm bảo thư mục tồn tại
if (!fs.existsSync(attachmentDir)) {
  fs.mkdirSync(attachmentDir, { recursive: true })
}

// Lấy đường dẫn file attachment theo tên file
export function getAttachmentPath(filename) {
  return path.join(attachmentDir, filename)
}

// Lấy đường dẫn thư mục attachment
export function getAttachmentDir() {
  return attachmentDir
}