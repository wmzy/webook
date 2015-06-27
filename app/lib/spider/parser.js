'use strict';
/**
 * 对dom进行裁剪，
 * 解析urls，
 * 替换urls，
 * 添加elem
 * @type {*|exports}
 */

var cheerio = require('cheerio');

var Parser = function () {

};

Parser.prototype.parse = function (dom) {
	var $ = cheerio.load(dom);

};
