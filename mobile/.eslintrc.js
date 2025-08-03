module.exports = {
  root: true,
  extends: [
    '@react-native',
    'prettier'
  ],
  rules: {
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-unused-vars': 'warn',
    'no-var': 'error'
  },
  env: {
    'react-native/react-native': true
  }
}; 