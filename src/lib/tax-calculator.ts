export type TaxRegime = "new" | "old";

type Slab = { upto: number; rate: number };

// FY 2025-26 (AY 2026-27) slabs. Estimate only — ignores HRA/other exemptions, consult a CA.
const NEW_REGIME_SLABS: Slab[] = [
  { upto: 400_000, rate: 0 },
  { upto: 800_000, rate: 0.05 },
  { upto: 1_200_000, rate: 0.1 },
  { upto: 1_600_000, rate: 0.15 },
  { upto: 2_000_000, rate: 0.2 },
  { upto: 2_400_000, rate: 0.25 },
  { upto: Infinity, rate: 0.3 },
];

const OLD_REGIME_SLABS: Slab[] = [
  { upto: 250_000, rate: 0 },
  { upto: 500_000, rate: 0.05 },
  { upto: 1_000_000, rate: 0.2 },
  { upto: Infinity, rate: 0.3 },
];

const STANDARD_DEDUCTION: Record<TaxRegime, number> = { new: 75_000, old: 50_000 };
const REBATE_87A_LIMIT: Record<TaxRegime, number> = { new: 1_200_000, old: 500_000 };
const CESS_RATE = 0.04;

function slabTax(taxableIncome: number, slabs: Slab[]): number {
  let tax = 0;
  let lower = 0;
  for (const slab of slabs) {
    if (taxableIncome <= lower) break;
    tax += (Math.min(taxableIncome, slab.upto) - lower) * slab.rate;
    lower = slab.upto;
  }
  return tax;
}

export type TaxResult = {
  taxableIncome: number;
  taxBeforeCess: number;
  cess: number;
  totalTax: number;
  inHandAnnual: number;
  inHandMonthly: number;
  effectiveRate: number;
};

export function calculateTax(grossIncome: number, regime: TaxRegime, deductions80C = 0): TaxResult {
  const standardDeduction = STANDARD_DEDUCTION[regime];
  const otherDeductions = regime === "old" ? Math.min(deductions80C, 150_000) : 0;
  const taxableIncome = Math.max(0, grossIncome - standardDeduction - otherDeductions);

  const slabs = regime === "new" ? NEW_REGIME_SLABS : OLD_REGIME_SLABS;
  let tax = slabTax(taxableIncome, slabs);

  if (taxableIncome <= REBATE_87A_LIMIT[regime]) {
    tax = 0;
  }

  const cess = tax * CESS_RATE;
  const totalTax = tax + cess;

  return {
    taxableIncome: Math.round(taxableIncome),
    taxBeforeCess: Math.round(tax),
    cess: Math.round(cess),
    totalTax: Math.round(totalTax),
    inHandAnnual: Math.round(grossIncome - totalTax),
    inHandMonthly: Math.round((grossIncome - totalTax) / 12),
    effectiveRate: grossIncome > 0 ? Math.round((totalTax / grossIncome) * 1000) / 10 : 0,
  };
}
