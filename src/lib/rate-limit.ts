// Rate limiting simples em memória, por processo.
// Mitiga abuso das rotas de IA. Para escala maior, trocar por Redis/Upstash.
const hits = new Map<string, number[]>();

/**
 * Retorna `true` se a requisição é permitida, `false` se excedeu o limite.
 * @param key    identificador (ex.: `chat:<userId>`)
 * @param limit  número máximo de requisições na janela
 * @param windowMs  janela de tempo em milissegundos
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}
