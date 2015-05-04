'use strict';

// Configuring the Articles module
angular.module('books').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', '电子书', 'books', 'dropdown', '/books(/create)?');
		Menus.addSubMenuItem('topbar', 'books', '我的书籍', 'books');
		Menus.addSubMenuItem('topbar', 'books', '创建书籍', 'books/create');
	}
]);