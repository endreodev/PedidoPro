<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ParametroController extends Controller
{
    private function emp(Request $r): int { return (int) ($r->header('X-Empresa') ?: 1); }

    private function shape($p): array
    {
        return [
            'chave' => $p->CHAVE,
            'valor' => $p->TEXTO,
            'tipo' => $p->TIPO,
            'descricao' => $p->DESCRICAO,
            'editavel' => $p->EDITAVEL === 'S',
            'company_id' => $p->CODEMP === 0 ? null : (string) $p->CODEMP,
        ];
    }

    public function index(Request $r)
    {
        $emp = $this->emp($r);
        $rows = DB::table('TSIPAR')
            ->where(fn ($w) => $w->where('CODEMP', 0)->orWhere('CODEMP', $emp))
            ->orderBy('CHAVE')->get()->map(fn ($p) => $this->shape($p));
        return response()->json(['data' => $rows]);
    }

    public function update(Request $r, $chave)
    {
        DB::table('TSIPAR')->where('CHAVE', $chave)->update(['TEXTO' => (string) $r->input('valor')]);
        $p = DB::table('TSIPAR')->where('CHAVE', $chave)->first();
        if (!$p) return response()->json(['code' => 'NOT_FOUND', 'status' => 404], 404);
        return response()->json(['data' => $this->shape($p)]);
    }
}
