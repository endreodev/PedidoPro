<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    private array $toDb = ['draft' => 'RASCUNHO', 'orcamento' => 'ORCAMENTO', 'open' => 'ABERTO', 'separating' => 'SEPARANDO', 'completed' => 'CONCLUIDO', 'canceled' => 'CANCELADO'];
    private array $fromDb = ['RASCUNHO' => 'draft', 'ORCAMENTO' => 'orcamento', 'ABERTO' => 'open', 'SEPARANDO' => 'separating', 'CONCLUIDO' => 'completed', 'CANCELADO' => 'canceled'];

    private function emp(Request $r): int { return (int) ($r->header('X-Empresa') ?: 1); }

    private function shape($c): array
    {
        $items = DB::table('TGFITE')->where('NUNOTA', $c->NUNOTA)->orderBy('SEQUENCIA')->get()->map(fn ($i) => [
            'id' => (string) $i->SEQUENCIA,
            'product_id' => (string) $i->CODPROD,
            'quantity' => (float) $i->QTDNEG,
            'unit_price' => (float) $i->VLRUNIT,
            'subtotal' => (float) $i->VLRTOT,
            'flavor' => $i->DESCRSABOR ?? '',
        ]);
        $payments = DB::table('TGFPAG')->where('NUNOTA', $c->NUNOTA)->orderBy('SEQUENCIA')->get()->map(fn ($pg) => [
            'id' => (string) $pg->SEQUENCIA,
            'payment_form_id' => $pg->CODTIPVENDA === null ? '' : (string) $pg->CODTIPVENDA,
            'amount' => (float) $pg->VALOR,
        ]);
        return [
            'id' => (string) $c->NUNOTA,
            'number' => (string) ($c->NUMNOTA ?? $c->NUNOTA),
            'customer_id' => $c->CODPARC === null ? '' : (string) $c->CODPARC,
            'status' => $this->fromDb[$c->STATUS] ?? 'open',
            'items' => $items,
            'payments' => $payments,
            'subtotal' => (float) $c->VLRSUBTOT,
            'discount' => (float) $c->VLRDESC,
            'total' => (float) $c->VLRTOT,
            'created_at' => $c->DTNEG,
            'company_id' => (string) $c->CODEMP,
        ];
    }

    private function saveItems(int $nunota, array $items): void
    {
        DB::table('TGFITE')->where('NUNOTA', $nunota)->delete();
        $seq = 1;
        foreach ($items as $it) {
            DB::table('TGFITE')->insert([
                'NUNOTA' => $nunota,
                'SEQUENCIA' => $seq++,
                'CODPROD' => (int) ($it['product_id'] ?? 0),
                'QTDNEG' => (float) ($it['quantity'] ?? 1),
                'VLRUNIT' => (float) ($it['unit_price'] ?? 0),
                'VLRTOT' => (float) ($it['subtotal'] ?? 0),
                'DESCRSABOR' => !empty($it['flavor']) ? mb_substr((string) $it['flavor'], 0, 80) : null,
            ]);
        }
    }

    private function savePayments(int $nunota, array $payments): void
    {
        DB::table('TGFPAG')->where('NUNOTA', $nunota)->delete();
        $seq = 1;
        foreach ($payments as $pg) {
            DB::table('TGFPAG')->insert([
                'NUNOTA' => $nunota,
                'SEQUENCIA' => $seq++,
                'CODTIPVENDA' => !empty($pg['payment_form_id']) ? (int) $pg['payment_form_id'] : null,
                'VALOR' => (float) ($pg['amount'] ?? 0),
            ]);
        }
    }

    private function cabColumns(Request $r, int $emp): array
    {
        $codparc = $r->input('customer_id');
        return [
            'CODEMP' => $emp,
            'NUMNOTA' => $r->input('number') ? (int) $r->input('number') : null,
            'CODPARC' => $codparc ? (int) $codparc : null,
            'STATUS' => $this->toDb[$r->input('status')] ?? 'ABERTO',
            'VLRSUBTOT' => (float) $r->input('subtotal', 0),
            'VLRDESC' => (float) $r->input('discount', 0),
            'VLRTOT' => (float) $r->input('total', 0),
        ];
    }

    public function index(Request $r)
    {
        $rows = DB::table('TGFCAB')->where('CODEMP', $this->emp($r))->orderByDesc('NUNOTA')
            ->get()->map(fn ($c) => $this->shape($c));
        return response()->json(['data' => $rows]);
    }

    public function store(Request $r)
    {
        $emp = $this->emp($r);
        $nunota = DB::transaction(function () use ($r, $emp) {
            $cols = $this->cabColumns($r, $emp);
            $cols['DTNEG'] = now();
            $cols['CODUSU'] = $r->attributes->get('codusu');
            $id = DB::table('TGFCAB')->insertGetId($cols, 'NUNOTA');
            if (!$r->input('number')) DB::table('TGFCAB')->where('NUNOTA', $id)->update(['NUMNOTA' => $id]);
            $this->saveItems($id, $r->input('items', []));
            $this->savePayments($id, $r->input('payments', []));
            return $id;
        });
        return response()->json(['data' => $this->shape(DB::table('TGFCAB')->where('NUNOTA', $nunota)->first())], 201);
    }

    public function update(Request $r, $id)
    {
        $emp = $this->emp($r);
        DB::transaction(function () use ($r, $emp, $id) {
            DB::table('TGFCAB')->where('NUNOTA', $id)->update($this->cabColumns($r, $emp));
            if (is_array($r->input('items'))) $this->saveItems((int) $id, $r->input('items'));
            if (is_array($r->input('payments'))) $this->savePayments((int) $id, $r->input('payments'));
        });
        $c = DB::table('TGFCAB')->where('NUNOTA', $id)->first();
        if (!$c) return response()->json(['code' => 'NOT_FOUND', 'status' => 404], 404);
        return response()->json(['data' => $this->shape($c)]);
    }

    public function destroy($id)
    {
        DB::table('TGFCAB')->where('NUNOTA', $id)->delete();
        return response()->noContent();
    }
}
