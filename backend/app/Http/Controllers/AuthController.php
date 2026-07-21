<?php

namespace App\Http\Controllers;

use App\Support\Jwt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    private function empresasDoUsuario(int $codusu)
    {
        return DB::table('TGFEMP')
            ->join('TSIUSUEMP', 'TGFEMP.CODEMP', '=', 'TSIUSUEMP.CODEMP')
            ->where('TSIUSUEMP.CODUSU', $codusu)
            ->select('TGFEMP.*')
            ->get()
            ->map(fn ($e) => [
                'id' => (string) $e->CODEMP,
                'name' => $e->NOMEFANTASIA,
                'cnpj' => $e->CGC,
                'branch' => strtolower($e->RAMO),
                'color' => $e->COR,
            ])->values();
    }

    private function userShape($u): array
    {
        $empresas = $this->empresasDoUsuario($u->CODUSU);
        return [
            'id' => (string) $u->CODUSU,
            'name' => $u->NOMEUSU,
            'email' => $u->EMAIL,
            'role' => strtolower($u->PERFIL),
            'permissions' => [],
            'companies' => $empresas,
            'currentCompanyId' => $empresas[0]['id'] ?? '',
        ];
    }

    public function login(Request $request)
    {
        $email = (string) $request->input('email');
        $password = (string) $request->input('password');

        $u = DB::table('TSIUSU')->where('EMAIL', $email)->where('ATIVO', 'S')->first();
        if (!$u || !Hash::check($password, $u->SENHA)) {
            return response()->json([
                'code' => 'UNAUTHENTICATED',
                'title' => 'Credenciais inválidas',
                'status' => 401,
            ], 401);
        }

        $token = Jwt::encode([
            'sub' => $u->CODUSU,
            'perfil' => $u->PERFIL,
            'exp' => time() + 3600,
        ]);

        return response()->json([
            'data' => [
                'token' => $token,
                'expires_in' => 3600,
                'user' => $this->userShape($u),
            ],
        ]);
    }

    public function me(Request $request)
    {
        $codusu = (int) $request->attributes->get('codusu');
        $u = DB::table('TSIUSU')->where('CODUSU', $codusu)->first();
        if (!$u) {
            return response()->json(['code' => 'NOT_FOUND', 'status' => 404], 404);
        }
        return response()->json(['data' => $this->userShape($u)]);
    }
}
