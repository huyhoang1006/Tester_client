const assert = require('assert')
const fs = require('fs')
const path = require('path')
const babel = require('@babel/core')

const source = fs.readFileSync(path.join(__dirname, '../src/utils/currentTransformerTapRows.js'), 'utf8')
const { code } = babel.transformSync(source, {
    babelrc: false,
    configFile: false,
    plugins: ['@babel/plugin-transform-modules-commonjs'],
})
const helperExports = {}
new Function('exports', code)(helperExports)
const { prepareCurrentTransformerTapRows } = helperExports

const blank = () => ({
    table: { name: '', ipn: { value: '', unit: 'A' }, isn: { value: '', unit: 'A' }, type: 'maintap' },
    classRating: { core_index: 1, rated_burden: { value: '', unit: 'VA' }, extended_burden: false },
})
const core = {
    fullTap: { table: { name: 'S1 - S2' } },
    mainTap: { data: [blank()] },
    interTap: { data: [blank()] },
}

const prepared = prepareCurrentTransformerTapRows([core])
assert.equal(prepared[0].fullTap.table.name, 'S1 - S2')
assert.deepEqual(prepared[0].mainTap.data, [])
assert.deepEqual(prepared[0].interTap.data, [])
assert.equal(core.mainTap.data.length, 1)

const entered = blank()
entered.table.ipn.value = 100
assert.throws(() => prepareCurrentTransformerTapRows([{
    ...core, mainTap: { data: [entered] },
}]), /Core 1, Main tap 1: tap name is required/)

const oldDefault = prepareCurrentTransformerTapRows([{
    ...core, mainTap: { data: [{ table: { name: ' s1 - s2 ' } }] },
}])
assert.deepEqual(oldDefault[0].mainTap.data, [])

assert.throws(() => prepareCurrentTransformerTapRows([{
    ...core, mainTap: { data: [{ table: { name: ' s1 - s2 ', ipn: { value: 100 } } }] },
}]), /Tap name "s1 - s2" is used more than once/)

const named = prepareCurrentTransformerTapRows([{
    ...core, mainTap: { data: [{ table: { name: 'S1 - S3' } }] },
}])
assert.equal(named[0].mainTap.data[0].table.name, 'S1 - S3')
console.log('Current Transformer tap payload checks passed')
