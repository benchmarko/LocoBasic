// rollup.config.js
import typescript from 'rollup-plugin-typescript2';

export default [
  {
  input: 'src/main.ts',  // main entry
  output: {
    file: 'dist/locobasic.js',
    format: 'umd', // "es" ECMAScript-Module
    sourcemap: true,
    name: 'locobasic',
    globals: {
      'ohm-js': 'ohmJs'
    }
  },
  plugins: [typescript()],
},
{
  input: "./src/UI/UI.ts", // main entry
  output: {
    file: "dist/locobasicUI.js",
    format: "umd", // "es" ECMAScript-Module
    sourcemap: true,
    name: "locobasicUI"
  },
  plugins: [typescript()]
}

];
