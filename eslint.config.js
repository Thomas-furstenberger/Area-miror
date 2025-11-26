const js = require('@eslint/js');

module.exports = [
  {
    ignores: ['node_modules', 'dist', 'build', 'POC', 'server/**', 'web/**', 'mobile/**'],
  },
  {
    files: ['eslint.config.js', '.lintstagedrc.json'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'readonly',
      },
    },
    ...js.configs.recommended,
  },
];
