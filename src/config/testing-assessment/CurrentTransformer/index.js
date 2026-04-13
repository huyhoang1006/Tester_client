
const context = require.context(
  './',          // thư mục hiện tại
  false,         // không load thư mục con
  /\.json$/      // chỉ lấy file .json
)

const currentTransformerAssessmentMap = context.keys().reduce((acc, key) => {
  const name = key.replace('./', '').replace('.json', '')
  acc[name] = context(key)
  return acc
}, {})

export default currentTransformerAssessmentMap
