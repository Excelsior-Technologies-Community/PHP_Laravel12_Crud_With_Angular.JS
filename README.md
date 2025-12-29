# PHP_Laravel12_Crud_With_Angular.JS


---


## Project Explanation

### This project is a Single Page Application (SPA) built using:

Laravel 12 → Backend (API + Database)

AngularJS (1.x) → Frontend (UI + Logic)

MySQL → Database

Bootstrap → UI Design

### The project performs CRUD operations:

 Create Item

 Read Items (with pagination)

 Update Item

 Delete Item

---



# Project SetUp


---

## STEP 1: Create New Laravel 12 Project

### Run Command :

```
composer create-project laravel/laravel:^12.0 PHP_Laravel12_Crud_With_Angular.JS
```

### Go inside project:

```
cd PHP_Laravel12_Crud_With_Angular.JS

```

### Run project:

```
php artisan serve

```
 Open browser :

```
http://127.0.0.1:8000
```


## STEP 2: Database Configuration

### Open .env file and update database credentials:

```

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=crud_angularjs
DB_USERNAME=root
DB_PASSWORD=


```

### Create database:

```
crud_angularjs
```


## Step 2: Create Items Table & Model

### Run Command :

```
php artisan make:model Item -m
```


This creates:

Model → Item.php

Migration → create_items_table



### Migration: database/migrations/xxxx_create_items_table.php

``` <?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('items');
    }
};

```
This defines the items table structure.


### Model: app/Models/Item.php

```

<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
  protected $fillable = ['title', 'description'];

}

```
Allows mass assignment during create/update.


### Run migration:
```
php artisan migrate
```



## Step 3: Create Controller

### Run Command :

```
php artisan make:controller ItemController --resource

```

### app/Http/Controllers/ItemController.php

```

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Item;

class ItemController extends Controller
{

public function index(Request $request)
{
    $query = Item::query();

    if ($request->has('search')) {
        $query->where('title', 'like', '%' . $request->search . '%')
              ->orWhere('description', 'like', '%' . $request->search . '%');
    }

    $items = $query->orderBy('id', 'asc')->paginate(5);

    // Return in the format AngularJS expects
    return response()->json([
        'data' => $items->items(),  // actual items array
        'total' => $items->total(), // total items for pagination
    ]);
}




public function store(Request $request)
{
    $request->validate([
        'title' => 'required',
        'description' => 'required',
    ]);

    $item = Item::create([
        'title' => $request->title,
        'description' => $request->description,
    ]);

    return response()->json($item); // AngularJS expects JSON
}


    public function edit($id)
    {
        $item = Item::find($id);
        return response()->json($item);
    }

   public function update(Request $request, $id)
{
    $item = Item::findOrFail($id); // ensures item exists
    $item->update($request->only(['title', 'description'])); // only update allowed fields
    return response()->json($item);
}


    public function destroy($id)
    {
        Item::where('id',$id)->delete();
        return response()->json(['success'=>'Item deleted']);
    }
}

```

## Step 4: Routes

### routes/web.php

```

<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ItemController;

Route::get('/', function () {
    return view('app');
});

Route::resource('items', ItemController::class);

// Templates
Route::get('/templates/{template}', function($template){
    $template = str_replace(".html","",$template);
    return view('templates.'.$template);
});

```


## Step 5: AngularJS Setup

### Create folder structure:

```

public/app/
├── controllers/
│   └── ItemController.js
├── helper/
│   └── myHelper.js
├── packages/
│   └── dirPagination.js
├── routes.js
└── services/
    └── myServices.js

```


### Controller: public/app/controllers/ItemController.js

```
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

```


### Helper: public/app/helper/myHelper.js

```

function apiModifyTable(originalData,id,response){
  angular.forEach(originalData,function(item,key){
      if(item.id==id){ originalData[key] = response; }
  });
  return originalData;
}

```

### Pagination: public/app/packages/dirPagination.js

```

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

```


### AngularJS Route: public/app/routes.js

```

var app = angular.module('main-App', [
    'ngRoute',
    'angularUtils.directives.dirPagination'
]);

app.config(function($routeProvider) {

    $routeProvider
        .when('/', {
            templateUrl: '/templates/home.html'
        })
        .when('/items', {
            templateUrl: '/templates/items.html',
            controller: 'ItemController'
        })
        .otherwise({
            redirectTo: '/'
        });

});

```

