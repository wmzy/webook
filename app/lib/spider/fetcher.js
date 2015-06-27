'use strict';
var superagent = require('superagent');
var events = require('events');
var util = require('util');
var async = require('async');
var mime = require('mime');
var fs = require('fs');
var path = require('path');
var uuid = require('node-uuid');

// url 模块是 Node.js 标准库里面的
// http://nodejs.org/api/url.html
var url = require('url');

function Fetcher(interval, concurrency, filepath) {
	this.interval = interval;
	this.filepath = filepath;
	Fetcher._q = async.queue(fetch, concurrency);

	events.EventEmitter.call(this);
}
util.inherits(Fetcher, events.EventEmitter);

function fetch(task, callback) {
	superagent
		.get(task.url)
		.timeout(3000)
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
				return callback(null, {dom: res.text});
			}

			var ext = mime.extension(res.type);
			var savePath = path.join(task.path, uuid.v4() + '.' + ext);
			var stream = fs.createWriteStream(savePath);
			res.pipe(stream);
			callback(null, {filePath: savePath});
		});
}

Fetcher.prototype.push = function (url) {
	var self = this;
	Fetcher._q.push({url: url}, function (err, data) {
		if (err) {
			console.log(err);
			self.emit('fetched', {
				url: url,
				err: err
			});
			return;
		}
		data.url = url;
		self.emit('fetched', data);
	});
};

exports.Fetcher = Fetcher;
