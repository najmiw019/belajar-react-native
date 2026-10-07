module.exports = {
  root: true,
  extends: '@react-native',
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      parserOpts: {
        plugins: ['jsx'],
      },
    },
  },
  overrides: [
    {
      files: ['src/screens/posts/index.jsx', 'src/screens/posts/Index.jsx'],
      rules: {
        'react-native/no-inline-styles': 'off',
        'react/self-closing-comp': 'off',
      },
    },
  ],
};
