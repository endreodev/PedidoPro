<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TituloController extends Controller
{
    private function emp(Request $r): int { return (int) ($r->header('X-Empresa') ?: 1); }

    private function shape($t): array
    {
        return [
            'id' => (string) $t->NUFIN,
            'tipo' => $t->TIPO,
            'descricao' => $t->DESCRICAO,
            'valor' => (float) $t->VLRDESDOB,
            'vencimento' => $t->DTVENC,
            'status' => $t->STATUS,
            'contaId' => $t->CODNAT === null ? null : (string) $t->CODNAT,
            'contaBancariaId' => $t->CODCTA === null ? null : (string) $t->CODCTA,
            'formaPagamento' => $t->FORMAPGTO,
            'origem' => $t->ORIGEM,
            'caixaSessionId' => $t->CODCAIXA === null ? null : (string) $t->CODCAIXA,
            'createdAt' => $t->DHCRIACAO,
            'company_id' => (string) $t->CODEMP,
        ];
    }

    private function cols(Request $r, int $emp): array
    {
        return [
            'CODEMP' => $emp,
            'TIPO' => $r->input('tipo', 'receber'),
            'DESCRICAO' => (string) $r->input('descricao'),
            'VLRDESDOB' => (float) $r->input('valor', 0),
            'DTVENC' => $r->input('vencimento') ?: null,
            'STATUS' => $r->input('status', 'aberto'),
            'CODNAT' => $r->input('contaId') ? (int) $r->input('contaId') : null,
            'CODCTA' => $r->input('contaBancariaId') ? (int) $r->input('contaBancariaId') : null,
            'FORMAPGTO' => $r->input('formaPagamento'),
            'ORIGEM' => $r->input('origem', 'manual'),
            'CODCAIXA' => $r->input('caixaSessionId') ? (int) $r->input('caixaSessionId') : null,
        ];
    }

    public function index(Request $r)
    {
        $rows = DB::table('TGFFIN')->where('CODEMP', $this->emp($r))->orderByDesc('NUFIN')->get()->map(fn ($t) => $this->shape($t));
        return response()->json(['data' => $rows]);
    }

    public function store(Request $r)
    {
        $cols = $this->cols($r, $this->emp($r));
        $cols['DHCRIACAO'] = now();
        $id = DB::table('TGFFIN')->insertGetId($cols, 'NUFIN');
        return response()->json(['data' => $this->shape(DB::table('TGFFIN')->where('NUFIN', $id)->first())], 201);
    }

    public function update(Request $r, $id)
    {
        DB::table('TGFFIN')->where('NUFIN', $id)->update($this->cols($r, $this->emp($r)));
        $t = DB::table('TGFFIN')->where('NUFIN', $id)->first();
        if (!$t) return response()->json(['code' => 'NOT_FOUND', 'status' => 404], 404);
        return response()->json(['data' => $this->shape($t)]);
    }

    public function baixar($id)
    {
        DB::table('TGFFIN')->where('NUFIN', $id)->update(['STATUS' => 'baixado']);
        return response()->json(['data' => $this->shape(DB::table('TGFFIN')->where('NUFIN', $id)->first())]);
    }

    public function destroy($id)
    {
        DB::table('TGFFIN')->where('NUFIN', $id)->delete();
        return response()->noContent();
    }
}
