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

function Worker (options) {
	EventEmitter.call(this);

	this.options = _.defaults(options, {
		concurrency: 5,
		fetcher: {}
	});
	if (this.options.index) this.indexInit();
	if (this.options.contents) {
		this.contents = this.options.contents;
		this.baseUrl = this.options.baseUrl;
	}

	this.fileRoot = this.options.fileRoot;
	this.taskQueue = null;
	this.fetcher = new Fetcher();
	this.urlMap = {};
}

util.inherits(Worker, EventEmitter);

Worker.prototype.indexInit = function () {
	var index = this.options.index;
	var urlObj = url.parse(index);
	urlObj.hash = null;
	urlObj.query = null;
	urlObj.search = null;
	urlObj.path = null;
	if (!urlObj.pathname) {
		urlObj.pathname = '/';
	}
	if (!urlObj.pathname.endsWith('/')) {
		this.index = url.format(urlObj);
		var pa = urlObj.pathname.split('/').pop();
		urlObj.pathname = pa.join('/');
	} else {
		this.index = url.format(urlObj) + 'index.html';
	}
	this.baseUrl = url.format(urlObj);
	this.basePathname = urlObj.pathname;
};

Worker.prototype.start = function () {
	if (this.state) return;
	this.state = 'started';

	var self = this;

	var indexPage = this.index;
	var urlMap = this.urlMap;

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

	if (this.index) {
		var pageInfo = urlMap[indexPage] = new PageInfo();
		pageInfo.pathname = 'index.html';

		this.taskQueue.push(indexPage, function (err) {
			if (err) self.emit('error', new Error('index page error'));
		});
	} else if (this.contents) {
		this.pushContents();
	}
};

Worker.prototype.fetch = function (url, callback) {
	var self = this;
	var urlMap = this.urlMap;
	var fileRoot = this.fileRoot;

	this.fetcher.fetch(url, function (err, data) {
		if (err) {
			urlMap[url].error(err);

			return callback(new Error('index page error'));
		}
		if (typeof data === 'string') {
			urlMap[url].state = 'fetched';

			var parseResult = self.parse(data, url);
			var pathname = urlMap.get(url).pathname;
			fs.writeFile(path.join(fileRoot, pathname), parseResult, callback);
		}
	});
};

Worker.prototype.parse = function (html, pageUrl) {
	var $ = cheerio.load(html);
	// todo: html filter

	var $body = $('body');
	this.pickAndFixUrls($body, pageUrl);

	return $body.toString();
};

Worker.prototype.pickAndFixUrls = function ($, pageUrl) {
	var self = this;
	var pagePath = this.urlMap[pageUrl].pathname;
	$.find('a').each(function () {
		var href = this.attribs.href;
		if (!href || href.startsWith('#')) return;

		var hrefHash = url.format(href).hash || '';
		var hrefWithoutHash = href.substr(0, href.length - hrefHash.length);
		var resolvedUrl = url.resolve(pageUrl, hrefWithoutHash);
		var pageInfo = self.push(resolvedUrl);
		if (pageInfo) this.attribs.href = path.relative(pagePath, pageInfo.pathname) + hrefHash;
	});
};

Worker.prototype.push = function (url) {
	// todo: url filter
	if (!url || !url.startsWith(this.baseUrl)) return false;

	var pageInfo = this.urlMap[url];
	if (pageInfo) return pageInfo;
	pageInfo = this.urlMap[url] = new PageInfo();

	pageInfo.state = 'waiting';
	pageInfo.pathname = this.relative(url);
	this.taskQueue.push(url);
	return pageInfo;
};

Worker.prototype.pushContents = function (contents) {
	var self = this;
	if (!contents) contents = this.contents;
	contents.forEach(function (content) {
		self.push(content.url);
		if (content.sub) self.pushContents(contents.sub);
	});
};

/**
 * 获取pageUrl相对于baseUrl的相对路径
 * @param pageUrl
 */
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
