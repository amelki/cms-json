const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('./webpack.config.js');
const path = require('path');

module.exports = function(app) {
	const compiler = webpack(config);
	const middleware = webpackDevMiddleware(compiler, {
		publicPath: config.output.publicPath,
		contentBase: 'src',
		stats: {
			colors: true,
			hash: false,
			timings: true,
			chunks: false,
			chunkModules: false,
			modules: false
		}
	});
	app.use(middleware);
	app.use(webpackHotMiddleware(compiler));
	app.get('*', function response(req, res) {
		res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')));
		res.end();
	});
};