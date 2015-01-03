var cheerio = require('cheerio');

var Parser = function () {

}

Parser.prototype.parse = function (dom) {
    var $ = cheerio.load(dom);

};