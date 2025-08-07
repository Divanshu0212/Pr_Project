module.exports = {
  extends: [
    'eslint:recommended',
    '@vitejs/app'
  ],
  rules: {
    'react/prop-types': 'off',
    'no-unused-vars': ['warn', { 
      varsIgnorePattern: '^_',
      argsIgnorePattern: '^_' 
    }]
  }
};
