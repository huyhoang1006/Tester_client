
const context = require.context(
  './',          // thư mục hiện tại
  false,         // không load thư mục con
  /\.json$/      // chỉ lấy file .json
)

const procedureDataMap = context.keys().reduce((acc, key) => {
  const name = key.replace('./', '').replace('.json', '')
  acc[name] = context(key)
  return acc
}, {})

export default procedureDataMap
