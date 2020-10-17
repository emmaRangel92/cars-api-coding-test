module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'airbnb-base',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: ['**/*spec.ts'] },
    ],
    'no-useless-constructor': 'off',
    'no-underscore-dangle': 'off',
    '@typescript-eslint/no-useless-constructor': 'error',
    'no-restriced-imports': 'off',
    'import/prefer-default-export': 'off',
    'import/extensions': 'off',
  }
};
