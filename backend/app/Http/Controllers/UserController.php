<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    private function emp(Request $r): int { return (int) ($r->header('X-Empresa') ?: 1); }

    private function shape($u): array
    {
        return [
            'id' => (string) $u->CODUSU,
            'name' => $u->NOMEUSU,
            'email' => $u->EMAIL,
            'role' => strtolower($u->PERFIL),
            'status' => $u->ATIVO === 'S' ? 'active' : 'inactive',
            'joined_at' => $u->DHCRIACAO ? substr($u->DHCRIACAO, 0, 10) : '',
            'last_login' => $u->DHULTLOGIN ? substr($u->DHULTLOGIN, 0, 10) : null,
        ];
    }

    public function index()
    {
        $rows = DB::table('TSIUSU')->orderBy('CODUSU')->get()->map(fn ($u) => $this->shape($u));
        return response()->json(['data' => $rows]);
    }

    public function store(Request $r)
    {
        $id = DB::table('TSIUSU')->insertGetId([
            'NOMEUSU' => (string) $r->input('name'),
            'EMAIL' => (string) $r->input('email'),
            'SENHA' => Hash::make($r->input('password') ?: 'demo'),
            'PERFIL' => strtoupper((string) $r->input('role', 'vendedor')),
            'ATIVO' => $r->input('status', 'active') === 'active' ? 'S' : 'N',
        ], 'CODUSU');
        // Vincula à empresa ativa
        DB::table('TSIUSUEMP')->insertOrIgnore(['CODUSU' => $id, 'CODEMP' => $this->emp($r)]);
        return response()->json(['data' => $this->shape(DB::table('TSIUSU')->where('CODUSU', $id)->first())], 201);
    }

    public function update(Request $r, $id)
    {
        DB::table('TSIUSU')->where('CODUSU', $id)->update([
            'NOMEUSU' => (string) $r->input('name'),
            'EMAIL' => (string) $r->input('email'),
            'PERFIL' => strtoupper((string) $r->input('role', 'vendedor')),
            'ATIVO' => $r->input('status', 'active') === 'active' ? 'S' : 'N',
        ]);
        $u = DB::table('TSIUSU')->where('CODUSU', $id)->first();
        if (!$u) return response()->json(['code' => 'NOT_FOUND', 'status' => 404], 404);
        return response()->json(['data' => $this->shape($u)]);
    }

    public function destroy($id)
    {
        DB::table('TSIUSU')->where('CODUSU', $id)->delete();
        return response()->noContent();
    }
}
