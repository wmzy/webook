'use strict';

var _ = require('lodash');
var Fetcher = require('./fetcher');
var Parser = require('./parser');

function Worker (bookConfig) {
	this.bookConfig = _.defaults(bookConfig, {
		fetcher: {}
	});
	this.fetcher = new Fetcher();
	this.parser = new Parser();
	this.urlMap = {};
}

Worker.prototype.start = function () {
	var self = this;
	self.state = 'start';
	var startPage = self.options.startPage;

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
		self.fetcher.fetch(content);
	});
};

module.exports = Worker;
