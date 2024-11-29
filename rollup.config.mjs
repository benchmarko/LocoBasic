// rollup.config.js
import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/parser.ts',  // main entry
  output: {
    file: 'dist/locobasic.js',
    format: 'umd', // "es" ECMAScript-Module
    sourcemap: true
  },
  plugins: [typescript()],
};
