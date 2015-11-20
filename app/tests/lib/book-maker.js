'use strict';

var BookMaker = require('../../lib/book-maker');
var _ = require('lodash');

describe('BookMaker tests', function () {
	it('Should make a book by an url', function () {
		var baseUrl = 'http://nodejs.org/api/';
		var contentsUrl = 'http://nodejs.org/api/index.html';

		var bookMaker = new BookMaker({
			baseUrl: baseUrl,
			contentsUrl: contentsUrl,
			fileRoot: 'tmp/wmzy/nodejs/'
		});

		bookMaker.make(function (err) {
			should.not.exist(err);
		})
	});
});

