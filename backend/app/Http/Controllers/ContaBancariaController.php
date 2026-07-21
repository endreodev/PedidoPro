<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ContaBancariaController extends Controller
{
    private function emp(Request $r): int { return (int) ($r->header('X-Empresa') ?: 1); }

    private function shape($b): array
    {
        return [
            'id' => (string) $b->CODCTA,
            'descricao' => $b->DESCRCTA,
            'banco' => $b->BANCO ?? '',
            'agencia' => $b->AGENCIA ?? '',
            'conta' => $b->CONTA ?? '',
            'tipo' => $b->TIPO,
            'saldoInicial' => (float) $b->SALDOINI,
            'ativo' => $b->ATIVO === 'S',
            'company_id' => (string) $b->CODEMP,
        ];
    }

    private function cols(Request $r, int $emp): array
    {
        return [
            'CODEMP' => $emp,
            'DESCRCTA' => (string) $r->input('descricao'),
            'BANCO' => $r->input('banco'),
            'AGENCIA' => $r->input('agencia'),
            'CONTA' => $r->input('conta'),
            'TIPO' => $r->input('tipo', 'corrente'),
            'SALDOINI' => (float) $r->input('saldoInicial', 0),
            'ATIVO' => $r->input('ativo', true) ? 'S' : 'N',
        ];
    }

    public function index(Request $r)
    {
        $rows = DB::table('TSICTA')->where('CODEMP', $this->emp($r))->orderBy('CODCTA')->get()->map(fn ($b) => $this->shape($b));
        return response()->json(['data' => $rows]);
    }

    public function store(Request $r)
    {
        $id = DB::table('TSICTA')->insertGetId($this->cols($r, $this->emp($r)), 'CODCTA');
        return response()->json(['data' => $this->shape(DB::table('TSICTA')->where('CODCTA', $id)->first())], 201);
    }

    public function update(Request $r, $id)
    {
        DB::table('TSICTA')->where('CODCTA', $id)->update($this->cols($r, $this->emp($r)));
        $b = DB::table('TSICTA')->where('CODCTA', $id)->first();
        if (!$b) return response()->json(['code' => 'NOT_FOUND', 'status' => 404], 404);
        return response()->json(['data' => $this->shape($b)]);
    }

    public function destroy($id)
    {
        DB::table('TSICTA')->where('CODCTA', $id)->delete();
        return response()->noContent();
    }
}
