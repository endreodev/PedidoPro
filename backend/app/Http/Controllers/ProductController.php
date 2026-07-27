<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    private function empresa(Request $r): int
    {
        return (int) ($r->header('X-Empresa') ?: 1);
    }

    private function compartilha(): bool
    {
        return DB::table('TSIPAR')->where('CHAVE', 'COMPARTILHA_PRODUTO_FILIAIS')->value('TEXTO') === 'S';
    }

    private function shape($p): array
    {
        $tiers = DB::table('TGFPRECO')->where('CODPROD', $p->CODPROD)->orderBy('QTDMIN')->get()->map(fn ($t) => [
            'qty_min' => (float) $t->QTDMIN,
            'unit_price' => (float) $t->VLRUNIT,
            'label' => $t->DESCRICAO ?? '',
        ]);
        $flavors = DB::table('TGFPROSAB')->where('CODPROD', $p->CODPROD)->orderBy('SEQUENCIA')->pluck('DESCRSABOR');
        return [
            'id' => (string) $p->CODPROD,
            'name' => $p->DESCRPROD,
            'sku' => $p->REFERENCIA,
            'group_id' => $p->CODGRUPOPROD === null ? '' : (string) $p->CODGRUPOPROD,
            'unit_id' => $p->CODVOL ?? '',
            'price' => (float) $p->VLRVENDA,
            'custo_medio' => (float) $p->CUSTOMEDIO,
            'stock' => (float) $p->ESTOQUE,
            'min_stock' => (float) $p->ESTMIN,
            'price_tiers' => $tiers,
            'flavors' => $flavors,
            'company_id' => $p->CODEMP === null ? '' : (string) $p->CODEMP,
        ];
    }

    private function saveFlavors(int $codprod, $flavors): void
    {
        DB::table('TGFPROSAB')->where('CODPROD', $codprod)->delete();
        if (!is_array($flavors)) return;
        $seq = 1;
        foreach ($flavors as $f) {
            $desc = trim((string) $f);
            if ($desc === '') continue;
            DB::table('TGFPROSAB')->insert([
                'CODPROD' => $codprod,
                'SEQUENCIA' => $seq++,
                'DESCRSABOR' => mb_substr($desc, 0, 80),
            ]);
        }
    }

    private function saveTiers(int $codprod, $tiers): void
    {
        DB::table('TGFPRECO')->where('CODPROD', $codprod)->delete();
        if (!is_array($tiers)) return;
        $seq = 1;
        foreach ($tiers as $t) {
            DB::table('TGFPRECO')->insert([
                'CODPROD' => $codprod,
                'SEQUENCIA' => $seq++,
                'QTDMIN' => (float) ($t['qty_min'] ?? 1),
                'VLRUNIT' => (float) ($t['unit_price'] ?? 0),
                'DESCRICAO' => $t['label'] ?? null,
            ]);
        }
    }

    private function toColumns(Request $r, int $emp): array
    {
        // Compartilhado => CODEMP null; exclusivo => empresa ativa.
        $codemp = $this->compartilha() ? null : $emp;
        return [
            'CODEMP' => $codemp,
            'DESCRPROD' => (string) $r->input('name'),
            'REFERENCIA' => $r->input('sku'),
            'CODGRUPOPROD' => $r->input('group_id') ?: null,
            'CODVOL' => $r->input('unit_id') ?: null,
            'VLRVENDA' => (float) $r->input('price', 0),
            'CUSTOMEDIO' => (float) $r->input('custo_medio', 0),
            'ESTOQUE' => (float) $r->input('stock', 0),
            'ESTMIN' => (float) $r->input('min_stock', 0),
            'ATIVO' => 'S',
        ];
    }

    public function index(Request $r)
    {
        $emp = $this->empresa($r);
        $share = $this->compartilha();
        $rows = DB::table('TGFPRO')
            ->where(function ($w) use ($emp, $share) {
                $w->where('CODEMP', $emp);
                if ($share) $w->orWhereNull('CODEMP');
            })
            ->orderBy('CODPROD')
            ->get()
            ->map(fn ($p) => $this->shape($p));

        return response()->json(['data' => $rows]);
    }

    public function store(Request $r)
    {
        $emp = $this->empresa($r);
        $id = DB::table('TGFPRO')->insertGetId($this->toColumns($r, $emp), 'CODPROD');
        $this->saveTiers($id, $r->input('price_tiers'));
        $this->saveFlavors($id, $r->input('flavors'));
        $p = DB::table('TGFPRO')->where('CODPROD', $id)->first();
        return response()->json(['data' => $this->shape($p)], 201);
    }

    public function update(Request $r, $id)
    {
        $emp = $this->empresa($r);
        DB::table('TGFPRO')->where('CODPROD', $id)->update($this->toColumns($r, $emp));
        if ($r->has('price_tiers')) $this->saveTiers((int) $id, $r->input('price_tiers'));
        if ($r->has('flavors')) $this->saveFlavors((int) $id, $r->input('flavors'));
        $p = DB::table('TGFPRO')->where('CODPROD', $id)->first();
        if (!$p) return response()->json(['code' => 'NOT_FOUND', 'status' => 404], 404);
        return response()->json(['data' => $this->shape($p)]);
    }

    public function destroy($id)
    {
        DB::table('TGFPRO')->where('CODPROD', $id)->delete();
        return response()->noContent();
    }
}
