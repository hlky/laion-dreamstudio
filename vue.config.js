const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack');
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      fallback: {
        tty: require.resolve("tty-browserify"),
        util: require.resolve("util/"),
        stream: require.resolve("stream-browserify"),
        path: require.resolve("path-browserify"),
        crypto: require.resolve("crypto-browserify"),
        url: require.resolve("url/"),
        os: require.resolve("os-browserify/browser"),
        https: require.resolve("https-browserify"),
        http: require.resolve("stream-http"),
        zlib: require.resolve("browserify-zlib"),
        fs: false,
        net: false,
        assert: require.resolve("assert/"),
        encoding: require.resolve("encoding/"),
        buffer: require.resolve("buffer/"),
      }
    },
    plugins: [
      // fix "process is not defined" error:
      // (do "npm install process" before running the build)
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
  ],
  }
})
