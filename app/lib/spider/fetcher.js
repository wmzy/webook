'use strict';
var superagent = require('superagent');
var async = require('async');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var url = require('url');

function Fetcher(options) {
	this.options = _.defaults(options, {
		timeout: 3000,
		maxContentLength: 102400
	});
}

Fetcher.prototype.fetch = function (url, callback) {
	var options = this.options;

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

			if (parseInt(res.header['content-length']) > options.maxContentLength) {
				return callback(new Error('file too large'));
			}

			if (res.type === 'text/html') {
				return callback(null, res.text);
			}

			callback(new Error('type err'));
		});
};

module.exports = Fetcher;
