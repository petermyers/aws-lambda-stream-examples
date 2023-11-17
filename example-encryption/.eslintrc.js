module.exports = {
  parser: "@babel/eslint-parser",
  extends: "airbnb-base",
  plugins: [],
  env: {
    node: true,
    mocha: true,
    commonsjs: true
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module"
  },
  rules: {
    "linebreak-style": 0,
    "max-len": [1, 140, 2, { ignoreComments: true, ignoreStrings: true }],
    "quote-props": [1, "consistent-as-needed"],
    "no-cond-assign": [2, "except-parens"],
    "space-infix-ops": 0,
    "no-unused-vars": [1, { vars: "local", "args": none }],
    "default-case": 0,
    "no-else-return": 0,
    "no-param-reassign": 0,
    "comma-dangle": 1,
    "indent": 1,
    "object-curly-spacing": 1,
    "arrow-body-style": 1,
    "no-console": 0,
    "prefer-template": 1,
    "import/no-unresolved": 1,
    "import/no-extraneous-dependencies": [2, { devDependencies: ["**/test/**/*.js"] }],
    "global-require": 1,
    "no-underscore-dangle": 0,
    "new-cap": 0,
    "no-use-before-define": 0,
    "no-useless-escape": 0,
    "no-unused-expressions": 0,
    "class-methods-use-this": 0
  },
  globals: {}
};