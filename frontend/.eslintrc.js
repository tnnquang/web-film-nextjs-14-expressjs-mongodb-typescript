module.exports = {
  parser: "@typescript-eslint/parser",
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  root: true,
  extends: [
  	'prettier',
  	'plugin:@typescript-eslint/recommended',
	"next/core-web-vitals"
  ],
  plugins: ["@typescript-eslint", "prettier"],
  rules: {
    "prettier/prettier": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "default-param-last": 0,
    "no-underscore-dangle": 0,
    "import/prefer-default-export": 0,
    "react/require-default-props": 0,
    "spaced-comment": 0,
    "import/no-cycle": 0,
    "no-shadow": 0,
    "jsx-a11y/click-events-have-key-events": 0,
    "jsx-a11y/control-has-associated-label": 0,
    "consistent-return": 0,
    "react/no-array-index-key": 0,
    "no-return-await": 0,
    "no-nested-ternary": 0,
    "no-param-reassign": 0,
    "jsx-a11y/label-has-associated-control": 0,
    "jsx-a11y/anchor-is-valid": 0,
    "jsx-a11y/no-noninteractive-element-to-interactive-role": 0,
    "jsx-a11y/no-noninteractive-element-interactions": 0,
    "react-hooks/exhaustive-deps": 0,
    "import/no-unresolved": 0, // turn on errors for missing imports
    "react/jsx-filename-extension": [0, { extensions: [".tsx"] }],
    "react/react-in-jsx-scope": "off",
    "react-hooks/rules-of-hooks": 1,
    "@typescript-eslint/no-var-requires":0,
    "react/jsx-props-no-spreading": [
      0,
      { html: "ignore", custom: "ignore", explicitSpread: "ignore" },
    ],
    "no-use-before-define": 0,
    "@typescript-eslint/no-use-before-define": 2,
    "import/order": 0,
    "import/extensions": 0,
    "import/newline-after-import": 0,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  settings: {
    react: {
      version: "detect",
    },
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {
        project: "./tsconfig.json",
      },
    },
  },
};
