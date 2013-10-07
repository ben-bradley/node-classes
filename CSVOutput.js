var Events = require('./Events'),
		fs = require('fs'),
		_ = require('underscore');

module.exports = Events.extend({
	init: function() {
		
		this.filepath = __dirname+'/../output.csv';
		this.now = new Date().getTime();
		
		this.csv = undefined;
		
	},
	
	append:function(row) {
		this.filepath = __dirname+'/../output-'+this.now+'.csv';
		
		row = _.map(row, function(r) { if (typeof r !== 'string') { return JSON.stringify(r); } else { return r; } });
		
		fs.appendFile(this.filepath, row.join(',')+'\n', function(err) {
			if (err) { console.log("APPEND ERROR!", err); }
		});
	},
	
	save: function(inputRows) {
		console.log('######################SAVING#@@@@@@@@@@@@@@@@@@@@@@@@@@@');
		var self = this;
		var keys = _.keys(inputRows[0]);
		var header = keys.join(',');
		var rows = [];
		
		_.each(inputRows, function(j) {
			var row = [];
			_.each(keys, function(k) {
				if (typeof j[k] !== 'string') { row.push(JSON.stringify(j[k])); }
				else { row.push(j[k]); }
			});
			rows.push(row.join(','));
		});
		
		this.csv = header+'\n'+rows.join('\n');
		
		fs.writeFile(this.filepath, this.csv, function() {
			self.emit('saved');
		});
		
	}
});