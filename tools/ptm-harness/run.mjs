const ROOT = '/sessions/loving-sleepy-archimedes/mnt/Tester_client'
const { ptmToCtJobDto } = await import(`${ROOT}/src/utils/ptm/ptmToCtJobDto.js`)
const { jobDtoToEntity } = await import(`${ROOT}/src/views/Mapping/CurrentTransformerJob/index.js`)
const fs = await import('fs')

const ptm = JSON.parse(fs.readFileSync('/tmp/hz/ptm.json', 'utf8'))
const { jobDto, curvePoints, kneePoints, skipped } = ptmToCtJobDto(ptm, 'asset-mrid-1')
console.log('jobDto: tests =', jobDto.testList.length, '| skipped =', skipped.length)
const entity = jobDtoToEntity(jobDto)
fs.writeFileSync('/tmp/hz/entity.json', JSON.stringify(entity, null, 1))
console.log('entity dung duoc. Cac mang:')
for (const k of Object.keys(entity)) {
  if (Array.isArray(entity[k])) console.log(`   ${k.padEnd(42)} ${entity[k].length}`)
}
console.log('duong cong:', Object.keys(curvePoints).length, '| diem knee:',
  Object.values(kneePoints).reduce((s,a)=>s+a.length,0))
