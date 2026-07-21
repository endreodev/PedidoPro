<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CaixaController extends Controller
{
    private function emp(Request $r): int { return (int) ($r->header('X-Empresa') ?: 1); }

    private function shape($c): array
    {
        $movs = DB::table('TSICAIXAMOV')->where('CODCAIXA', $c->CODCAIXA)->orderBy('CODMOV')->get()->map(fn ($m) => [
            'id' => (string) $m->CODMOV,
            'kind' => $m->TIPO,
            'paymentType' => $m->FORMAPGTO ?? '',
            'paymentName' => $m->FORMANOME ?? '',
            'amount' => (float) $m->VALOR,
            'description' => $m->DESCRICAO ?? '',
            'at' => $m->DHMOV,
        ]);
        return [
            'id' => (string) $c->CODCAIXA,
            'status' => $c->STATUS === 'ABERTO' ? 'aberto' : 'fechado',
            'operator' => $c->OPERADOR,
            'openedAt' => $c->DTABERTURA,
            'openingAmount' => (float) $c->VLRABERTURA,
            'movements' => $movs,
            'closedAt' => $c->DTFECHAMENTO,
            'countedCash' => $c->VLRCONTADO === null ? null : (float) $c->VLRCONTADO,
        ];
    }

    public function index(Request $r)
    {
        $rows = DB::table('TSICAIXA')->where('CODEMP', $this->emp($r))->orderByDesc('CODCAIXA')
            ->get()->map(fn ($c) => $this->shape($c));
        return response()->json(['data' => $rows]);
    }

    public function abrir(Request $r)
    {
        $id = DB::table('TSICAIXA')->insertGetId([
            'CODEMP' => $this->emp($r),
            'OPERADOR' => (string) $r->input('operator'),
            'STATUS' => 'ABERTO',
            'DTABERTURA' => now(),
            'VLRABERTURA' => (float) $r->input('openingAmount', 0),
        ], 'CODCAIXA');
        return response()->json(['data' => $this->shape(DB::table('TSICAIXA')->where('CODCAIXA', $id)->first())], 201);
    }

    public function movimento(Request $r, $id)
    {
        DB::table('TSICAIXAMOV')->insert([
            'CODCAIXA' => (int) $id,
            'TIPO' => (string) $r->input('kind'),
            'FORMAPGTO' => $r->input('paymentType'),
            'FORMANOME' => $r->input('paymentName'),
            'VALOR' => (float) $r->input('amount', 0),
            'DESCRICAO' => $r->input('description'),
            'DHMOV' => now(),
        ]);
        return response()->json(['data' => $this->shape(DB::table('TSICAIXA')->where('CODCAIXA', $id)->first())]);
    }

    public function fechar(Request $r, $id)
    {
        DB::table('TSICAIXA')->where('CODCAIXA', $id)->update([
            'STATUS' => 'FECHADO',
            'DTFECHAMENTO' => now(),
            'VLRCONTADO' => (float) $r->input('countedCash', 0),
        ]);
        return response()->json(['data' => $this->shape(DB::table('TSICAIXA')->where('CODCAIXA', $id)->first())]);
    }
}
