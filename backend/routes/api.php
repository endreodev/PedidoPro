<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\PaymentFormController;
use App\Http\Controllers\ParametroController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ParceiroController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\CaixaController;
use App\Http\Controllers\NaturezaController;
use App\Http\Controllers\ContaBancariaController;
use App\Http\Controllers\TituloController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

// Health/conectividade
Route::get('/ping', function () {
    return response()->json(['data' => [
        'status' => 'ok',
        'db' => DB::connection()->getDatabaseName(),
        'produtos' => DB::table('TGFPRO')->count(),
        'empresas' => DB::table('TGFEMP')->count(),
    ]]);
});

// Auth
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/auth/me', [AuthController::class, 'me'])->middleware('jwt');

// Recursos protegidos
Route::middleware('jwt')->group(function () {
    Route::get('/produtos', [ProductController::class, 'index']);
    Route::post('/produtos', [ProductController::class, 'store']);
    Route::put('/produtos/{id}', [ProductController::class, 'update']);
    Route::delete('/produtos/{id}', [ProductController::class, 'destroy']);

    Route::get('/grupos-produto', [GroupController::class, 'index']);
    Route::post('/grupos-produto', [GroupController::class, 'store']);
    Route::put('/grupos-produto/{id}', [GroupController::class, 'update']);
    Route::delete('/grupos-produto/{id}', [GroupController::class, 'destroy']);

    Route::get('/unidades', [UnitController::class, 'index']);
    Route::post('/unidades', [UnitController::class, 'store']);
    Route::put('/unidades/{id}', [UnitController::class, 'update']);
    Route::delete('/unidades/{id}', [UnitController::class, 'destroy']);

    Route::get('/formas-pagamento', [PaymentFormController::class, 'index']);
    Route::post('/formas-pagamento', [PaymentFormController::class, 'store']);
    Route::put('/formas-pagamento/{id}', [PaymentFormController::class, 'update']);
    Route::delete('/formas-pagamento/{id}', [PaymentFormController::class, 'destroy']);

    Route::get('/parametros', [ParametroController::class, 'index']);
    Route::put('/parametros/{chave}', [ParametroController::class, 'update']);

    Route::get('/usuarios', [UserController::class, 'index']);
    Route::post('/usuarios', [UserController::class, 'store']);
    Route::put('/usuarios/{id}', [UserController::class, 'update']);
    Route::delete('/usuarios/{id}', [UserController::class, 'destroy']);

    Route::get('/parceiros', [ParceiroController::class, 'index']);
    Route::post('/parceiros', [ParceiroController::class, 'store']);
    Route::put('/parceiros/{id}', [ParceiroController::class, 'update']);
    Route::delete('/parceiros/{id}', [ParceiroController::class, 'destroy']);

    Route::get('/pedidos', [OrderController::class, 'index']);
    Route::post('/pedidos', [OrderController::class, 'store']);
    Route::put('/pedidos/{id}', [OrderController::class, 'update']);
    Route::delete('/pedidos/{id}', [OrderController::class, 'destroy']);

    // Caixa
    Route::get('/caixas', [CaixaController::class, 'index']);
    Route::post('/caixas', [CaixaController::class, 'abrir']);
    Route::post('/caixas/{id}/movimentos', [CaixaController::class, 'movimento']);
    Route::put('/caixas/{id}/fechar', [CaixaController::class, 'fechar']);

    // Financeiro
    Route::get('/financeiro/naturezas', [NaturezaController::class, 'index']);
    Route::post('/financeiro/naturezas', [NaturezaController::class, 'store']);
    Route::put('/financeiro/naturezas/{id}', [NaturezaController::class, 'update']);
    Route::delete('/financeiro/naturezas/{id}', [NaturezaController::class, 'destroy']);

    Route::get('/financeiro/contas-bancarias', [ContaBancariaController::class, 'index']);
    Route::post('/financeiro/contas-bancarias', [ContaBancariaController::class, 'store']);
    Route::put('/financeiro/contas-bancarias/{id}', [ContaBancariaController::class, 'update']);
    Route::delete('/financeiro/contas-bancarias/{id}', [ContaBancariaController::class, 'destroy']);

    Route::get('/financeiro/titulos', [TituloController::class, 'index']);
    Route::post('/financeiro/titulos', [TituloController::class, 'store']);
    Route::put('/financeiro/titulos/{id}', [TituloController::class, 'update']);
    Route::put('/financeiro/titulos/{id}/baixar', [TituloController::class, 'baixar']);
    Route::delete('/financeiro/titulos/{id}', [TituloController::class, 'destroy']);
});