### Service: public/app/services/myServices.js

```

app.factory('dataFactory', function($http){
  return {
    httpRequest: function(url,method,params,dataPost,upload){
      var pass = { url:url, method:method||'GET' };
      if(params) pass.params=params;
      if(dataPost) pass.data=dataPost;
      if(upload) pass.upload=upload;
      return $http(pass).then(r=>r.data);
    }
  };
});


```


## Step 6: Blade & Templates

### resources/views/app.blade.php

```

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Laravel 12 AngularJS CRUD</title>

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/css/bootstrap.min.css">

    <!-- jQuery -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/bootstrap.min.js"></script>

    <!-- AngularJS -->
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.2/angular.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.2/angular-route.min.js"></script>

    <!-- Angular Pagination -->
  <script src="{{ asset('app/packages/dirPagination.js') }}"></script>

    <!-- App JS files -->
    <script src="{{ asset('/app/routes.js') }}"></script>
    <script src="{{ asset('/app/services/myServices.js') }}"></script>
    <script src="{{ asset('/app/helper/myHelper.js') }}"></script>
    <script src="{{ asset('/app/controllers/ItemController.js') }}"></script>
</head>
<body ng-app="main-App">
    <nav class="navbar navbar-default">
        <div class="container-fluid">
            <div class="navbar-header">
                <a class="navbar-brand" href="#">Laravel 12</a>
            </div>
            <ul class="nav navbar-nav">
                <li><a href="#/">Home</a></li>
                <li><a href="#/items">Items</a></li>
            </ul>
        </div>
    </nav>

    <div class="container">
        <ng-view></ng-view>
    </div>
</body>
</html>

```

### public/templates/home.html

```

<h2>Welcome to Dashboard</h2>

```

### public/templates/items.html

```

<div class="row">
    <div class="col-lg-12 margin-tb">
        <div class="pull-left">
            <h1>Item Management</h1>
        </div>
        <div class="pull-right" style="padding-top:30px">
            <div class="box-tools" style="display:inline-table">
                <!-- <div class="input-group">
                    <input type="text" class="form-control input-sm" placeholder="Search" ng-change="searchDB()" ng-model="searchText">
                    <span class="input-group-addon">Search</span>
                </div> -->
            </div>
            <button class="btn btn-success" data-toggle="modal" data-target="#create-user">Create New</button>
        </div>
    </div>
</div>

<table class="table table-bordered">
    <thead>
        <tr>
            <th>No</th>
            <th>Title</th>
            <th>Description</th>
            <th width="220px">Action</th>
        </tr>
    </thead>
    <tbody>
        <!-- <tr dir-paginate="value in items | itemsPerPage:5" total-items="totalItems">
            <td>{{ value.id }}</td>
            <td>{{ value.title }}</td>
            <td>{{ value.description }}</td>
            <td>
                <button class="btn btn-primary" ng-click="edit(value.id)" data-toggle="modal" data-target="#edit-data">Edit</button>
                <button class="btn btn-danger" ng-click="remove(value, $index)">Delete</button>
            </td>
        </tr> -->

        <tr ng-repeat="item in items">
    <td>{{ item.id }}</td>
    <td>{{ item.title }}</td>
    <td>{{ item.description }}</td>
<td>
             <!-- <button class="btn btn-primary" ng-click="edit(item.id)" data-toggle="modal" data-target="#edit-data">Edit</button> -->
<button class="btn btn-primary" ng-click="edit(item.id)" data-toggle="modal" data-target="#edit-data">Edit</button>

               <button class="btn btn-danger" ng-click="remove(item, $index)">Delete</button>

            </td>

</tr>

    </tbody>
</table>

<dir-pagination-controls
    class="pull-right"
    on-page-change="pageChanged(newPageNumber)"
    template-url="templates/dirPagination.html">
</dir-pagination-controls>

<!-- Create Modal -->
<div class="modal fade" id="create-user" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <form name="addItem" ng-submit="saveAdd()">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
                    <h4 class="modal-title">Create Item</h4>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <strong>Title:</strong>
                        <input ng-model="createForm.title" type="text" class="form-control" placeholder="Title" required>
                    </div>
                    <div class="form-group">
                        <strong>Description:</strong>
                        <textarea ng-model="createForm.description" class="form-control" placeholder="Description" required></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="submit" ng-disabled="addItem.$invalid" class="btn btn-primary">Submit</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Edit Modal -->
<!-- Edit Modal -->
<div class="modal fade" id="edit-data" tabindex="-1" role="dialog" aria-labelledby="editModalLabel">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <form name="editItem" ng-submit="saveEdit()">
                <!-- Hidden field for ID -->
                <input ng-model="editForm.id" type="hidden">

                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title">Edit Item</h4>
                </div>

                <div class="modal-body">
                    <div class="form-group">
                        <label for="title"><strong>Title:</strong></label>
                        <input id="title" ng-model="editForm.title" type="text" class="form-control" required>
                    </div>

                    <div class="form-group">
                        <label for="description"><strong>Description:</strong></label>
                        <textarea id="description" ng-model="editForm.description" class="form-control" required></textarea>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="submit" ng-disabled="editItem.$invalid" class="btn btn-primary">Update</button>
                </div>
            </form>
        </div>
    </div>
</div>

```

