module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:react/recommended',
    'prettier',
    "@feature-sliced"
  ],
  plugins: ['react'],
  rules: {
    'import/no-internal-modules': ['error', {
      allow: ['next/dynamic', 'dockview/dist/styles/dockview.css']
    }],
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
  },
};
