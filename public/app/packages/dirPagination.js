/*!
 * dirPagination.js
 * https://github.com/michaelbromley/angularUtils/tree/master/src/directives/pagination
 */

(function () {

    var moduleName = 'angularUtils.directives.dirPagination';
    var DEFAULT_ID = '__default';

    angular.module(moduleName, [])
        .directive('dirPaginate', ['$compile', '$parse', 'paginationService', function ($compile, $parse, paginationService) {

            return {
                terminal: true,
                multiElement: true,
                priority: 100,
                compile: function (element, attrs) {

                    var expression = attrs.dirPaginate;
                    var match = expression.match(/^\s*(.+)\s+in\s+(.+?)\s*(\|\s*itemsPerPage\s*:\s*(\S+))?\s*$/);

                    if (!match) {
                        throw new Error("Expected dirPaginate in form of '_item_ in _collection_ | itemsPerPage:_num_'");
                    }

                    var lhs = match[1];
                    var rhs = match[2];
                    var itemsPerPage = match[4] || 10;

                    attrs.$set('ngRepeat', lhs + ' in ' + rhs + ' | limitTo: itemsPerPage');

                    return function (scope, element) {
                        paginationService.registerInstance(DEFAULT_ID);
                        paginationService.setItemsPerPage(DEFAULT_ID, itemsPerPage);
                        $compile(element)(scope);
                    };
                }
            };
        }])

        .directive('dirPaginationControls', ['paginationService', function (paginationService) {

            return {
                restrict: 'E',
                template:
                    '<ul class="pagination">' +
                    '<li ng-class="{disabled: pagination.current == 1}">' +
                    '<a href="" ng-click="setCurrent(1)">First</a></li>' +
                    '<li ng-class="{disabled: pagination.current == 1}">' +
                    '<a href="" ng-click="setCurrent(pagination.current - 1)">«</a></li>' +
                    '<li ng-repeat="page in pages" ng-class="{active: pagination.current == page}">' +
                    '<a href="" ng-click="setCurrent(page)">{{page}}</a></li>' +
                    '<li ng-class="{disabled: pagination.current == pagination.last}">' +
                    '<a href="" ng-click="setCurrent(pagination.current + 1)">»</a></li>' +
                    '<li ng-class="{disabled: pagination.current == pagination.last}">' +
                    '<a href="" ng-click="setCurrent(pagination.last)">Last</a></li>' +
                    '</ul>',
                scope: {},
                link: function (scope) {

                    scope.pagination = paginationService.getInstance(DEFAULT_ID);

                    scope.$watch('pagination.last', function () {
                        scope.pages = [];
                        for (var i = 1; i <= scope.pagination.last; i++) {
                            scope.pages.push(i);
                        }
                    });

                    scope.setCurrent = function (num) {
                        if (num >= 1 && num <= scope.pagination.last) {
                            scope.pagination.current = num;
                        }
                    };
                }
            };
        }])

        .service('paginationService', function () {

            var instances = {};

            this.registerInstance = function (id) {
                instances[id] = {
                    current: 1,
                    last: 1,
                    itemsPerPage: 10
                };
            };

            this.getInstance = function (id) {
                return instances[id];
            };

            this.setItemsPerPage = function (id, itemsPerPage) {
                instances[id].itemsPerPage = itemsPerPage;
            };

        });

})();
