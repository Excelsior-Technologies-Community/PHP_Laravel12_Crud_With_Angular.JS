<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Item;

class ItemController extends Controller
{

    public function index(Request $request)
    {
        $query = Item::query();

        // Search filter - jyare search parameter aave tyare
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        $sortBy  = $request->get('sort_by', 'id');       // default: id
        $sortDir = $request->get('sort_dir', 'asc');     // default: asc
        $allowedSorts = ['id', 'title', 'status'];       // allowed columns
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'desc' ? 'desc' : 'asc');
        }

        $items = $query->paginate(5);

        return response()->json($items);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        $item = Item::create([
            'title'       => $request->title,
            'description' => $request->description,
            'status'      => 'active', // default status
        ]);

        return response()->json($item, 201);
    }


    public function show($id)
    {
        $item = Item::findOrFail($id);
        return response()->json($item);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        $item = Item::findOrFail($id);
        $item->update([
            'title'       => $request->title,
            'description' => $request->description,
        ]);

        return response()->json($item);
    }

    public function destroy($id)
    {
        $item = Item::findOrFail($id);
        $item->delete();
        return response()->json(['message' => 'Item deleted successfully']);
    }

    public function toggleStatus($id)
    {
        $item = Item::findOrFail($id);
        $item->status = ($item->status === 'active') ? 'inactive' : 'active';
        $item->save();
        return response()->json($item);
    }


    public function suggestions(Request $request)
    {
        $q = $request->get('q', '');

        if (strlen($q) < 1) {
            return response()->json([]);
        }

        $suggestions = Item::where('title', 'LIKE', "%{$q}%")
            ->limit(5)
            ->pluck('title');

        return response()->json($suggestions);
    }

    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array',
            'ids.*' => 'integer|exists:items,id',
        ]);

        $deleted = Item::whereIn('id', $request->ids)->delete();

        return response()->json([
            'message' => "{$deleted} items deleted successfully",
            'deleted' => $deleted,
        ]);
    }


    public function exportCsv()
    {
        $items = Item::all(['id', 'title', 'description', 'status', 'created_at']);

        $filename = 'items_' . date('Ymd_His') . '.csv';

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($items) {
            $handle = fopen('php://output', 'w');
            // CSV header row
            fputcsv($handle, ['ID', 'Title', 'Description', 'Status', 'Created At']);
            // Data rows
            foreach ($items as $item) {
                fputcsv($handle, [
                    $item->id,
                    $item->title,
                    $item->description,
                    $item->status,
                    $item->created_at,
                ]);
            }
            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }
}