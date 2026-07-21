<?php

namespace App\Support;

class Jwt
{
    private static function secret(): string
    {
        return (string) (env('JWT_SECRET') ?: config('app.key'));
    }

    private static function b64(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function b64d(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }

    public static function encode(array $payload): string
    {
        $header = self::b64(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $body = self::b64(json_encode($payload));
        $sig = self::b64(hash_hmac('sha256', "$header.$body", self::secret(), true));
        return "$header.$body.$sig";
    }

    /** Retorna o payload ou null se inválido/expirado. */
    public static function decode(?string $token): ?array
    {
        if (!$token) return null;
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;
        [$h, $b, $s] = $parts;
        $expected = self::b64(hash_hmac('sha256', "$h.$b", self::secret(), true));
        if (!hash_equals($expected, $s)) return null;
        $payload = json_decode(self::b64d($b), true);
        if (!is_array($payload)) return null;
        if (isset($payload['exp']) && time() >= $payload['exp']) return null;
        return $payload;
    }
}
