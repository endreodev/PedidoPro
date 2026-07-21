<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UnitController extends Controller
{
    private function emp(Request $r): int
    {
        return (int) ($r->header('X-Empresa') ?: 1);
    }

    private function shape($u): array
    {
        return [
            'id' => $u->CODVOL,
            'slug' => $u->CODVOL,
            'description' => $u->DESCRVOL,
            'company_id' => (string) $u->CODEMP,
        ];
    }

    public function index(Request $r)
    {
        $rows = DB::table('TGFVOL')->where('CODEMP', $this->emp($r))->orderBy('CODVOL')
            ->get()->map(fn ($u) => $this->shape($u));
        return response()->json(['data' => $rows]);
    }

    public function store(Request $r)
    {
        $emp = $this->emp($r);
        $cod = strtoupper((string) $r->input('slug'));
        DB::table('TGFVOL')->updateOrInsert(
            ['CODVOL' => $cod, 'CODEMP' => $emp],
            ['DESCRVOL' => (string) $r->input('description')],
        );
        $u = DB::table('TGFVOL')->where('CODVOL', $cod)->where('CODEMP', $emp)->first();
        return response()->json(['data' => $this->shape($u)], 201);
    }

    public function update(Request $r, $id)
    {
        $emp = $this->emp($r);
        DB::table('TGFVOL')->where('CODVOL', $id)->where('CODEMP', $emp)
            ->update(['DESCRVOL' => (string) $r->input('description')]);
        $u = DB::table('TGFVOL')->where('CODVOL', $id)->where('CODEMP', $emp)->first();
        if (!$u) return response()->json(['code' => 'NOT_FOUND', 'status' => 404], 404);
        return response()->json(['data' => $this->shape($u)]);
    }

    public function destroy(Request $r, $id)
    {
        DB::table('TGFVOL')->where('CODVOL', $id)->where('CODEMP', $this->emp($r))->delete();
        return response()->noContent();
    }
}
