import fs from 'fs'
import path from 'path'
/** Bản thay cho require.context của webpack: đọc thư mục thật, đồng bộ. */
export const __ctx = (dir, deep, rxSource) => {
  const rx = new RegExp(rxSource)
  const files = []
  const walk = (d, prefix) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const rel = prefix + e.name
      if (e.isDirectory()) { if (deep) walk(path.join(d, e.name), rel + '/') }
      else if (rx.test(e.name)) files.push(rel)
    }
  }
  walk(dir, './')
  const fn = (key) => {
    const p = path.join(dir, key.replace(/^\.\//, ''))
    const raw = fs.readFileSync(p, 'utf8')
    return p.endsWith('.json') ? JSON.parse(raw) : raw
  }
  fn.keys = () => files
  return fn
}
