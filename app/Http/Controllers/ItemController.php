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
