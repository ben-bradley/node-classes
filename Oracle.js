var Events = require('./Events'),
		Oracle = require('db-oracle');

module.exports = Events.extend({
	init: function() {
		
		// set up the db object
		this.db = new Oracle.Database({
			hostname: '',
			user: '',
			password: '',
			database: ''
		});
		
	},
	
	query: function(sql, callback) {
		var self = this;
		
		// connect to the db
		this.db.connect(function(err) {
			if (err) {
				err.sql = sql;
				self.emit('error', err);
				if (callback) { callback(err, null); }
				return false;
			}
			
			// connected to the db, run the query
			this.query(sql).execute(function(err, rows) {
				if (err) {
					err.sql = sql;
					self.emit('error', err);
					if (callback) { callback(err, null); }
					return false;
				}
				
				self.emit('rows', rows);
				if (callback) { callback(null, rows); }
				
			});
			
		});
	}
	
});