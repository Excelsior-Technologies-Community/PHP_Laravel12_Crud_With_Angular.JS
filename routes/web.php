<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ItemController;

Route::get('/', function () {
    return view('app');
});


Route::get('items/suggestions',        [ItemController::class, 'suggestions']);
Route::get('items/export-csv',         [ItemController::class, 'exportCsv']);
Route::post('items/bulk-delete',       [ItemController::class, 'bulkDelete']);
Route::put('items/{id}/toggle-status', [ItemController::class, 'toggleStatus']);

Route::resource('items', ItemController::class);

// Templates
Route::get('/templates/{template}', function ($template) {
    $template = str_replace(".html", "", $template);
    return view('templates.' . $template);
});