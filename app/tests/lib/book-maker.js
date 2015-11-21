'use strict';

var should = require('should');
var _ = require('lodash');
var BookMaker = require('../../lib/book-maker');

describe.only('BookMaker tests', function () {
	this.timeout(100000);
	it('Should make a book by an url', function (done) {
		var baseUrl = 'http://nodejs.org/api/';
		var contentsUrl = 'http://nodejs.org/api/index.html';

		var bookMaker = new BookMaker({
			baseUrl: baseUrl,
			contentsUrl: contentsUrl,
			fileRoot: 'tmp/wmzy/nodejs/'
		});

		bookMaker.make(function (err) {
			should.not.exist(err);
			done();
		});
	});
});

