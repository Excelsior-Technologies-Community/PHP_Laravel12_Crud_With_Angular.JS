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

    <!-- NEW: Toast notification styles -->
    <style>
      
        #toast-container {
            position: fixed;
            top: 70px;
            right: 20px;
            z-index: 9999;
            min-width: 250px;
        }
        .toast-msg {
            padding: 12px 18px;
            margin-bottom: 8px;
            border-radius: 4px;
            color: #fff;
            font-size: 14px;
            opacity: 1;
            transition: opacity 0.5s ease;
        }
        .toast-success { background-color: #5cb85c; }
        .toast-error   { background-color: #d9534f; }
        .toast-info    { background-color: #5bc0de; }

        /* Search suggestions dropdown */
        .suggestions-dropdown {
            position: absolute;
            background: #fff;
            border: 1px solid #ccc;
            width: 100%;
            z-index: 1000;
            list-style: none;
            padding: 0;
            margin: 0;
            max-height: 200px;
            overflow-y: auto;
            border-radius: 0 0 4px 4px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .suggestions-dropdown li {
            padding: 8px 12px;
            cursor: pointer;
            font-size: 14px;
        }
        .suggestions-dropdown li:hover {
            background-color: #f5f5f5;
        }
        .search-wrapper {
            position: relative;
        }
    </style>
</head>
<body ng-app="main-App">

  
    <div id="toast-container"></div>

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