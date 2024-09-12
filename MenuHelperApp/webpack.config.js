const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './public/src/main.js', // Ваша точка входа
  output: {
    filename: 'bundle.js', // Имя итогового файла сборки
    path: path.resolve(__dirname, 'public/dist'), // Папка, куда будет помещен сборочный файл
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Обрабатываем все JS файлы
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Можно использовать Babel для транспиляции
          options: {
            presets: ['@babel/preset-env'], // Настройка транспиляции ES6+ в ES5
          },
        },
      },
      {
        test: /\.css$/, // Добавляем возможность работы с CSS файлами
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new Dotenv(), // Для работы с переменными окружения из .env файла
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 9000, // Порт для локального сервера
    historyApiFallback: true,
  },
};
