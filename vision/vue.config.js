module.exports = {
  devServer: {
    port: 8999, //  端口号的配置
    open: true, // 自动打开浏览器
  },
  chainWebpack: config => {
    config.module
      .rule('images')
      .use('image-webpack-loader')
      .loader('image-webpack-loader')
      .options({
        mozjpeg: { quality: 80 },
        optipng: { optimizationLevel: 5 }
      });
  },
  lintOnSave: false // 禁用保存时的 ESLint 检查
}