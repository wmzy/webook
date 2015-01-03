var Fetcher = require('./fetcher').Fetcher;
var mongoose = require('mongoose');
var BookConfig = mongoose.model('BookConfig');

var Worker = function (bookConfig) {
    this.bookConfig = bookConfig;
    this.fetcher = new Fetcher();
};

Worker.prototype.start = function() {
    this.state = 'start';
};

module.exports = Worker;