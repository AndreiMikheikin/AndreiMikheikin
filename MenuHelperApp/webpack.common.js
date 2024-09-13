const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './public/src/main.js',
  output: {
    filename: 'bundle.[contenthash].js',
    path: path.resolve(__dirname, 'public/dist'),
    publicPath: '/',
    library: 'MyLibrary',  // Это позволит экспортировать функции глобально
    libraryTarget: 'window',  // Сделает функции доступными через window
  },
  
  resolve: {
    modules: [
      path.resolve(__dirname, 'public/src'),
      'node_modules',
    ],
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      firebase: path.resolve(__dirname, 'node_modules/firebase'),
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i, // Для обработки изображений
        type: 'asset/resource',          // Используем встроенный механизм Webpack 5 для файлов
      }
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      inject: 'body',
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
    }),
    new Dotenv(),
  ],
};