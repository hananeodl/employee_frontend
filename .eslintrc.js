module.exports = {
  root: true,
  extends: [
    require.resolve('@vercel/style-guide/eslint/node'),
    require.resolve('@vercel/style-guide/eslint/typescript'),
    require.resolve('@vercel/style-guide/eslint/browser'),
    require.resolve('@vercel/style-guide/eslint/react'),
    require.resolve('@vercel/style-guide/eslint/next'),
  ],
  parserOptions: {
    project: './tsconfig.json', // Chemin vers ton fichier tsconfig.json
  },
  rules: {
    'no-console': 'off',
    '@typescript-eslint/no-confusing-void-expression': 'off',
    '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    'import/no-default-export': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
    'import/no-extraneous-dependencies': ['error', { devDependencies: false }] // Ajout de cette ligne
  },
  settings: {
    "import/resolver": {
      typescript: {} // Permet à ESLint de reconnaître les alias TypeScript
    }
  }
};
