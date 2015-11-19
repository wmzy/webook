'use strict';

var util = require('util');
var fs = require('fs');
var path = require('path');
var url = require('url');
var EventEmitter = require('events');
var async = require('async');
var cheerio = require('cheerio');
var _ = require('lodash');
var Fetcher = require('./fetcher');
var PageInfo = require('./page-info');
var UrlMap = require('./url-map');

function Worker (options) {
	EventEmitter.call(this);

	this.options = _.defaults(options, {
		concurrency: 5,
		saveStrategy: 'tree', // flat
		fetcher: {}
	});
	this.taskQueue = null;
	this.fetcher = new Fetcher();
	this.urlMap = {};
}

util.inherits(Worker, EventEmitter);

Worker.prototype.start = function () {
	if (this.state) return;
	this.state = 'started';

	var self = this;

	var baseUrl = this.options.baseUrl;
	var indexPage = this.options.indexPage;
	var urlMap = this.urlMap;

	// todo: check baseUrl, indexPage
	if (baseUrl) indexPage = url.resolve(self.options.baseUrl, indexPage);

	this.taskQueue = async.queue(function (url, callback) {
		var pageInfo = urlMap[url];
		pageInfo.state = 'fetching';

		self.fetch(url, function (err) {
			if (err) pageInfo.state = 'error';
			callback(err);
		});
	});

	this.taskQueue.drain = function () {
		if (self.state === 'started') {
			self.state = 'done';
			self.emit('done');
		}
	};

	urlMap[indexPage] = new PageInfo();

	this.taskQueue.push(indexPage, function (err) {
		if (err) self.emit('error', new Error('index page error'));
	});
};

Worker.prototype.fetch = function (url, callback) {
	var self = this;
	var urlMap = this.urlMap;
	var basePath = this.options.basePath;

	this.fetcher.fetch(url, function (err, data) {
		if (err) {
			urlMap[url].error(err);

			return callback(new Error('index page error'));
		}
		if (typeof data === 'string') {
			urlMap[url].state = 'fetched';

			var parseResult = self.parse(data, url);
			var pathname = urlMap.get(url).pathname;
			fs.writeFile(path.join(basePath, pathname), parseResult, callback);
		}
	});
};

Worker.prototype.parse = function (html, pageUrl) {
	var $ = cheerio.load(html);

	var $body = $('body');
	this.addAndFixUrls($body, pageUrl);

	return $body.toString();
};

Worker.prototype.addAndFixUrls = function ($, pageUrl) {
	var self = this;
	$.find('a').each(function () {
		var href = this.attribs.href;
		if (!href || href.startsWith('#')) return;

		var hrefHash = url.format(href).hash || '';
		var hrefWithoutHash = href.substr(0, href.length - hrefHash.length);
		href = url.resolve(pageUrl, hrefWithoutHash);
		var pageInfo = self.push(href);
		if (pageInfo) this.attribs.href = pageInfo.pathname + hrefHash;
	});
};

Worker.prototype.push = function (url) {
	// todo: url filter

	var pageInfo = this.urlMap[url];
	if (pageInfo) return pageInfo;
	pageInfo = this.urlMap[url] = new PageInfo();

	pageInfo.state = 'waiting';
	pageInfo.pathname = this.relative(url);
	return pageInfo;
};

Worker.prototype.relative = function (pageUrl) {
	var urlObj = url.parse(pageUrl);
	var relativePath = path.relative(this.basePathname, urlObj.pathname);
	var ext = path.extname(urlObj.pathname);
	if (_.endsWith(urlObj.pathname, '/')) {
		relativePath += 'index.html';
	} else if (!ext) {
		relativePath += '.html';
	} else if (ext !== '.html') {
		relativePath = relativePath.substr(0, relativePath.length - ext.length) + '.html';
	}

	return relativePath;
};

module.exports = Worker;
