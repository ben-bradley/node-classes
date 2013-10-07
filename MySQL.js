var Events = require('./Events'),
		mysql = require('mysql');

module.exports = Events.extend({
	
	init: function() {
		this.db = mysql.createConnection({
			host: '',
			user: '',
			password: '',
			database: '',
			insecureAuth: true
		});
	},
	
	query: function(sql, callback) {
		var self = this;
		
		this.db.connect();
		this.db.query(sql, function(err, rows) {
			if (err) {
				err.sql = sql
				self.emit('error', err);
				self.db.end();
				if (callback) { callback(err, null); }
				return false;
			}
			
			self.emit('rows', rows);
			self.db.end();
			if (callback) { callback(null, rows); }
			
		});
	}
	
});
