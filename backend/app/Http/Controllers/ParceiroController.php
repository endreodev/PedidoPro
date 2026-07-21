<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ParceiroController extends Controller
{
    private function emp(Request $r): int { return (int) ($r->header('X-Empresa') ?: 1); }

    private function shape($p): array
    {
        return [
            'id' => (string) $p->CODPARC,
            'name' => $p->NOMEPARC,
            'document' => $p->CGC_CPF ?? '',
            'phone' => $p->TELEFONE ?? '',
            'email' => $p->EMAIL ?? '',
            'cep' => $p->CEP ?? '',
            'address' => $p->ENDERECO ?? '',
            'number' => $p->NUMERO ?? '',
            'complement' => $p->COMPLEMENTO ?? '',
            'neighborhood' => $p->BAIRRO ?? '',
            'city' => $p->CIDADE ?? '',
            'state' => $p->UF ?? '',
            'tipo_pessoa' => $p->TIPPESSOA ?? 'F',
            'fantasia' => $p->FANTASIA ?? '',
            'inscricao_estadual' => $p->INSCEST ?? '',
            'indicador_ie' => $p->INDIE ?? 'nao_contribuinte',
            'inscricao_municipal' => $p->INSCMUN ?? '',
            'codigo_municipio' => $p->CODMUN ?? '',
            'pais' => $p->PAIS ?? 'Brasil',
            'total_purchases' => (float) $p->VLRTOTCOMPRAS,
            'company_id' => (string) $p->CODEMP,
        ];
    }

    private function cols(Request $r, int $emp): array
    {
        return [
            'CODEMP' => $emp,
            'NOMEPARC' => (string) $r->input('name'),
            'CGC_CPF' => $r->input('document'),
            'TELEFONE' => $r->input('phone'),
            'EMAIL' => $r->input('email'),
            'CEP' => $r->input('cep'),
            'ENDERECO' => $r->input('address'),
            'NUMERO' => $r->input('number'),
            'COMPLEMENTO' => $r->input('complement'),
            'BAIRRO' => $r->input('neighborhood'),
            'CIDADE' => $r->input('city'),
            'UF' => $r->input('state'),
            'TIPPESSOA' => $r->input('tipo_pessoa', 'F'),
            'FANTASIA' => $r->input('fantasia'),
            'INSCEST' => $r->input('inscricao_estadual'),
            'INDIE' => $r->input('indicador_ie'),
            'INSCMUN' => $r->input('inscricao_municipal'),
            'CODMUN' => $r->input('codigo_municipio'),
            'PAIS' => $r->input('pais', 'Brasil'),
            'VLRTOTCOMPRAS' => (float) $r->input('total_purchases', 0),
            'CLIENTE' => 'S',
            'ATIVO' => 'S',
        ];
    }

    public function index(Request $r)
    {
        $rows = DB::table('TGFPAR')->where('CODEMP', $this->emp($r))->orderBy('NOMEPARC')
            ->get()->map(fn ($p) => $this->shape($p));
        return response()->json(['data' => $rows]);
    }

    public function store(Request $r)
    {
        $id = DB::table('TGFPAR')->insertGetId($this->cols($r, $this->emp($r)), 'CODPARC');
        return response()->json(['data' => $this->shape(DB::table('TGFPAR')->where('CODPARC', $id)->first())], 201);
    }

    public function update(Request $r, $id)
    {
        DB::table('TGFPAR')->where('CODPARC', $id)->update($this->cols($r, $this->emp($r)));
        $p = DB::table('TGFPAR')->where('CODPARC', $id)->first();
        if (!$p) return response()->json(['code' => 'NOT_FOUND', 'status' => 404], 404);
        return response()->json(['data' => $this->shape($p)]);
    }

    public function destroy($id)
    {
        DB::table('TGFPAR')->where('CODPARC', $id)->delete();
        return response()->noContent();
    }
}
