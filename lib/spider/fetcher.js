var superagent = require('superagent');
var cheerio = require('cheerio');
// url 模块是 Node.js 标准库里面的
// http://nodejs.org/api/url.html
var url = require('url');

exports.fetch = function (url) {
    superagent.get(url)
        .end(function(res) {

        });
}