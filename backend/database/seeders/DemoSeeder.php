<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        foreach (['TGFITE','TGFCAB','TGFEST','TGFPRO','TGFGRU','TGFVOL','TGFTPV','TGFPAR','TSIUSUEMP','TSIUSU','TSIAUD','TGFEMP'] as $t) {
            DB::table($t)->delete();
        }
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        DB::table('TGFEMP')->insert([
            ['CODEMP' => 1, 'RAZAOSOCIAL' => 'Loja Matriz LTDA', 'NOMEFANTASIA' => 'Loja Matriz', 'CGC' => '11.111.111/0001-11', 'RAMO' => 'VAREJO', 'COR' => '#4b57d6', 'ATIVO' => 'S'],
            ['CODEMP' => 2, 'RAZAOSOCIAL' => 'Filial Centro LTDA', 'NOMEFANTASIA' => 'Filial Centro', 'CGC' => '22.222.222/0001-22', 'RAMO' => 'ALIMENTACAO', 'COR' => '#1f9d6b', 'ATIVO' => 'S'],
        ]);

        $senha = Hash::make('demo');
        DB::table('TSIUSU')->insert([
            ['CODUSU' => 1, 'NOMEUSU' => 'Ana Administradora', 'EMAIL' => 'admin@pedidospro.com', 'SENHA' => $senha, 'PERFIL' => 'ADMINISTRADOR', 'ATIVO' => 'S'],
            ['CODUSU' => 2, 'NOMEUSU' => 'Vitor Vendedor', 'EMAIL' => 'vendedor@pedidospro.com', 'SENHA' => $senha, 'PERFIL' => 'VENDEDOR', 'ATIVO' => 'S'],
            ['CODUSU' => 3, 'NOMEUSU' => 'Carla Caixa', 'EMAIL' => 'caixa@pedidospro.com', 'SENHA' => $senha, 'PERFIL' => 'CAIXA', 'ATIVO' => 'S'],
        ]);
        DB::table('TSIUSUEMP')->insert([
            ['CODUSU' => 1, 'CODEMP' => 1], ['CODUSU' => 1, 'CODEMP' => 2],
            ['CODUSU' => 2, 'CODEMP' => 1], ['CODUSU' => 3, 'CODEMP' => 1],
        ]);

        DB::table('TGFGRU')->insert([
            ['CODGRUPOPROD' => 1, 'CODEMP' => 1, 'DESCRGRUPOPROD' => 'Bebidas', 'COR' => '#3a7bd5', 'ATIVO' => 'S'],
            ['CODGRUPOPROD' => 2, 'CODEMP' => 1, 'DESCRGRUPOPROD' => 'Alimentos', 'COR' => '#d98a24', 'ATIVO' => 'S'],
            ['CODGRUPOPROD' => 3, 'CODEMP' => 1, 'DESCRGRUPOPROD' => 'Limpeza', 'COR' => '#2f9e8f', 'ATIVO' => 'S'],
        ]);

        DB::table('TGFVOL')->insert([
            ['CODVOL' => 'UN', 'CODEMP' => 1, 'DESCRVOL' => 'Unidade'],
            ['CODVOL' => 'KG', 'CODEMP' => 1, 'DESCRVOL' => 'Quilograma'],
            ['CODVOL' => 'CX', 'CODEMP' => 1, 'DESCRVOL' => 'Caixa'],
            ['CODVOL' => 'L', 'CODEMP' => 1, 'DESCRVOL' => 'Litro'],
        ]);

        DB::table('TGFPRO')->insert([
            ['CODPROD' => 1, 'CODEMP' => null, 'DESCRPROD' => 'Coca-Cola 2L', 'REFERENCIA' => 'BEB-001', 'CODGRUPOPROD' => 1, 'CODVOL' => 'UN', 'VLRVENDA' => 9.90, 'CUSTOMEDIO' => 6.50, 'ESTOQUE' => 48, 'ESTMIN' => 10, 'ATIVO' => 'S'],
            ['CODPROD' => 2, 'CODEMP' => null, 'DESCRPROD' => 'Água Mineral 500ml', 'REFERENCIA' => 'BEB-002', 'CODGRUPOPROD' => 1, 'CODVOL' => 'UN', 'VLRVENDA' => 2.50, 'CUSTOMEDIO' => 1.20, 'ESTOQUE' => 120, 'ESTMIN' => 20, 'ATIVO' => 'S'],
            ['CODPROD' => 3, 'CODEMP' => 1, 'DESCRPROD' => 'Arroz Tipo 1 5kg', 'REFERENCIA' => 'ALI-001', 'CODGRUPOPROD' => 2, 'CODVOL' => 'KG', 'VLRVENDA' => 24.90, 'CUSTOMEDIO' => 18.00, 'ESTOQUE' => 8, 'ESTMIN' => 10, 'ATIVO' => 'S'],
            ['CODPROD' => 4, 'CODEMP' => 1, 'DESCRPROD' => 'Feijão Carioca 1kg', 'REFERENCIA' => 'ALI-002', 'CODGRUPOPROD' => 2, 'CODVOL' => 'KG', 'VLRVENDA' => 8.50, 'CUSTOMEDIO' => 5.90, 'ESTOQUE' => 3, 'ESTMIN' => 10, 'ATIVO' => 'S'],
            ['CODPROD' => 5, 'CODEMP' => 1, 'DESCRPROD' => 'Detergente Neutro', 'REFERENCIA' => 'LIM-001', 'CODGRUPOPROD' => 3, 'CODVOL' => 'UN', 'VLRVENDA' => 3.20, 'CUSTOMEDIO' => 1.80, 'ESTOQUE' => 60, 'ESTMIN' => 15, 'ATIVO' => 'S'],
        ]);

        DB::table('TGFTPV')->insert([
            ['CODTIPVENDA' => 1, 'CODEMP' => 1, 'DESCRTIPVENDA' => 'Dinheiro', 'TIPO' => 'DINHEIRO', 'TAXA' => 0, 'PRAZO' => 0, 'ATIVO' => 'S'],
            ['CODTIPVENDA' => 2, 'CODEMP' => 1, 'DESCRTIPVENDA' => 'Pix', 'TIPO' => 'PIX', 'TAXA' => 0, 'PRAZO' => 0, 'ATIVO' => 'S'],
            ['CODTIPVENDA' => 3, 'CODEMP' => 1, 'DESCRTIPVENDA' => 'Cartão de Crédito', 'TIPO' => 'CARTAO', 'TAXA' => 2.5, 'PRAZO' => 30, 'ATIVO' => 'S'],
            ['CODTIPVENDA' => 4, 'CODEMP' => 1, 'DESCRTIPVENDA' => 'Boleto', 'TIPO' => 'BOLETO', 'TAXA' => 1, 'PRAZO' => 3, 'ATIVO' => 'N'],
        ]);

        DB::table('TGFPAR')->insert([
            ['CODPARC' => 1, 'CODEMP' => 1, 'NOMEPARC' => 'João Silva', 'TIPPESSOA' => 'F', 'CGC_CPF' => '123.456.789-00', 'TELEFONE' => '(11) 98888-1111', 'EMAIL' => 'joao@email.com', 'CIDADE' => 'São Paulo', 'CLIENTE' => 'S', 'ATIVO' => 'S'],
            ['CODPARC' => 2, 'CODEMP' => 1, 'NOMEPARC' => 'Maria Souza', 'TIPPESSOA' => 'F', 'CGC_CPF' => '987.654.321-00', 'TELEFONE' => '(11) 97777-2222', 'EMAIL' => 'maria@email.com', 'CIDADE' => 'Campinas', 'CLIENTE' => 'S', 'ATIVO' => 'S'],
            ['CODPARC' => 3, 'CODEMP' => 1, 'NOMEPARC' => 'Comércio XYZ Ltda', 'TIPPESSOA' => 'J', 'CGC_CPF' => '12.345.678/0001-90', 'TELEFONE' => '(11) 3333-4444', 'EMAIL' => 'contato@xyz.com', 'CIDADE' => 'Guarulhos', 'CLIENTE' => 'S', 'ATIVO' => 'S'],
        ]);
    }
}
