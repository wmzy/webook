var Fetcher = require('./fetcher').Fetcher;
var mongoose = require('mongoose');
var BookConfig = mongoose.model('BookConfig');

var Worker = function (bookConfig) {
    this.bookConfig = bookConfig;
    this.fetcher = new Fetcher();
    this.urlMap = {};
};

Worker.prototype.start = function() {
    this.state = 'start';
    var self = this;

    this.fetcher.on('fetched', function (data) {
        self.bookConfig.pages.push(data);
    });

    var urlMap = this.urlMap;
    this.bookConfig.contents.forEach(function (content) {
        if (urlMap[content]) return;
        urlMap[content] = true;
        this.fetcher.push(content);
    });
};

module.exports = Worker;