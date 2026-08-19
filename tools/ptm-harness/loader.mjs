import { fileURLToPath, pathToFileURL } from 'url'
import fs from 'fs'
import path from 'path'
const ROOT = '/sessions/loving-sleepy-archimedes/mnt/Tester_client'

const tryFile = (p) => {
  for (const c of [p, p + '.js', p + '.json', path.join(p, 'index.js'), path.join(p, 'index.json')])
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c
  return null
}

export async function resolve(specifier, context, next) {
  // Goi `uuid` co wrapper.mjs hong khi chay ESM thuan — thay bang ban sinh id don gian.
  if (specifier === 'uuid') return { url: pathToFileURL('/tmp/hz/uuid-shim.mjs').href, shortCircuit: true, format: 'module' }
  let spec = specifier
  if (spec.startsWith('@/')) spec = path.join(ROOT, 'src', spec.slice(2))
  else if (spec.startsWith('.') && context.parentURL && context.parentURL.startsWith('file:'))
    spec = path.resolve(path.dirname(fileURLToPath(context.parentURL)), spec)
  else return next(specifier, context)
  const f = tryFile(spec)
  if (!f) return next(specifier, context)
  return { url: pathToFileURL(f).href, shortCircuit: true,
           format: f.endsWith('.json') ? 'json' : 'module' }
}

export async function load(url, context, next) {
  if (url.startsWith('file:') && url.endsWith('.json'))
    return { format: 'json', source: fs.readFileSync(fileURLToPath(url), 'utf8'), shortCircuit: true }
  // uuid/wrapper.mjs cua thu vien tu import ban CJS — de node xu ly theo cach cua no,
  // dung ep sang module.
  if (url.includes('/node_modules/')) return next(url, context)
  if (url.startsWith('file:') && url.endsWith('.js')) {
    const file = fileURLToPath(url)
    let src = fs.readFileSync(file, 'utf8')
    // `require.context` la tinh nang RIENG cua webpack. Thay bang mot ham doc thu muc
    // that, giu nguyen giao dien .keys()/context(key) ma code dang dung.
    if (src.includes('require.context')) {
      // Lời gọi trải trên nhiều dòng và có chú thích cuối dòng, nên không bắt bằng một
      // regex phẳng được. Cắt theo cặp ngoặc cân bằng rồi mới đọc ba tham số.
      let at
      while ((at = src.indexOf('require.context(')) >= 0) {
        let i = at + 'require.context('.length, depth = 1
        while (i < src.length && depth > 0) {
          if (src[i] === '(') depth++
          else if (src[i] === ')') depth--
          i++
        }
        const argsRaw = src.slice(at + 'require.context('.length, i - 1)
        const args = argsRaw.replace(/\/\/[^\n]*/g, '')   // bo chu thich cuoi dong
        const dirM = args.match(/'([^']*)'|"([^"]*)"/)
        const deepM = args.match(/\b(true|false)\b/)
        // Bo CHUOI truoc khi tim regex: tham so dau la './' — dau / trong do lam
        // regex bat nham va ket qua la mot mau khong khop gi, thu muc ra rong.
        const argsNoStr = args.replace(/'[^']*'|"[^"]*"/g, '')
        const rxM = argsNoStr.match(/\/((?:[^/\\]|\\.)+)\//)
        const dir = path.resolve(path.dirname(file), (dirM && (dirM[1] || dirM[2])) || './')
        const deep = deepM ? deepM[1] : 'false'
        const rx = rxM ? rxM[1] : '.*'
        src = src.slice(0, at) + `__ctx(${JSON.stringify(dir)}, ${deep}, ${JSON.stringify(rx)})` + src.slice(i)
      }
      src = `import { __ctx } from '/tmp/hz/ctx.mjs'\n` + src
    }
    return { format: 'module', source: src, shortCircuit: true }
  }
  return next(url, context)
}