### public/templates/dirPagination.html

```

<ul class="pagination pull-right" ng-if="1 < pages.length">
    <li ng-if="boundaryLinks" ng-class="{ disabled : pagination.current == 1 }">
        <a href="" ng-click="setCurrent(1)">«</a>
    </li>
    <li ng-if="directionLinks" ng-class="{ disabled : pagination.current == 1 }">
        <a href="" ng-click="setCurrent(pagination.current - 1)">‹</a>
    </li>
    <li ng-repeat="pageNumber in pages track by $index" ng-class="{ active : pagination.current == pageNumber, disabled : pageNumber == '...' }">
        <a href="" ng-click="setCurrent(pageNumber)">{{ pageNumber }}</a>
    </li>
    <li ng-if="directionLinks" ng-class="{ disabled : pagination.current == pagination.last }">
        <a href="" ng-click="setCurrent(pagination.current + 1)">›</a>
    </li>
    <li ng-if="boundaryLinks" ng-class="{ disabled : pagination.current == pagination.last }">
        <a href="" ng-click="setCurrent(pagination.last)">»</a>
    </li>
</ul>

```

## Step 7: Run Project

### Run Command:
```
php artisan serve
```

### Open:
```
 http://127.0.0.1:8000
```

## So you can see this type output:

### Item (Index) Page:


<img width="1909" height="968" alt="Screenshot 2025-12-29 105058" src="https://github.com/user-attachments/assets/2c819f85-9803-4ea5-b347-bdd128d303f7" />



### Create Page:


<img width="1919" height="962" alt="Screenshot 2025-12-29 105132" src="https://github.com/user-attachments/assets/c113c632-ee1d-4914-871f-73703259198c" />

<img width="1915" height="961" alt="Screenshot 2025-12-29 105147" src="https://github.com/user-attachments/assets/f00e36b7-ae24-4aac-a433-a5cb7a3851bb" />


### Edit Page:


<img width="1913" height="957" alt="Screenshot 2025-12-29 105201" src="https://github.com/user-attachments/assets/e67be969-410a-48dd-88a7-f94ac03aeec7" />

<img width="1914" height="960" alt="Screenshot 2025-12-29 105213" src="https://github.com/user-attachments/assets/7d4ac5b2-8766-48e4-8ae0-e08377cc6b9c" />


### Delete Page:


<img width="1919" height="967" alt="Screenshot 2025-12-29 105248" src="https://github.com/user-attachments/assets/63d38810-12a9-40b6-9f55-e9efa882b9de" />


---




# Project Folder Structure

```

PHP_Laravel12_Crud_With_Angular.JS
│
├── app
│   ├── Http
│   │   └── Controllers
│   │       └── ItemController.php
│   └── Models
│       └── Item.php
│
├── database
│   └── migrations
│       └── xxxx_create_items_table.php
│
├── public
│   └── app
│       ├── controllers
│       │   └── ItemController.js
│       ├── helper
│       │   └── myHelper.js
│       ├── packages
│       │   └── dirPagination.js
│       ├── routes.js
│       └── services
│           └── myServices.js
│
├── resources
│   └── views
│       ├── app.blade.php
│       └── templates
│           ├── home.html
│           ├── items.html
│           └── dirPagination.html
│
├── routes
│   └── web.php
│
├── .env
├── composer.json
└── README.md

```
