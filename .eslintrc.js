module.exports = {
  "extends": "airbnb-base",
  "plugins": [
    "import"
  ],
  "rules": {
    "arrow-body-style": 0,
    "class-methods-use-this": 0,
    "indent": ["error", 2, { "SwitchCase": 0 }],
    "linebreak-style": 0,
    "max-len": 0,
    "no-alert": 0,
    "no-await-in-loop": 0,
    "no-bitwise": 0,
    "no-console": 0,
    "no-mixed-operators": 0,
    "no-multi-spaces": 0,
    "no-restricted-syntax": 0,
    "no-underscore-dangle": 0,
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-useless-return": 0
  },
  "env": {
    "browser": true
  }
};
