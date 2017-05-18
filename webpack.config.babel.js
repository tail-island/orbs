module.exports = {
  entry: ['babel-polyfill', __dirname + '/src/orbs.js'],
  output: {
    path: __dirname + "/target/",
    filename: 'orbs.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['babel-preset-env']
        }
      }
    ]
  }
}

