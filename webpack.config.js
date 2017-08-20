'use strict';

var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	devtool: 'eval-source-map',
	entry: [
		path.join(__dirname, 'app/main.js')
	],
	output: {
		path: path.join(__dirname, '/dist/'),
		filename: '[name].js',
		publicPath: '/'
	},
	devServer: {
		headers: {
			'Access-Control-Allow-Origin': '*'
		}
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: 'app/index.tpl.html',
			inject: 'body',
			filename: 'index.html'
		}),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoEmitOnErrorsPlugin(),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('development')
		})
	],
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				query: {
					"presets": ["react", "es2015", "stage-0", "react-hmre"],
					"plugins": ["transform-decorators-legacy"]
				}
			},
			{test: /\.json$/, loader: "json-loader"},
			{test: /\.styl$/, loader: "style-loader!css-loader!stylus-loader"},
			{
				test: /(\.css|\.scss)$/,
				loaders: ['style-loader', 'css-loader?sourceMap', 'sass-loader?sourceMap']
			}]
	}
};
