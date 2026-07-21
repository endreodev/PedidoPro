<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NaturezaController extends Controller
{
    private function emp(Request $r): int { return (int) ($r->header('X-Empresa') ?: 1); }

    private function shape($n): array
    {
        return [
            'id' => (string) $n->CODNAT,
            'nome' => $n->DESCRNAT,
            'tipo' => $n->TIPO,
            'ativo' => $n->ATIVO === 'S',
            'company_id' => (string) $n->CODEMP,
        ];
    }

    private function cols(Request $r, int $emp): array
    {
        return [
            'CODEMP' => $emp,
            'DESCRNAT' => (string) $r->input('nome'),
            'TIPO' => $r->input('tipo', 'receita'),
            'ATIVO' => $r->input('ativo', true) ? 'S' : 'N',
        ];
    }

    public function index(Request $r)
    {
        $rows = DB::table('TGFNAT')->where('CODEMP', $this->emp($r))->orderBy('CODNAT')->get()->map(fn ($n) => $this->shape($n));
        return response()->json(['data' => $rows]);
    }

    public function store(Request $r)
    {
        $id = DB::table('TGFNAT')->insertGetId($this->cols($r, $this->emp($r)), 'CODNAT');
        return response()->json(['data' => $this->shape(DB::table('TGFNAT')->where('CODNAT', $id)->first())], 201);
    }

    public function update(Request $r, $id)
    {
        DB::table('TGFNAT')->where('CODNAT', $id)->update($this->cols($r, $this->emp($r)));
        $n = DB::table('TGFNAT')->where('CODNAT', $id)->first();
        if (!$n) return response()->json(['code' => 'NOT_FOUND', 'status' => 404], 404);
        return response()->json(['data' => $this->shape($n)]);
    }

    public function destroy($id)
    {
        DB::table('TGFNAT')->where('CODNAT', $id)->delete();
        return response()->noContent();
    }
}
