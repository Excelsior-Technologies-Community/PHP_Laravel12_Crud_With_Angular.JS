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
