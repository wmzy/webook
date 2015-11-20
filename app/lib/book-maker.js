'use strict';

var Fetcher = require('./spider/fetcher');
var Worker = require('./spider/worker');

function BookMaker(bookConfig) {
	this.bookConfig = bookConfig;
	this.contents = this.bookConfig.contents;
}

BookMaker.prototype.makeContents = function (callback) {
	var self = this;
	var contentsUrl = this.bookConfig.contentsUrl;
	var fetcher = new Fetcher();
	var contents = [];
	fetcher.fetch(contentsUrl, function (err, html) {
		if (err) return callback(err);

		var $ = cheerio.load(html);
		$.find('#apicontent ul li a').each(function (i) {
			contents.push({
				url: this.href,
				title: i + this.text
			});
		});
		self.contents = contents;
		callback();
	});

	//
};

BookMaker.prototype.makeByContents = function (callback) {
	var worker = new Worker({
		contents: this.contents,
		baseUrl: this.bookConfig.baseUrl,
		fileRoot: this.bookConfig.fileRoot
	});
	worker.on('done', callback);
	worker.on('error', callback);
	worker.start();
};

BookMaker.prototype.make = function (callback) {
	if (this.bookConfig.contents) {
		return this.makeByContents(callback);
	} else if (this.bookConfig.contentsUrl) {
		return this.makeContents(function (err) {
			if (err) return callback(err);

			this.makeByContents(callback);
		})
	}
};

module.exports = BookMaker;
