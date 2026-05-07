

app.controller('ItemController', function ($scope, $http, $timeout, dataFactory) {

    // ─── STATE VARIABLES ──────────────────────────────────────────────────────

    $scope.items       = [];       
    $scope.totalItems  = 0;          
    $scope.searchText  = '';         
    $scope.suggestions = [];        
    $scope.selectedIds = [];         
    $scope.selectAll   = false;     
    $scope.createForm  = {};     
    $scope.editForm    = {};         

  
    $scope.sort = {
        column: 'id',
        dir:    'asc'
    };

    // Pagination state
    $scope.pagination = {
        current: 1,
        last:    1
    };

   
    var suggestionTimer = null;

    $scope.showToast = function (message, type) {
        type = type || 'success';
        var container = document.getElementById('toast-container');
        if (!container) return;

        var toast = document.createElement('div');
        toast.className = 'toast-msg toast-' + type;
        toast.innerText = message;
        container.appendChild(toast);

      
        setTimeout(function () {
            toast.style.opacity = '0';
            setTimeout(function () {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 500);
        }, 3000);
    };

  
    $scope.fetchItems = function () {
        var params = {
            page:     $scope.pagination.current,
            sort_by:  $scope.sort.column,
            sort_dir: $scope.sort.dir,
        };

        if ($scope.searchText && $scope.searchText.trim() !== '') {
            params.search = $scope.searchText.trim();
        }

        dataFactory.httpRequest('/items', 'GET', params)
            .then(function (data) {
                $scope.items      = data.data;
                $scope.totalItems = data.total;        
                $scope.pagination.current = data.current_page;
                $scope.pagination.last    = data.last_page;

               
                $scope.selectedIds = [];
                $scope.selectAll   = false;
            })
            .catch(function () {
                $scope.showToast('Failed to load items.', 'error');
            });
    };

    // Initial load
    $scope.fetchItems();

   
    $scope.sortBy = function (column) {
        if ($scope.sort.column === column) {
            // Same column - direction toggle karo
            $scope.sort.dir = ($scope.sort.dir === 'asc') ? 'desc' : 'asc';
        } else {
          
            $scope.sort.column = column;
            $scope.sort.dir    = 'asc';
        }
        $scope.pagination.current = 1; 
        $scope.fetchItems();
    };

    $scope.onSearchChange = function () {
      
        if (suggestionTimer) $timeout.cancel(suggestionTimer);

        suggestionTimer = $timeout(function () {
            $scope.pagination.current = 1;
            $scope.fetchItems();

            
            if ($scope.searchText && $scope.searchText.length >= 1) {
                $scope.fetchSuggestions($scope.searchText);
            } else {
                $scope.suggestions = [];
            }
        }, 300); // 300ms wait
    };

    
    $scope.fetchSuggestions = function (query) {
        dataFactory.httpRequest('/items/suggestions', 'GET', { q: query })
            .then(function (data) {
                $scope.suggestions = data;
            })
            .catch(function () {
                $scope.suggestions = [];
            });
    };

  
    $scope.selectSuggestion = function (text) {
        $scope.searchText  = text;
        $scope.suggestions = [];          // dropdown band karo
        $scope.pagination.current = 1;
        $scope.fetchItems();
    };

  
    $scope.onSearchKeydown = function (event) {
        if (event.keyCode === 27) {        // Escape key
            $scope.suggestions = [];
        }
    };

  
    $scope.toggleSelectAll = function () {
        $scope.selectedIds = [];
        $scope.items.forEach(function (item) {
            item._selected = $scope.selectAll;
            if ($scope.selectAll) {
                $scope.selectedIds.push(item.id);
            }
        });
    };

   
    $scope.updateSelectedIds = function (item) {
        if (item._selected) {
            if ($scope.selectedIds.indexOf(item.id) === -1) {
                $scope.selectedIds.push(item.id);
            }
        } else {
            var idx = $scope.selectedIds.indexOf(item.id);
            if (idx > -1) $scope.selectedIds.splice(idx, 1);
        }

       
        $scope.selectAll = ($scope.selectedIds.length === $scope.items.length);
    };


    $scope.isSelected = function (id) {
        return $scope.selectedIds.indexOf(id) > -1;
    };

    // ─── NEW: BULK DELETE ─────────────────────────────────────────────────────
    $scope.bulkDelete = function () {
        if ($scope.selectedIds.length === 0) return;

        var confirmMsg = $scope.selectedIds.length + ' items delete karvana chhe. Sure?';
        if (!confirm(confirmMsg)) return;

        dataFactory.httpRequest('/items/bulk-delete', 'POST', null, { ids: $scope.selectedIds })
            .then(function (data) {
                $scope.showToast(data.message, 'success');
                $scope.selectedIds = [];
                $scope.selectAll   = false;
                $scope.fetchItems();
            })
            .catch(function () {
                $scope.showToast('Bulk delete failed.', 'error');
            });
    };

    // ─── PAGINATION ───────────────────────────────────────────────────────────
    $scope.pageChanged = function (newPage) {
        $scope.pagination.current = newPage;
        $scope.fetchItems();
    };

    // ─── CREATE ITEM ──────────────────────────────────────────────────────────
    $scope.saveAdd = function () {
        dataFactory.httpRequest('/items', 'POST', null, $scope.createForm)
            .then(function () {
                $scope.showToast('Item created successfully!', 'success');
                $scope.createForm = {};             // form reset
                $('#create-user').modal('hide');    // modal band karo
                $scope.fetchItems();
            })
            .catch(function () {
                $scope.showToast('Failed to create item.', 'error');
            });
    };

    // ─── EDIT ITEM (open modal with data) ────────────────────────────────────
    $scope.edit = function (id) {
        dataFactory.httpRequest('/items/' + id, 'GET')
            .then(function (data) {
                $scope.editForm = data;
            })
            .catch(function () {
                $scope.showToast('Failed to load item data.', 'error');
            });
    };

    // ─── UPDATE ITEM ──────────────────────────────────────────────────────────
    $scope.saveEdit = function () {
        dataFactory.httpRequest('/items/' + $scope.editForm.id, 'PUT', null, $scope.editForm)
            .then(function () {
                $scope.showToast('Item updated successfully!', 'success');
                $scope.editForm = {};
                $('#edit-data').modal('hide');
                $scope.fetchItems();
            })
            .catch(function () {
                $scope.showToast('Failed to update item.', 'error');
            });
    };

    // ─── DELETE SINGLE ITEM ───────────────────────────────────────────────────
    $scope.remove = function (item, index) {
        if (!confirm('Delete "' + item.title + '"?')) return;

        dataFactory.httpRequest('/items/' + item.id, 'DELETE')
            .then(function () {
                $scope.showToast('Item deleted!', 'success');
                $scope.fetchItems();
            })
            .catch(function () {
                $scope.showToast('Failed to delete item.', 'error');
            });
    };

    // ─── TOGGLE STATUS ────────────────────────────────────────────────────────
    $scope.toggleStatus = function (item, index) {
        dataFactory.httpRequest('/items/' + item.id + '/toggle-status', 'PUT')
            .then(function (data) {
                $scope.items[index].status = data.status;  // UI update
                $scope.showToast('Status changed to ' + data.status + '!', 'info');
            })
            .catch(function () {
                $scope.showToast('Failed to toggle status.', 'error');
            });
    };

});