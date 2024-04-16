const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    main: path.join(__dirname, "pages", "index.js"),
    waiver: path.join(__dirname, "pages", "waiver.js"),
    qa1: path.join(__dirname, "pages", "qa1.js"),
    qa2: path.join(__dirname, "pages", "qa2.js"),
    qa3: path.join(__dirname, "pages", "qa3.js"),
    shortans: path.join(__dirname, "pages", "shortans.js"),
    complete: path.join(__dirname, "pages", "complete.js"),
  },
  output: {
    path:path.resolve(__dirname, "dist"),
    filename:"[name].js"
  },
  module: {
    rules: [
      {
        test: /\.?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: path.join(__dirname, "pages", "index.html"),
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      filename: "waiver.html",
      template: path.join(__dirname, "pages", "waiver.html"),
      chunks: ['waiver']
    }),
    new HtmlWebpackPlugin({
      filename: "qa1.html",
      template: path.join(__dirname, "pages", "qa1.html"),
      chunks: ['qa1']
    }),
    new HtmlWebpackPlugin({
      filename: "qa2.html",
      template: path.join(__dirname, "pages", "qa2.html"),
      chunks: ['qa2']
    }),
    new HtmlWebpackPlugin({
      filename: "qa3.html",
      template: path.join(__dirname, "pages", "qa3.html"),
      chunks: ['qa3']
    }),
    new HtmlWebpackPlugin({
      filename: "shortans.html",
      template: path.join(__dirname, "pages", "shortans.html"),
      chunks: ['shortans']
    }),
    new HtmlWebpackPlugin({
      filename: "complete.html",
      template: path.join(__dirname, "pages", "complete.html"),
      chunks: ['complete']
    }),
  ],
}