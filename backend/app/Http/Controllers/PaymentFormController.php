<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentFormController extends Controller
{
    private array $toDb = ['cash' => 'DINHEIRO', 'pix' => 'PIX', 'card' => 'CARTAO', 'boleto' => 'BOLETO', 'transfer' => 'TRANSFERENCIA'];
    private array $fromDb = ['DINHEIRO' => 'cash', 'PIX' => 'pix', 'CARTAO' => 'card', 'BOLETO' => 'boleto', 'TRANSFERENCIA' => 'transfer'];

    private function emp(Request $r): int { return (int) ($r->header('X-Empresa') ?: 1); }

    private function shape($f): array
    {
        return [
            'id' => (string) $f->CODTIPVENDA,
            'name' => $f->DESCRTIPVENDA,
            'type' => $this->fromDb[$f->TIPO] ?? 'cash',
            'fee_percentage' => (float) $f->TAXA,
            'payment_deadline' => (int) $f->PRAZO,
            'is_active' => $f->ATIVO === 'S',
            'company_id' => (string) $f->CODEMP,
        ];
    }

    private function cols(Request $r, int $emp): array
    {
        return [
            'CODEMP' => $emp,
            'DESCRTIPVENDA' => (string) $r->input('name'),
            'TIPO' => $this->toDb[$r->input('type')] ?? 'DINHEIRO',
            'TAXA' => (float) $r->input('fee_percentage', 0),
            'PRAZO' => (int) $r->input('payment_deadline', 0),
            'ATIVO' => $r->input('is_active') ? 'S' : 'N',
        ];
    }

    public function index(Request $r)
    {
        $rows = DB::table('TGFTPV')->where('CODEMP', $this->emp($r))->orderBy('CODTIPVENDA')
            ->get()->map(fn ($f) => $this->shape($f));
        return response()->json(['data' => $rows]);
    }

    public function store(Request $r)
    {
        $id = DB::table('TGFTPV')->insertGetId($this->cols($r, $this->emp($r)), 'CODTIPVENDA');
        return response()->json(['data' => $this->shape(DB::table('TGFTPV')->where('CODTIPVENDA', $id)->first())], 201);
    }

    public function update(Request $r, $id)
    {
        DB::table('TGFTPV')->where('CODTIPVENDA', $id)->update($this->cols($r, $this->emp($r)));
        $f = DB::table('TGFTPV')->where('CODTIPVENDA', $id)->first();
        if (!$f) return response()->json(['code' => 'NOT_FOUND', 'status' => 404], 404);
        return response()->json(['data' => $this->shape($f)]);
    }

    public function destroy($id)
    {
        DB::table('TGFTPV')->where('CODTIPVENDA', $id)->delete();
        return response()->noContent();
    }
}
