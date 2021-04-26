import * as path from "path";
import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import replace from "@rollup/plugin-replace";
import dts from "rollup-plugin-dts";
import { version } from "./package.json";

const builds = {
  "umd-dev": {
    outFile: "service.js",
    format: "umd",
    mode: "development"
  },
  "umd-prod": {
    outFile: "service.prod.js",
    format: "umd",
    mode: "production"
  },
  esm: {
    outFile: "service.esm.js",
    format: "es",
    mode: "development"
  }
};

function onwarn(msg, warn) {
  if (!/Circular/.test(msg)) {
    warn(msg);
  }
}

function genConfig({ outFile, format, mode }) {
  const isProd = mode === "production";
  return {
    input: "./src/index.ts",
    output: {
      file: path.join("./dist", outFile),
      format: format,
      globals: {
        axios: "axios"
      },
      exports: "named",
      name: format === "umd" ? "Service" : undefined
    },
    external: ["axios"],
    onwarn,
    plugins: [
      typescript({
        tsconfigOverride: {
          declaration: false,
          declarationDir: null,
          emitDeclarationOnly: false
        },
        useTsconfigDeclarationDir: true
      }),
      resolve(),
      replace({
        __DEV__:
          format === "es"
            ? // preserve to be handled by bundlers
              `(process.env.NODE_ENV !== 'production')`
            : // hard coded dev/prod builds
              !isProd,
        __VERSION__: JSON.stringify(version)
      }),
      isProd && terser()
    ].filter(Boolean)
  };
}

let config = Object.keys(builds).map((key) => genConfig(builds[key]));
config.push({
  input: "typings/index.d.ts",
  output: {
    file: "dist/index.d.ts",
    format: "es"
  },
  onwarn,
  plugins: [dts()]
});

export default config;
