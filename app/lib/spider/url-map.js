'use strict';

var url = require('url');
var path = require('path');
var uuid = require('node-uuid');
var _ = require('lodash');

function UrlMap(options) {
	this.options = _.defaults(options, {
	});

	this.basePathname = url.parse(this.options.baseUrl).pathname;
	this.map = {};
}

UrlMap.prototype.get = function (url) {
	return this.map[url];
};

UrlMap.prototype.relative = function (pageUrl) {
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

UrlMap.prototype.add = function (url) {
	var pageState = this.get(url);
	if (pageState) return pageState;

	var pathname = this.relative(url);
	return this.map[url] = {
		state: 'new',
		pathname: pathname
	};
};

UrlMap.prototype.addIndex = function (url) {
	var pathname = this.relative(url);
	return this.map[url] = {
		state: 'new',
		pathname: pathname
	};
};

UrlMap.prototype.error = function (url, err) {
	var ps = this.get(url);
	ps.state = 'error';
	ps.error = (err || {}).message;
};

UrlMap.prototype.fetched = function (url) {
	this.get(url).state = 'fetched';
};

module.exports = UrlMap;
