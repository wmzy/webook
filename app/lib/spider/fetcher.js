'use strict';
var superagent = require('superagent');
var events = require('events');
var util = require('util');
var async = require('async');
var mime = require('mime');
var fs = require('fs');
var path = require('path');
var uuid = require('node-uuid');
var _ = require('lodash');
var url = require('url');

function Fetcher(options) {
	this.options = _.defaults(options, {
		timeout: 3000
	});
}

Fetcher.prototype.fetch = function (url, callback) {
	var options = this.options;
	if (options.baseUrl) url = url.resolve(options.baseUrl, url);

	superagent
		.get(url)
		.timeout(options.timeout)
		.end(function (err, res) {
			if (err) {
				return callback(err);
			}
			if (res.err) {
				return callback(res.err);
			}

			if (parseInt(res.header['content-length']) > 102400) {
				return callback(null, {message: new Error('file too large')});
			}

			if (res.type === 'text/html') {
				return callback(null, res.text);
			}

			callback(null, res);
		});
};

module.exports = Fetcher;
