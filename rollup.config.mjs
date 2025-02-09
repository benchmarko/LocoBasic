// rollup.config.js
import typescript from 'rollup-plugin-typescript2';

export default [
  {
  input: 'src/main.ts',  // main entry
  output: {
    file: 'dist/locobasic.js',
    format: 'umd',
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
    format: "umd",
    sourcemap: true,
    name: "locobasicUI"
  },
  plugins: [
    typescript({
      tsconfig: "./src/UI/tsconfig.json"
    })
  ]
}

];
