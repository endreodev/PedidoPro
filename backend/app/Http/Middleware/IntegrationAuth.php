<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class IntegrationAuth
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->header('X-Integration-Key') ?: $request->bearerToken();
        $row = $token ? DB::table('TSIINTEGR')->where('TOKEN', $token)->where('ATIVO', 'S')->first() : null;
        if (!$row) {
            return response()->json([
                'code' => 'UNAUTHENTICATED',
                'title' => 'Token de integração inválido',
                'status' => 401,
            ], 401);
        }
        $request->attributes->set('codemp', (int) $row->CODEMP);
        $request->attributes->set('canal', $row->DESCRICAO);
        return $next($request);
    }
}
