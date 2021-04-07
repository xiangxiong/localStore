import external from 'rollup-plugin-peer-deps-external';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import filesize from 'rollup-plugin-filesize';
import progress from 'rollup-plugin-progress';
import visualizer from 'rollup-plugin-visualizer';
import postcss from 'rollup-plugin-postcss';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'lib/index.js',
      format: 'es',
      sourcemap: false,
    },
  ],
  plugins: [
    // Automatically externalize peerDependencies in a rollup bundle.
    external(),

    // Prints out typescript syntactic and semantic diagnostic messages
    typescript({
      tsconfigDefaults: {
        compilerOptions: { declaration: true, jsx: 'react' },
      },
    }),

    postcss({
      minimize: true, // uses cssnano behind scene
      modules: false, // enable css modules
      extensions: ['.css', '.scss', '.sass'], // uses node-sass
    }),

    // Locate modules using the Node resolution algorithm,
    // for using third party modules in node_modules
    resolve(),

    // minifies es bundles
    terser(),

    // logs the filesize in cli when done
    filesize(),

    // Progress while building
    progress({ clearLine: false }),

    // Generates a statistics page
    visualizer({
      filename: './statistics.html',
      title: 'My Bundle',
    }),
  ],
};
