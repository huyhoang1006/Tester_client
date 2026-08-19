const ROOT = '/sessions/loving-sleepy-archimedes/mnt/Tester_client'
const mod = await import(`${ROOT}/src/function/ptm/readPtmArchive.js`)
const fs = await import('fs')
const fn = mod.readPtmArchive || mod.default?.readPtmArchive
const data = await fn('/sessions/loving-sleepy-archimedes/mnt/uploads/SAT - J2.2 CT Excitation - Phase C (1).ptm')
const ptm = data && data.data ? data.data : data
fs.writeFileSync('/tmp/hz/ptm.json', JSON.stringify(ptm))
console.log('doc xong: tests =', (ptm.tests||[]).length, '| assets =', (ptm.assets||[]).length)
