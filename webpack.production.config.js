'use strict';

var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: [
    path.join(__dirname, 'app/main.tsx')
  ],
  output: {
    path: path.join(__dirname, '/dist/'),
    filename: '[name]-[hash].min.js',
    publicPath: '/'
  },
	resolve: {
		// Add '.ts' and '.tsx' as resolvable extensions.
		extensions: [".ts", ".tsx", ".js", ".json"]
	},
	plugins: [
    new HtmlWebpackPlugin({
      template: 'app/index.tpl.html',
      inject: 'body',
      filename: 'index.html'
    }),
    new ExtractTextPlugin('[name]-[hash].min.css'),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false,
        screw_ie8: true
      }
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ],
	module: {
		loaders: [
			{test: /\.json$/, loader: "json-loader"},
			{test: /\.styl$/, loader: "style-loader!css-loader!stylus-loader"},
			{
				test: /(\.css|\.scss)$/,
				loaders: ['style-loader', 'css-loader?sourceMap', 'sass-loader?sourceMap']
			},
			{
				test: /\.(ttf|eot|woff|woff2|svg)$/,
				loader: 'file-loader',
				options: {
					name: 'assets/fonts/[name].[ext]',
				}
			},
			{
				test: /\.less$/,
				include: [
					path.resolve(__dirname, 'node_modules/font-awesome-webpack/less')
				],
				use: [{
					loader: "style-loader" // creates style nodes from JS strings
				}, {
					loader: "css-loader" // translates CSS into CommonJS
				}, {
					loader: "less-loader" // compiles Less to CSS
				}]
			},
			{ test: /\.(t|j)sx?$/, use: { loader: 'awesome-typescript-loader' } },
			{ enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
		]
	}
};
