import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import * as parserVue from 'vue-eslint-parser'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    languageOptions: {
      ecmaVersion: 2020,
      parser: parserVue,
      parserOptions: {
        parser: tseslint.parser,
        sourceType: 'module',
      },
    },
    plugins: {
      vue: pluginVue,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...pluginVue.configs['vue3-essential'].rules,
      'vue/multi-word-component-names': 'off',
    },
  },
  prettier
)

