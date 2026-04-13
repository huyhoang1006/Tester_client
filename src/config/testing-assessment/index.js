const context = require.context(
  './',        // thư mục gốc procedures
  true,        // ✅ CÓ load thư mục con
  /\.json$/    // chỉ lấy file .json
)

const testAssessmentMap = {}

context.keys().forEach((key) => {
  // key ví dụ: "./SurgeArrester/GeneralInspection.json"
  const clean = key.replace('./', '')
  const [assetType, file] = clean.split('/')
  const name = file.replace('.json', '')

  if (!testAssessmentMap[assetType]) {
    testAssessmentMap[assetType] = {}
  }

  const mod = context(key)
  testAssessmentMap[assetType][name] = mod.default || mod
})

export default testAssessmentMap