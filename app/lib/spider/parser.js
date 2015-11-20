'use strict';
/**
 * 对dom进行裁剪，
 * 解析urls，
 * 替换urls，
 * 添加elem
 * @type {*|exports}
 */

var url = require('url');
var cheerio = require('cheerio');
var _ = require('lodash');

var Parser = function (options) {
	this.options = _.defaults(options, {});
};

Parser.prototype.parse = function (html, pageUrl) {
	var $ = cheerio.load(html);

	var $body = $('body');
	this.pickAndFixUrls($body, pageUrl);

	return $body.toString();
};

Parser.prototype.pickAndFixUrls = function ($, pageUrl) {
	var urlMap = this.options.urlMap;
	$.find('a').each(function () {
		var href = this.attribs.href;
		if (!href || href.startsWith('#')) return;

		var hrefHash = url.format(href).hash || '';
		var hrefWithoutHash = href.substr(0, href.length - hrefHash.length);
		href = url.resolve(pageUrl, hrefWithoutHash);
		var pageInfo = urlMap.add(href);
		this.attribs.href = pageInfo.pathname + hrefHash;
	});
};

module.exports = Parser;
