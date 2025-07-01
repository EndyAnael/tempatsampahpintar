export default [
  {
    languageOptions: {
      globals: {
        importScripts: "readonly",
        firebase: "readonly",
        clients: "readonly",
        L: "readonly",
        Swal: "readonly",
        console: "readonly",
        document: "readonly",
        window: "readonly",
        require: "readonly",
        setInterval: "readonly",
        self: "readonly",
      },
      parserOptions: {
        ecmaVersion: 12,
        sourceType: "module",
      },
    },
    rules: {
      "max-len": "off",
      "no-undef": "error",
      "no-unused-vars": "warn",
      "camelcase": ["error", { properties: "always" }],
      "quotes": ["error", "double"],
      "indent": ["error", 2],
    },
  },
];
