// const { defineConfig } = require('@vue/cli-service')
// module.exports = {
//   devServer: {
//     proxy: {
//       "^/api": {
//         target: process.env.VUE_APP_BASE_URL,
//         changeOrigin: true,
//         secure: false,
//         pathRewrite: {
//           "^/api": "/api",
//         },
//         headers: {
//           Connection: "keep-alive",
//         },
//         open: true,
//       },
//     },
//   },
// };

module.exports = {
  configureWebpack: {
    devServer: {
      headers: { "Access-Control-Allow-Origin": "*" }
    }
  }
};