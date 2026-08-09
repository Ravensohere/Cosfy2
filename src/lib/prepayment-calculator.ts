export type PrepaymentResult = {
  originalMonthsRemaining: number;
  newMonthsRemaining: number;
  monthsSaved: number;
  interestSaved: number;
};

function monthsToPayOff(principal: number, monthlyRate: number, emiAmount: number): number {
  if (principal <= 0) return 0;
  if (monthlyRate <= 0) return principal / emiAmount;

  const ratio = (monthlyRate * principal) / emiAmount;
  if (ratio >= 1) return Infinity; // EMI too small to ever cover interest

  return -Math.log(1 - ratio) / Math.log(1 + monthlyRate);
}

export function calculatePrepayment({
  outstandingPrincipal,
  annualInterestRate,
  emiAmount,
  extraPayment,
}: {
  outstandingPrincipal: number;
  annualInterestRate: number;
  emiAmount: number;
  extraPayment: number;
}): PrepaymentResult {
  const monthlyRate = annualInterestRate / 12 / 100;

  const originalMonthsRemaining = monthsToPayOff(outstandingPrincipal, monthlyRate, emiAmount);
  const newPrincipal = Math.max(0, outstandingPrincipal - extraPayment);
  const newMonthsRemaining = monthsToPayOff(newPrincipal, monthlyRate, emiAmount);

  const totalPaidOriginal = emiAmount * originalMonthsRemaining;
  const totalPaidNew = emiAmount * newMonthsRemaining + extraPayment;

  return {
    originalMonthsRemaining: Math.round(originalMonthsRemaining),
    newMonthsRemaining: Math.round(newMonthsRemaining),
    monthsSaved: Math.round(originalMonthsRemaining - newMonthsRemaining),
    interestSaved: Math.max(0, totalPaidOriginal - totalPaidNew),
  };
}
