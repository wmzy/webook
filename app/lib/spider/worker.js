'use strict';
var Fetcher = require('./fetcher').Fetcher;
var Parser = require('./parser').Fetcher;
var mongoose = require('mongoose');
var BookConfig = mongoose.model('BookConfig');

function Worker (bookConfig) {
	this.bookConfig = bookConfig;
	this.fetcher = new Fetcher();
	this.parser = new Parser();
	this.urlMap = {};
}

Worker.prototype.start = function () {
	this.state = 'start';
	var self = this;

	this.fetcher.on('fetched', function (data) {
		self.bookConfig.pages.push(data);
		if (data.dom) {
			self.parser.push(data.dom);
		}
	});

	this.parser.on('parsed', function () {
		// todo: parsed
	});

	var urlMap = this.urlMap;
	this.bookConfig.contents.forEach(function (content) {
		if (urlMap[content]) return;
		urlMap[content] = true;
		this.fetcher.push(content);
	});
};

module.exports = Worker;
