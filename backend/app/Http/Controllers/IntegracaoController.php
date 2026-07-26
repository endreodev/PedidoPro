<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class IntegracaoController extends Controller
{
    private function emp(Request $r): int { return (int) ($r->header('X-Empresa') ?: 1); }

    // ---------- Gestão de tokens (JWT admin) ----------
    public function listarTokens(Request $r)
    {
        $rows = DB::table('TSIINTEGR')->where('CODEMP', $this->emp($r))->orderByDesc('CODINTEG')->get()->map(fn ($t) => [
            'id' => (string) $t->CODINTEG,
            'descricao' => $t->DESCRICAO,
            'token_mascarado' => substr($t->TOKEN, 0, 6) . '••••••' . substr($t->TOKEN, -4),
            'ativo' => $t->ATIVO === 'S',
            'criado_em' => $t->DHCRIACAO,
        ]);
        return response()->json(['data' => $rows]);
    }

    public function gerarToken(Request $r)
    {
        $token = 'pp_' . Str::random(48);
        $id = DB::table('TSIINTEGR')->insertGetId([
            'CODEMP' => $this->emp($r),
            'DESCRICAO' => (string) ($r->input('descricao') ?: 'Extensão Chrome'),
            'TOKEN' => $token,
            'ATIVO' => 'S',
        ], 'CODINTEG');
        // Retorna o token completo UMA vez (depois só mascarado).
        return response()->json(['data' => ['id' => (string) $id, 'token' => $token]], 201);
    }

    public function revogarToken(Request $r, $id)
    {
        DB::table('TSIINTEGR')->where('CODINTEG', $id)->update(['ATIVO' => 'N']);
        return response()->noContent();
    }

    // ---------- Recepção de contatos (auth por token de integração) ----------
    private function upsertCliente(int $emp, string $canal, ?string $name, ?string $phone): array
    {
        $name = trim((string) $name);
        $phoneDigits = preg_replace('/\D/', '', (string) $phone);
        if ($name === '' && $phoneDigits === '') return ['ok' => false, 'motivo' => 'sem dados'];

        // Deduplica por telefone (dígitos) dentro da empresa.
        $existing = null;
        if ($phoneDigits !== '') {
            $existing = DB::table('TGFPAR')->where('CODEMP', $emp)
                ->whereRaw("REGEXP_REPLACE(COALESCE(TELEFONE,''), '[^0-9]', '') = ?", [$phoneDigits])
                ->first();
        }
        if (!$existing && $name !== '') {
            $existing = DB::table('TGFPAR')->where('CODEMP', $emp)->where('NOMEPARC', $name)->first();
        }

        if ($existing) {
            // Completa nome/telefone se estiverem vazios.
            $upd = [];
            if ($name !== '' && !$existing->NOMEPARC) $upd['NOMEPARC'] = $name;
            if ($phone && !$existing->TELEFONE) $upd['TELEFONE'] = $phone;
            if ($upd) DB::table('TGFPAR')->where('CODPARC', $existing->CODPARC)->update($upd);
            return ['ok' => true, 'novo' => false, 'id' => (int) $existing->CODPARC];
        }

        $id = DB::table('TGFPAR')->insertGetId([
            'CODEMP' => $emp,
            'NOMEPARC' => $name !== '' ? $name : $phone,
            'TELEFONE' => $phone,
            'TIPPESSOA' => 'F',
            'CLIENTE' => 'S',
            'ATIVO' => 'S',
            'PAIS' => 'Brasil',
        ], 'CODPARC');

        DB::table('TSIAUD')->insert([
            'CODEMP' => $emp, 'ENTIDADE' => 'TGFPAR', 'CHAVEREG' => "CODPARC=$id",
            'ACAO' => 'INSERT', 'ORIGEM' => 'INTEGRACAO', 'CANAL' => $canal,
            'OBSERVACAO' => 'Contato importado via extensão',
        ]);
        return ['ok' => true, 'novo' => true, 'id' => $id];
    }

    public function criarCliente(Request $r)
    {
        $emp = (int) $r->attributes->get('codemp');
        $canal = (string) $r->attributes->get('canal');
        $res = $this->upsertCliente($emp, $canal, $r->input('name'), $r->input('phone'));
        if (!$res['ok']) return response()->json(['code' => 'VALIDATION_ERROR', 'status' => 422, 'detail' => $res['motivo']], 422);
        return response()->json(['data' => $res], 201);
    }

    public function sincronizar(Request $r)
    {
        $emp = (int) $r->attributes->get('codemp');
        $canal = (string) $r->attributes->get('canal');
        $contatos = $r->input('contatos', []);
        $criados = 0; $existentes = 0; $ignorados = 0;
        foreach ($contatos as $c) {
            $res = $this->upsertCliente($emp, $canal, $c['name'] ?? null, $c['phone'] ?? null);
            if (!$res['ok']) { $ignorados++; continue; }
            $res['novo'] ? $criados++ : $existentes++;
        }
        return response()->json(['data' => [
            'recebidos' => count($contatos),
            'criados' => $criados,
            'existentes' => $existentes,
            'ignorados' => $ignorados,
        ]]);
    }
}
