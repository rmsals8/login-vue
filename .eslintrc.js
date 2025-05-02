module.exports = {
    root: true,
    env: {
      node: true
    },
    extends: [
      'plugin:vue/vue3-essential',
      'eslint:recommended'
    ],
    parserOptions: {
      parser: '@babel/eslint-parser',
      requireConfigFile: false, // 이 부분이 중요합니다!
      ecmaVersion: 2020
    },
    rules: {
      'vue/no-multiple-template-root': 'off', // 이 규칙 비활성화
      'vue/multi-word-component-names': 'off',
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
    }
  }