var request = require('request');
var fs = require('fs');
const jsdoc2md = require('jsdoc-to-markdown');

// Build the documentation
jsdoc2md.render({ files: 'index.js', 'heading-depth': 3 }).then(output => {
	var readmeBase = 'build/README.base.md';
	fs.readFile(readmeBase, function(err, baseText) {
		if (err) {
			throw err;
		} else {
			var stream = fs.createWriteStream('README.md', {'flags': 'w'});
			stream.write(baseText);
			stream.write("\n");
			stream.write("## API\n");
			stream.write("\n");
			stream.write(output);
			stream.end();
			console.log("Saved README.md, concatenating %s and the jsdoc API documentation", readmeBase);
		}
	});

});
