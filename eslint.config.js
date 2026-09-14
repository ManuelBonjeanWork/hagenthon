import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  // .claude contiene worktree di agent con copie complete del repo (vedi lo stesso
  // ignore in vite.config.js): senza escluderla, eslint scansiona anche quelle.
  { ignores: ['dist', '.claude'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Il progetto non adotta PropTypes in nessun componente (~12 errori con la
      // regola attiva). Tenerla attiva senza usarla ovunque è peggio che disattivarla:
      // resta off finché non si introduce una validazione delle prop vera (PropTypes o TS).
      'react/prop-types': 'off',
    },
  },
  {
    // vitest.config.js ha `globals: true`: describe/it/expect/vi sono globali veri
    // a runtime, ma eslint non lo sa e li segna no-undef senza questi globals.
    files: ['tests/**/*.{js,jsx}'],
    languageOptions: {
      globals: globals.vitest,
    },
  },
]
