const path = require('path')

module.exports = {
  configureWebpack: {
    devServer: {
      host: '0.0.0.0',
      port: '8003',
      https: false,
      hotOnly: false
    },
    resolve: {
      alias: {
        '@': path.join(__dirname, '/src'),
        vue$: 'vue/dist/vue.esm.js'
      }
    }
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        productName: 'Example',
        dmg: {
          contents: [
            {
              x: 410,
              y: 150,
              type: 'link',
              path: '/Applications'
            },
            {
              x: 130,
              y: 150,
              type: 'file'
            }
          ]
        },
        mac: {},
        win: {
          target: [
            {
              target: 'nsis',
              arch: ['x64', 'ia32']
            }
          ]
        },
        linux: {}
      }
    }
  }
}
