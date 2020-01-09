'use strict';

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
 	mode: 'production',
 	entry: [
		path.join(__dirname, 'app/index.tsx')
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
		new MiniCssExtractPlugin({
			 filename: '[name]-[hash].min.css'
		}),
 	],
	module: {
		rules: [
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
			{ test: /\.(t|j)sx?$/, use: { loader: 'awesome-typescript-loader' }, exclude: /node_modules/ },
			{ enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
		]
	}
};
