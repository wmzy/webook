var superagent = require('superagent');
var event = require('event');
var util = require('util');
var async = require('async');
var mime = require('mime');
var fs = require('fs');
var path = require('path');
var uuid = require('node-uuid');

// url 模块是 Node.js 标准库里面的
// http://nodejs.org/api/url.html
var url = require('url');

exports.Fetcher = function (interval, concurrency, filepath) {
    this.interval = interval;
    this.filepath = filepath;

    event.EventEmitter.call(this);
};
util.inherits(Fetcher, event.EventEmitter);

Fetcher._q = async.queue(fetch, concurrency);

function fetch (task, callback) {
    superagent
        .get(task.url)
        .timeout(3000)
        .end(function(err, res) {
            if (err) {
                return callback(err);
            }
            if (res.err) {
                return callback(res.err);
            }

            if (parseInt(res.header['content-length']) > 102400) {
                return callback(new Error('file too large'));
            }

            if (res.type === 'text/html') {
                return callback(null, {html: res.text});
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
            self.emit('err', err);
            return;
        }
        self.emit('fetched', url, data);
    })
};

