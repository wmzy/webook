'use strict';

function PageInfo() {
	this.state = 'new'
}

PageInfo.prototype.error = function (err) {
	this.state = 'error';
	this.error = (err || {}).message;
};

module.exports = PageInfo;
