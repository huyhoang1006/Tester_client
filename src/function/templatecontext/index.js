import path from 'path'
import { app } from 'electron'
import fs from 'fs'

let templateDir

if (process.env.NODE_ENV === 'development') {
  // Khi dev, lưu ở thư mục /template cùng cấp với /src
  templateDir = path.join(__dirname, '/../template')
} else {
  // Khi build, lưu cùng thư mục với database (userData/template)
  templateDir = path.join(app.getPath('userData'), 'template')
}


// Đảm bảo thư mục tồn tại
if (!fs.existsSync(templateDir)) {
  fs.mkdirSync(templateDir, { recursive: true })
}

// Lấy đường dẫn file template theo tên file
export function getTemplatePath(filename) {
  return path.join(templateDir, filename)
}

// Lấy đường dẫn thư mục template
export function getTemplateDir() {
  return templateDir
}

