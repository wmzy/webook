'use strict';

var Parser = require('../../../lib/spider/parser');
var UrlMap = require('../../../lib/spider/url-map');
var _ = require('lodash');

describe('Parser tests', function () {
	it('Should parse html right', function () {
		var baseUrl = 'http://nodejs.org/api/';
		var parser = new Parser({
			urlMap: new UrlMap({
				baseUrl: baseUrl
			})
		});
		var pageUrl = 'http://nodejs.org/api/index.html';
		var href1 = 'fs.html';
		var href2 = '#fs';
		var href3 = '#fs';
		var complited = _.template(
			'<body><ul><li><a href="${ href1 }">nodejs</a></li>' +
			'<li><a href="${ href2 }">nodejs</a></li>' +
			'<li><a href="${ href2 }">nodejs</a></li></ul></body>'
		);

		parser.parse(complited({
			href1: href1,
			href2: href2
		}), pageUrl).should.be.equal(complited({
				href1: href1,
				href2: href2
			}));
	});
});
