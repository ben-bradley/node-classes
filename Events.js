/*
* This class allows child classes to have events
*/

var Class = require('class.extend'),
		events = require('events');

var Events = Class.extend({ init: function() { events.EventEmitter.call(this); } });

Events.super_ = events.EventEmitter;
Events.prototype = Object.create(events.EventEmitter.prototype, {
	constructor: { value: Events, enumerable: false }
});

module.exports = Events;