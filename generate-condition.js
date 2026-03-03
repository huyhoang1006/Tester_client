const fs = require('fs');
const path = require('path');

// 1. Đường dẫn đích: Tạo thư mục Transformer
const targetDir = path.join(__dirname, 'src', 'config', 'testing-condition', 'Transformer');

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

// 3. Danh sách 32 bài test cho Transformer (Đã cập nhật tên code mới nhất)
const testList =[
  { "mrid": "b228dac3-e200-49d2-a75a-03f59f7f83c4", "code": "InsulationResistance", "name": "Insulation resistance of winding" },
  { "mrid": "a28ecf87-7906-41c2-899b-ca8550571ae7", "code": "GeneralInspection", "name": "General inspection" },
  { "mrid": "811cb1cd-57d1-4572-ba18-fdb0eff907a3", "code": "RatioPrimSec", "name": "Ratio Prim/Sec" },
  { "mrid": "7eefc1db-4ceb-4ddd-92ff-5a9e662afc8e", "code": "DcWindingPrim", "name": "DC Winding resistance Prim" },
  { "mrid": "c4a3176d-c2d2-4903-932b-3fe6c6438c5b", "code": "DcWindingSec", "name": "DC Winding resistance Sec" },
  { "mrid": "512b8d7c-9d11-419c-ae1c-ac7c4b2d08e6", "code": "DcWindingTert", "name": "DC Winding resistance Tert" },
  { "mrid": "2df1cd08-5347-4776-8319-a1987918932c", "code": "MeasurementOfNoLoad", "name": "No-load Test" },
  { "mrid": "1a3f6c14-265b-486c-89ec-dcb8426ce06e", "code": "MeasurementOfShortCircuit", "name": "Short-circuit Test" },
  { "mrid": "e4863274-ac59-405a-9aeb-fc09490fe17e", "code": "EnergyEfficiency", "name": "Energy Efficiency" },
  { "mrid": "4cd34382-16cd-493a-ad1c-ed2985d1e977", "code": "InducedAcVoltageTests", "name": "Induced AC Voltage Test" },
  { "mrid": "d04ecee3-831a-47dc-8ec5-8eb3bc594cef", "code": "MeasurementOfOil", "name": "Oil breakdown voltage" },
  { "mrid": "84b45a72-5aeb-49fb-9000-5e8e6c7ab03c", "code": "DimensionWeight", "name": "Dimension Weight" },
  { "mrid": "0e78e50b-ce66-4329-9201-d795a827f962", "code": "TestingInstruments", "name": "Testing Instruments" },
  { "mrid": "ba2d3ec4-dbe6-4cf7-8542-b40299e1450f", "code": "ExcitingCurrent", "name": "Exciting current" },
  { "mrid": "4523fb4a-6733-4b08-9675-278a4c8ac7cf", "code": "SeparateSourceAc", "name": "Separate Source AC Voltage Test" },
  { "mrid": "0fa4d989-3c20-49d0-a4ce-3dc00aebc45d", "code": "WindingDfCap", "name": "Winding DF & CAP" },
  { "mrid": "f701fc13-c721-4734-9361-0da527ff8995", "code": "BushingPrimC1", "name": "Bushing Prim DF & CAP C1" },
  { "mrid": "a63922b2-9011-48b4-9760-9aebf9b5e2f7", "code": "BushingPrimC2", "name": "Bushing Prim DF & CAP C2" },
  { "mrid": "2955d8fb-251a-43cf-ae90-a1cce9ff7d68", "code": "BushingSecC1", "name": "Bushing Sec DF & CAP C1" },
  { "mrid": "c8c64f37-009e-4cab-9603-796b3be54ec6", "code": "BushingSecC2", "name": "Bushing Sec DF & CAP C2" },
  { "mrid": "8947ffa6-6abf-49a5-a35a-12f78536218c", "code": "BushingTertC1", "name": "Bushing Tert DF & CAP C1" },
  { "mrid": "5e4521e4-97d1-4c79-a55d-2f81d02e9ac6", "code": "BushingTertC2", "name": "Bushing Tert DF & CAP C2" },
  { "mrid": "bfcc1ac2-6918-40fc-97bf-fa4fe345d0ea", "code": "ShortCircuitPrimSec", "name": "Short-circuit prim-sec test" },
  { "mrid": "8edc2faa-fbb3-4012-9e36-eb87de6e162c", "code": "ShortCircuitSecTert", "name": "Short-circuit sec-tert test" },
  { "mrid": "fc1a5eab-9169-4c1a-83eb-de45cd9e9c5e", "code": "ShortCircuitPrimTert", "name": "Short-circuit prim-tert test" },
  { "mrid": "7c80ee02-9315-449b-8808-4aca4bd7b59e", "code": "Dga", "name": "DGA" },
  { "mrid": "a157af35-e965-4374-96bb-84e4b938091e", "code": "DielectricResponseAnalysis", "name": "Dielectric Respone Analysis" },
  { "mrid": "7b05583f-530e-4547-8668-93961dca99d6", "code": "InsulationResistanceYokeCore", "name": "Insulation resistance of yoke and core" },
  { "mrid": "6f418b8c-0217-4f7b-ab4d-2ab500691e3e", "code": "ShortCircuitImpedancePrim", "name": "Short-circuit impedance prim" },
  { "mrid": "2c4ce2d4-df72-40d7-b505-b51744a5b42b", "code": "ShortCircuitImpedanceSec", "name": "Short-circuit impedance sec" },
  { "mrid": "66c08a40-e4ac-4538-8f0d-808d39e2b205", "code": "ShortCircuitImpedanceTert", "name": "Short-circuit impedance tert" },
  { "mrid": "50dfbdf2-80d2-4840-bc39-e1d63c5825d2", "code": "GasChromatography", "name": "Gas Chromatography" }
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

const transformerConditionMap = context.keys().reduce((acc, key) => {
  const name = key.replace('./', '').replace('.json', '')
  acc[name] = context(key)
  return acc
}, {})

export default transformerConditionMap;
`;

fs.writeFileSync(path.join(targetDir, 'index.js'), indexContent, 'utf-8');
console.log(`[+] Đã tạo file: index.js`);
console.log(`\n🎉 HOÀN TẤT! Đã cập nhật 32 file cấu hình Transformer mới nhất!`);