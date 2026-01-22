const context = require.context(
  './',        // thư mục gốc procedures
  true,        // ✅ CÓ load thư mục con
  /\.json$/    // chỉ lấy file .json
)

const testConditionMap = {}

context.keys().forEach((key) => {
  // key ví dụ: "./SurgeArrester/GeneralInspection.json"
  const clean = key.replace('./', '')
  const [assetType, file] = clean.split('/')
  const name = file.replace('.json', '')

  if (!testConditionMap[assetType]) {
    testConditionMap[assetType] = {}
  }

  const mod = context(key)
  testConditionMap[assetType][name] = mod.default || mod
})

export default testConditionMap