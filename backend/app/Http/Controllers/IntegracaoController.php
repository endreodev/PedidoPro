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

    // ---------- Orçamentos para envio pelo WhatsApp (auth por token) ----------

    // Normaliza para dígitos com DDI 55 (formato aceito pelo WhatsApp).
    private function normalizarTelefone(?string $tel): ?string
    {
        $d = preg_replace('/\D/', '', (string) $tel);
        if ($d === '') return null;
        if (!str_starts_with($d, '55') && strlen($d) >= 10 && strlen($d) <= 11) $d = '55' . $d;
        return strlen($d) >= 12 ? $d : null;
    }

    private function brl($v): string
    {
        return 'R$ ' . number_format((float) $v, 2, ',', '.');
    }

    // Hash do conteúdo do orçamento: muda quando qualquer item/valor/status muda.
    private function hashOrcamento($cab, $itens): string
    {
        $base = $cab->NUNOTA . '|' . $cab->STATUS . '|' . $cab->CODPARC . '|' . $cab->VLRTOT;
        foreach ($itens as $it) {
            $base .= '|' . $it->CODPROD . ':' . $it->QTDNEG . ':' . $it->VLRUNIT . ':' . $it->VLRTOT;
        }
        return md5($base);
    }

    private function montarMensagem($cab, $nome, $itens): string
    {
        $linhas = [];
        $linhas[] = "*Orçamento Nº {$cab->NUNOTA}*";
        $nome = trim((string) $nome);
        $linhas[] = 'Olá' . ($nome !== '' ? " {$nome}" : '') . '! Segue o seu orçamento:';
        $linhas[] = '';
        foreach ($itens as $it) {
            $qtd = rtrim(rtrim(number_format((float) $it->QTDNEG, 3, ',', '.'), '0'), ',');
            $linhas[] = "• {$qtd}x {$it->DESCRPROD} — " . $this->brl($it->VLRTOT);
        }
        $linhas[] = '';
        $linhas[] = '*Total: ' . $this->brl($cab->VLRTOT) . '*';
        $linhas[] = '';
        $linhas[] = 'Qualquer dúvida estamos à disposição! 💜';
        return implode("\n", $linhas);
    }

    public function orcamentosPendentes(Request $r)
    {
        $emp = (int) $r->attributes->get('codemp');
        $cabs = DB::table('TGFCAB as c')
            ->join('TGFPAR as p', 'p.CODPARC', '=', 'c.CODPARC')
            ->where('c.CODEMP', $emp)
            ->where('c.STATUS', 'ORCAMENTO')
            ->whereNotNull('p.TELEFONE')->where('p.TELEFONE', '<>', '')
            ->select('c.NUNOTA', 'c.STATUS', 'c.CODPARC', 'c.VLRTOT', 'p.NOMEPARC', 'p.TELEFONE')
            ->orderBy('c.NUNOTA')
            ->get();

        $pendentes = [];
        foreach ($cabs as $cab) {
            $telefone = $this->normalizarTelefone($cab->TELEFONE);
            if (!$telefone) continue;

            $itens = DB::table('TGFITE as i')
                ->join('TGFPRO as pr', 'pr.CODPROD', '=', 'i.CODPROD')
                ->where('i.NUNOTA', $cab->NUNOTA)
                ->select('i.CODPROD', 'i.QTDNEG', 'i.VLRUNIT', 'i.VLRTOT', 'pr.DESCRPROD')
                ->orderBy('i.SEQUENCIA')->get();
            if ($itens->isEmpty()) continue;

            $hash = $this->hashOrcamento($cab, $itens);
            $enviado = DB::table('TSIORCWA')->where('NUNOTA', $cab->NUNOTA)->first();
            if ($enviado && $enviado->HASHENVIO === $hash) continue; // já enviado e sem alteração

            $pendentes[] = [
                'nunota' => (int) $cab->NUNOTA,
                'telefone' => $telefone,
                'cliente' => $cab->NOMEPARC,
                'hash' => $hash,
                'reenvio' => (bool) $enviado,
                'mensagem' => $this->montarMensagem($cab, $cab->NOMEPARC, $itens),
            ];
        }

        return response()->json(['data' => $pendentes]);
    }

    public function marcarOrcamentoEnviado(Request $r)
    {
        $emp = (int) $r->attributes->get('codemp');
        $canal = (string) $r->attributes->get('canal');
        $nunota = (int) $r->input('nunota');
        $hash = (string) $r->input('hash');
        if (!$nunota || $hash === '') {
            return response()->json(['code' => 'VALIDATION_ERROR', 'status' => 422, 'detail' => 'nunota e hash são obrigatórios'], 422);
        }
        // Garante que o orçamento é da empresa do token.
        $cab = DB::table('TGFCAB')->where('NUNOTA', $nunota)->where('CODEMP', $emp)->first();
        if (!$cab) {
            return response()->json(['code' => 'NOT_FOUND', 'status' => 404, 'detail' => 'orçamento não encontrado'], 404);
        }
        DB::statement(
            'INSERT INTO TSIORCWA (NUNOTA, HASHENVIO, DHENVIO) VALUES (?, ?, NOW())
             ON DUPLICATE KEY UPDATE HASHENVIO = VALUES(HASHENVIO), DHENVIO = NOW()',
            [$nunota, $hash]
        );
        DB::table('TSIAUD')->insert([
            'CODEMP' => $emp, 'ENTIDADE' => 'TGFCAB', 'CHAVEREG' => "NUNOTA=$nunota",
            'ACAO' => 'UPDATE', 'ORIGEM' => 'INTEGRACAO', 'CANAL' => $canal,
            'OBSERVACAO' => 'Orçamento enviado pelo WhatsApp',
        ]);
        return response()->json(['data' => ['nunota' => $nunota, 'ok' => true]]);
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
