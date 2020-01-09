'use strict';

var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const hotMiddlewareScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true';

module.exports = {
	mode: 'development',
	devtool: 'source-map',
	entry: {app: [path.join(__dirname, 'app/index.tsx'), hotMiddlewareScript]},
	output: {
		path: path.join(__dirname, '/dist/'),
		filename: '[name].js',
		publicPath: '/'
	},
	resolve: {
		// Add '.ts' and '.tsx' as resolvable extensions.
		extensions: [".ts", ".tsx", ".js", ".json"]
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
			{ test: /\.(t|j)sx?$/, use: { loader: 'awesome-typescript-loader'}, exclude: /node_modules/, },
			{ enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
		]
	}
};
