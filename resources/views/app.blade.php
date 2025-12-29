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
