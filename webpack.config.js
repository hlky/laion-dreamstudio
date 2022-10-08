const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')

module.exports = {
  plugins: [
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],externalsPresets: { node: true },
  // externals: [
  //   nodeExternals({
  //     allowlist: [
  //       'selas/dist'
  //     ],
  //   }),
  // ],
  // resolve fallback 
  

}