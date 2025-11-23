const esbuild = require('esbuild');
const path = require('path');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

async function main() {
  // Build the extension client
  const clientCtx = await esbuild.context({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    format: 'cjs',
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: 'node',
    outfile: 'out/extension.js',
    external: ['vscode'],
    logLevel: 'info',
    plugins: [],
    nodePaths: [
      path.join(__dirname, 'node_modules'),
      path.join(__dirname, '../../node_modules'),
    ],
  });

  // Build the LSP server
  const serverCtx = await esbuild.context({
    entryPoints: [path.join(__dirname, '../thunderstruck-language/src/main.ts')],
    bundle: true,
    format: 'cjs',
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: 'node',
    outfile: 'out/server/main.js',
    external: [],
    logLevel: 'info',
    plugins: [],
    nodePaths: [
      path.join(__dirname, '../thunderstruck-language/node_modules'),
      path.join(__dirname, 'node_modules'),
      path.join(__dirname, '../../node_modules'),
    ],
  });

  if (watch) {
    await Promise.all([clientCtx.watch(), serverCtx.watch()]);
    console.log('Watching for changes...');
  } else {
    await Promise.all([clientCtx.rebuild(), serverCtx.rebuild()]);
    await Promise.all([clientCtx.dispose(), serverCtx.dispose()]);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
