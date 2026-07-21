import { Product, PriceTier } from '../types'

/**
 * Preço unitário aplicável para uma quantidade, considerando as faixas do produto.
 * A faixa base (qty_min = 1) é o preço padrão do produto (product.price).
 * Retorna o preço da maior faixa cujo qty_min <= qty.
 */
export function unitPriceForQty(product: Product, qty: number): number {
  const tiers: PriceTier[] = [
    { qty_min: 1, unit_price: product.price },
    ...(product.price_tiers ?? []),
  ].sort((a, b) => a.qty_min - b.qty_min)

  let price = product.price
  for (const t of tiers) {
    if (qty >= t.qty_min) price = t.unit_price
  }
  return price
}

/** Rótulo da faixa aplicada (ex.: "Cento"), se houver. */
export function tierLabelForQty(product: Product, qty: number): string {
  let label = ''
  for (const t of (product.price_tiers ?? []).slice().sort((a, b) => a.qty_min - b.qty_min)) {
    if (qty >= t.qty_min) label = t.label ?? ''
  }
  return label
}
