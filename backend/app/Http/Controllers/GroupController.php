<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GroupController extends Controller
{
    private function emp(Request $r): int
    {
        return (int) ($r->header('X-Empresa') ?: 1);
    }

    private function shape($g): array
    {
        return [
            'id' => (string) $g->CODGRUPOPROD,
            'name' => $g->DESCRGRUPOPROD,
            'color' => $g->COR,
            'company_id' => (string) $g->CODEMP,
            'product_count' => 0,
        ];
    }

    public function index(Request $r)
    {
        $rows = DB::table('TGFGRU')->where('CODEMP', $this->emp($r))->orderBy('CODGRUPOPROD')
            ->get()->map(fn ($g) => $this->shape($g));
        return response()->json(['data' => $rows]);
    }

    public function store(Request $r)
    {
        $id = DB::table('TGFGRU')->insertGetId([
            'CODEMP' => $this->emp($r),
            'DESCRGRUPOPROD' => (string) $r->input('name'),
            'COR' => $r->input('color'),
            'ATIVO' => 'S',
        ], 'CODGRUPOPROD');
        return response()->json(['data' => $this->shape(DB::table('TGFGRU')->where('CODGRUPOPROD', $id)->first())], 201);
    }

    public function update(Request $r, $id)
    {
        DB::table('TGFGRU')->where('CODGRUPOPROD', $id)->update([
            'DESCRGRUPOPROD' => (string) $r->input('name'),
            'COR' => $r->input('color'),
        ]);
        $g = DB::table('TGFGRU')->where('CODGRUPOPROD', $id)->first();
        if (!$g) return response()->json(['code' => 'NOT_FOUND', 'status' => 404], 404);
        return response()->json(['data' => $this->shape($g)]);
    }

    public function destroy($id)
    {
        DB::table('TGFGRU')->where('CODGRUPOPROD', $id)->delete();
        return response()->noContent();
    }
}
