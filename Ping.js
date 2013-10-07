/*
	Custom Ping class
	
	Usage:
		var Ping = require('./classes/Ping');
		var ping = new Ping('1.2.3.4', options);
		ping.on('done', function() {
			console.log(ping.alive); // boolean
			console.log(ping.statistics); // tx/rx/loss%/min/max/avg/mdev
		});
		ping.send();
	
	Events:
		done = fired when ping child exits
		stopped = fired when continuous ping ends
	
	options:
		count = # of pings to send, 0 == continuous, default = 1
		size = # bytes to send, default = 56
		timeout = # of sec to wait for each ping's response
		ttl = IP ttl
		interval = # of sec to wait between multiple pings
*/

var Events = require('./Events.js'),
		child = require('child_process'),
		os = require('os').platform();

module.exports = Events.extend({
	
	init: function(host, options) {
		this.os = os;
		this.host = host;
		this.options = (options || {});
		this.arguments = [];
		this.stdout = '';
		this.stderr = '';
		this.responses = [];
		
		if (os == 'linux') {
			this.pingPath = '/bin/ping';
			if (this.options.numeric !== false) { this.arguments.push('-n'); }
			if (this.options.count !== 0) { this.arguments.push('-c '+(this.options.count||1)); }
			if (this.options.size) { this.arguments.push('-s '+this.options.size); }
			if (this.options.timeout) { this.arguments.push('-W '+this.options.timeout); }
			if (this.options.ttl) { this.arguments.push('-t '+this.options.ttl); }
			if (this.options.interval) { this.arguments.push('-i '+this.options.interval); }
		}
		else if (os.match(/^win/)) {
			this.pingPath = 'C:/windows/system32/ping.exe';
			if (this.options.count !== 0) { this.arguments.push('-n', (this.options.count||1)); }
			else { this.arguments.push('-t'); }
			if (this.options.numeric !== false) { this.arguments.push('-a'); }
			if (this.options.size) { this.arguments.push('-l', this.options.size); }
			if (this.options.ttl) { this.arguments.push('-i', this.options.ttl); }
			if (this.options.timeout) { this.arguments.push('-w '+this.options.timeout); }
		}
		
		this.arguments.push(host);
		
		return this; // allow chaining
	},
	
	send: function() {
		var self = this;
		
		// kick this pig!
		this.session = child.spawn(this.pingPath, this.arguments),
		this.session.stdout.on('data', function(data) { self.stdout += data; });
		this.session.stderr.on('data', function(data) { self.stderr += data; });
		this.session.on('exit', function(code) {
			self.exitCode = (code || 0);
			self.parseResult();
		});
	},
	
	parseResult: function() {
		if (this.os == 'linux') {
			var results = this.stdout.split(/\n/),
					l = results.length,
					score = results[l-3],
					metric = results[l-2];
			
			var scores = score.match(/^([0-9]+) packets transmitted, ([0-9]+) received, ([0-9]+\%) packet loss.*/),
					metrics = (metric.match(/^rtt min\/avg\/max\/mdev = ([^\/]+)\/([^\/]+)\/([^\/]+)\/([^\ ]+) ms.*/)||[]);
			
			this.statistics = {
				tx: Number(scores[1]),
				rx: Number(scores[2]),
				loss: scores[3],
				min: Number(metrics[1]),
				avg: Number(metrics[2]),
				max: Number(metrics[3]),
				mdev: Number(metrics[4])
			};
		}
		else if (this.os.match(/^win/)) {
			var results = this.stdout.split(/\n/),
					l = results.length,
					stats = results[l-3];
			if (stats.match(/statistics/)) { var score = results[l-2], metric = results[l-1]; }
			else { var score = results[l-4], metric = results[l-2]; }
			
			var scores = score.match(/\ *Packets: Sent = ([0-9]+), Received = ([0-9]+), Lost = ([0-9]+) \(([0-9]+%) loss\).*/),
					metrics = (metric.match(/\ *Minimum = ([0-9]+)ms, Maximum = ([0-9]+)ms, Average = ([0-9]+)ms.*/)||[]);
			
			this.statistics = {
				tx: Number(scores[1]),
				rx: Number(scores[2]),
				loss: scores[4],
				min: Number(metrics[1]),
				avg: Number(metrics[3]),
				max: Number(metrics[2]),
				mdev: undefined
			}
			
		}
		
		this.alive = this.statistics.rx > 0;
		
		this.emit('done');
	},
	
	stop: function() {
		this.session.kill();
		this.emit('stopped');
	}
	
});