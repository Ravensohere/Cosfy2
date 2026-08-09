export function roundUpFor(amount: number, increment: number): number {
  if (increment <= 0 || amount <= 0) return 0;
  const remainder = amount % increment;
  if (remainder === 0) return 0;
  return Math.round((increment - remainder) * 100) / 100;
}
