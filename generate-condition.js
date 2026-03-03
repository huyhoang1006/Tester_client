const fs = require('fs');
const path = require('path');

// 1. Đường dẫn đích: Tạo thư mục Disconnector
const targetDir = path.join(__dirname, 'src', 'config', 'testing-condition', 'Disconnector');

// Tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 2. Mảng 7 điều kiện môi trường (Giữ nguyên y hệt)
const defaultColumns =[
  {
    "mrid": "8d2fdece-b599-4270-a3bf-d0ce2c516d02",
    "code": "top_oil_temp",
    "name": "Top oil temperature",
    "type": "analog",
    "unit": "°C"
  },
  {
    "mrid": "125850fc-5c9c-4a42-b7fd-afbca2ff2e98",
    "code": "bottom_oil_temp",
    "name": "Bottom oil temperature",
    "type": "analog",
    "unit": "°C"
  },
  {
    "mrid": "98c7ab64-dd7c-4af4-9010-08d482054574",
    "code": "winding_temp",
    "name": "Winding temperature",
    "type": "analog",
    "unit": "°C"
  },
  {
    "mrid": "3a04abe6-08d7-4a28-a595-b2bd920604c2",
    "code": "reference_temp",
    "name": "Reference temperature",
    "type": "analog",
    "unit": "°C"
  },
  {
    "mrid": "9602495b-98a4-42cd-8b2b-decba1c76578",
    "code": "ambient_temp",
    "name": "Ambient temperature",
    "type": "analog",
    "unit": "°C"
  },
  {
    "mrid": "28b61109-05a9-41f5-9da2-429d52aa4890",
    "code": "humidity",
    "name": "Humidity",
    "type": "analog",
    "unit": "%"
  },
  {
    "mrid": "7133ae02-84c1-44e4-bc66-30826abbcf80",
    "code": "weather",
    "name": "Weather",
    "type": "string"
  }
];

// 3. Danh sách 7 bài test cho Disconnector
const testList =[
  { "mrid": "636c2aa0-b919-4e0a-baca-7103c569a62f", "code": "InsulationResistance", "name": "Insulation resistance" },
  { "mrid": "2456d847-c65f-4b0b-bb34-3f90b8f971ef", "code": "ContactResistance", "name": "Contact resistance" },
  { "mrid": "a6a3b5d1-dd96-428a-a824-1c7ed5c2fea0", "code": "InsulationResMotor", "name": "Insulation resistance of motor" },
  { "mrid": "ede47d51-0630-4f85-82af-3733474a9681", "code": "DcWindingMotor", "name": "DC winding resistance of motor" },
  { "mrid": "94914852-02f6-4bf2-8e19-cf9d66ba4a1e", "code": "OperatingTest", "name": "Operating test" },
  { "mrid": "9b6edb37-df64-4e28-971b-819965d15d46", "code": "ControlCheck", "name": "Control cabinet check" },
  { "mrid": "8093b329-1054-496c-9a69-baf71d5c1d24", "code": "GeneralInspection", "name": "General inspection" }
];

// 4. Lặp qua danh sách và tạo file JSON
testList.forEach(test => {
  // Đảm bảo viết hoa chữ cái đầu (PascalCase)
  const capitalizedCode = test.code.charAt(0).toUpperCase() + test.code.slice(1);

  const fileContent = {
    testId: test.mrid,
    testCode: capitalizedCode,
    testName: test.name,
    columns: defaultColumns
  };

  const filePath = path.join(targetDir, `${capitalizedCode}.json`);
  fs.writeFileSync(filePath, JSON.stringify(fileContent, null, 2), 'utf-8');
  console.log(`[+] Đã tạo file: ${capitalizedCode}.json`);
});

// 5. Tạo file index.js import tự động
const indexContent = `const context = require.context(
  './',          // thư mục hiện tại
  false,         // không load thư mục con
  /\\.json$/      // chỉ lấy file .json
)

const disconnectorConditionMap = context.keys().reduce((acc, key) => {
  const name = key.replace('./', '').replace('.json', '')
  acc[name] = context(key)
  return acc
}, {})

export default disconnectorConditionMap;
`;

fs.writeFileSync(path.join(targetDir, 'index.js'), indexContent, 'utf-8');
console.log(`[+] Đã tạo file: index.js`);
console.log(`\n🎉 HOÀN TẤT! Đã sinh 7 file cấu hình cho Disconnector!`);