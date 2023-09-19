const { defineConfig } = require('@shushu.pro/rollup');
const encode = require('./encode');
const rawAreaData = require('./pca-code.json');

module.exports = defineConfig({
  mode: 'production',
  env: {
    encodeText: encode(rawAreaData),
  },
  output: {
    dts: true,
    es: true,
    cjs: true,
    umd: {
      name: 'CnAreaData',
    },
  },
  browser: true,
  plugins: {
    // terser: false,
  },
  external: true,
});
