module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    'eslint:recommended'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser'
  },
  rules: {
    // console.error / console.warn là log chẩn đoán có chủ đích, không phải rác:
    // đây là thứ in ra terminal của main process khi truy vấn hỏng. Chỉ còn
    // console.log mới bị cảnh báo, để danh sách warning đúng nghĩa "chỗ cần dọn".
    'no-console': process.env.NODE_ENV === 'production'
      ? ['warn', { allow: ['error', 'warn'] }]
      : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/multi-word-component-names': 0,

  }
}
