import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import importPlugin from 'eslint-plugin-import'

const sharedOptions = {
  ignores: ['dist/**', 'node_modules/**', 'knexfile.ts'],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    'func-style': ['error', 'expression'],
    'prefer-arrow-callback': 'error',
    'arrow-body-style': ['error', 'as-needed'],
    'prefer-const': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
    ],
    'no-empty': ['error', { allowEmptyCatch: true }],
    '@typescript-eslint/require-await': 'warn',
    'eqeqeq': ['error', 'always'],
    '@typescript-eslint/no-floating-promises': 'error',
    'import/order': ['warn']
  },
  plugins: {
    '@typescript-eslint': tseslint,
    import: importPlugin,
  },
}

export default [
  // Source code files
  {
    files: ['**/*.ts'],
    ...sharedOptions,
    languageOptions: {
      ...sharedOptions.languageOptions,
      parserOptions: {
        ...sharedOptions.languageOptions.parserOptions,
        project: './tsconfig.json',
      },
    },
  },
  /**
   * Test files are excluded from the main tsconfig to prevent them from being built,
   *  so a separate tsconfig is needed for ESLint to parse them
   */
  {
    files: ['**/*.spec.ts'],
    ...sharedOptions,
    languageOptions: {
      ...sharedOptions.languageOptions,
      parserOptions: {
        ...sharedOptions.languageOptions.parserOptions,
        project: './tsconfig.eslint.json',
      },
    },
  }
]
