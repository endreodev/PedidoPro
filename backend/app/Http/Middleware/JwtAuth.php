<?php

namespace App\Http\Middleware;

use App\Support\Jwt;
use Closure;
use Illuminate\Http\Request;

class JwtAuth
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();
        $payload = Jwt::decode($token);
        if (!$payload) {
            return response()->json([
                'code' => 'UNAUTHENTICATED',
                'title' => 'Não autenticado',
                'status' => 401,
            ], 401);
        }
        $request->attributes->set('codusu', $payload['sub'] ?? null);
        $request->attributes->set('perfil', $payload['perfil'] ?? null);
        return $next($request);
    }
}
