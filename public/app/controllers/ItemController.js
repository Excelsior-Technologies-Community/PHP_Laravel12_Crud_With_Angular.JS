app.controller('ItemController', ['dataFactory', '$scope', function(dataFactory, $scope) {

    $scope.items = [];
    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.createForm = {};  // for create modal
    $scope.editForm = {};    // for edit modal

    // ==========================
    // Load items
    // ==========================
    function getResultsPage(page) {
        let url = 'items?page=' + page;
        dataFactory.httpRequest(url).then(function(response) {
            $scope.items = response.data;
            $scope.totalItems = response.total;
            $scope.currentPage = page;
        });
    }

    // Initial load
    getResultsPage(1);

    // ==========================
    // CREATE ITEM
    // ==========================
    $scope.saveAdd = function() {
        dataFactory.httpRequest('items', 'POST', {}, $scope.createForm)
            .then(function(response) {
                $scope.items.unshift(response);
                $scope.totalItems += 1;
                $scope.createForm = {}; // reset form
                if ($scope.addItem) {
                    $scope.addItem.$setPristine();
                    $scope.addItem.$setUntouched();
                }
                $("#create-user").modal("hide");
            });
    };

    // ==========================
    // EDIT ITEM
    // ==========================
    $scope.edit = function(id) {
        dataFactory.httpRequest('items/' + id + '/edit')
            .then(function(response) {
              
                $scope.editForm = angular.copy(response);
            });
    };

    // ==========================
    // UPDATE ITEM
    // ==========================
    $scope.saveEdit = function() {
        dataFactory.httpRequest('items/' + $scope.editForm.id, 'PUT', {}, $scope.editForm)
            .then(function(response) {
                for (let i = 0; i < $scope.items.length; i++) {
                    if ($scope.items[i].id === response.id) {
                        $scope.items[i] = response;
                        break;
                    }
                }
                $scope.editForm = {};
                $("#edit-data").modal("hide");
            });
    };

    // ==========================
    // DELETE ITEM
    // ==========================
    $scope.remove = function(item, index) {
        if (confirm("Are you sure you want to delete this item?")) {
            dataFactory.httpRequest('items/' + item.id, 'DELETE')
                .then(function() {
                    $scope.items.splice(index, 1);
                    $scope.totalItems -= 1;
                });
        }
    };

}]);
