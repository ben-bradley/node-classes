var Events = require('./Events'),
		http = require('http');

module.exports = Events.extend({
	init: function() {
		
	},
	get: function(url, callback) {
		http.get(url, function(res) {
			var data = '';
			res.setEncoding('utf8');
			res.on('data', function(chunk) { data += chunk; });
			res.on('end', function() {
				var json = JSON.parse(data);
				callback(null, json);
			});
		}).on('error', function(err) {
			err.url = url;
			callback(err, null);
		});
	}
});





//				http.get(record.interfaceUrl, function(res) {
//					var data = '';
//					res.setEncoding('utf8');
//					res.on('data', function(chunk) { data += chunk; });
//					res.on('end', function() {
//						record.interfaceData = JSON.parse(data);
//						handleGot(null);
//					});
//				}).on('error', function(err) {
//					err.url = record.interfaceUrl;
//					handleGot(err);
//				});