/** @type {import('prettier').Options} */
module.exports = {
  printWidth: 160,
  useTabs: false,
  semi: false,
  singleQuote: true,
  arrowParens: 'avoid',
  trailingComma: 'none',
  endOfLine: 'lf',
  plugins: ['@ianvs/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
  importOrder: [
    '<BUILTIN_MODULES>', // Node.js built-in modules
    '<THIRD_PARTY_MODULES>', // Imports not matched by other special words or groups.
    '^@plasmo/(.*)$',
    '^@plasmohq/(.*)$',
    '^~(.*)$',
    '^[./]'
  ]
}
