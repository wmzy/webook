'use strict';

var util = require('util');
var url = require('url');
var EventEmitter = require('events');
var Response = require('superagent').Response;
var async = require('async');
var _ = require('lodash');
var Fetcher = require('./fetcher');
var Parser = require('./parser');
var UrlMap = require('./url-map');

function Worker (bookConfig) {
	this.bookConfig = _.defaults(bookConfig, {
		saveStrategy: 'tree', // flat
		fetcher: {}
	});
	this.fetcher = new Fetcher();
	var urlMap = this.urlMap = new UrlMap({
		baseUrl: this.bookConfig.baseUrl,
		saveStrategy: this.bookConfig.saveStrategy
	});
	this.parser = new Parser({
		urlMap: urlMap
	});

	EventEmitter.call(this);
}

util.inherits(Worker, EventEmitter);

Worker.prototype.start = function () {
	var self = this;
	var baseUrl = this.bookConfig.baseUrl;
	var indexPage = this.bookConfig.indexPage;
	var urlMap = this.urlMap;

	// todo: check baseUrl, indexPage
	if (baseUrl) indexPage = url.resolve(self.bookConfig.baseUrl, indexPage);

	self.state = 'started';

	self.fetcher.fetch(indexPage, function (err, data) {
		if (err) {
			urlMap.error(indexPage, err);

			return self.emit('error', new Error('index page error'));
		}
		if (typeof data === 'string') {
			urlMap.fetched(indexPage);

			var parseResult = self.parser.parse(data, indexPage);
		}
	});

	self.parser.on('parsed', function () {
		// todo: parsed
	});

	this.bookConfig.contents.forEach(function (content) {
		if (urlMap[content]) return;
		urlMap[content] = true;
		self.fetcher.fetch(content);
	});
};

module.exports = Worker;
