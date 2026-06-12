// rollup.config.js
import esbuild from "rollup-plugin-esbuild";

export default [
  {
  input: "src/main.ts",  // main entry
  output: {
    file: "dist/locobasic.js",
    format: "umd",
    sourcemap: true,
    name: "locobasic",
    globals: {
      "ohm-js": "ohm"
    }
  },
  external: ["ohm-js"],
  plugins: [
    esbuild({
      include: /src\/.*\.ts$/,
      target: "es2020",
      tsconfig: "./src/tsconfig.json"
    })
  ]
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
    esbuild({
      include: /src\/.*\.ts$/,
      target: "es2020",
      tsconfig: "./src/UI/tsconfig.json"
    })
  ]
},
{
  input: "./src/vm/VmWorker.ts", // main entry
  output: {
    file: "dist/locoVmWorker.js",
    format: "umd",
    sourcemap: true,
    name: "locoVmWorker"
  },
  plugins: [
    esbuild({
      include: /src\/.*\.ts$/,
      target: "es2020",
      tsconfig: "./src/vm/tsconfig.json"
    })
  ]
}
];
