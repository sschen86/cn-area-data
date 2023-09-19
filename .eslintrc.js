module.exports = {
  root: true,
  extends: ['@shushu.pro/base'],
  ignorePatterns: [
    'temp',
    'dist',
    'gh-pages',
    'node_modules',
    '**/public/**/*',
  ],
  rules: {
    'default-case': 'off',
    'consistent-return': ['warn', { treatUndefinedAsUnspecified: true }],
  },
  globals: {},
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs'],
      },
    },
  },
  overrides: [
    {
      files: ['**/build/**/*', '**/build.config.mjs'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        'import/no-unresolved': 'off',
      },
    },
  ],
};
