type ExpenseForBalance = {
  totalAmount: number;
  paidByMemberId: string;
  splits: { memberId: string; shareAmount: number }[];
};

type SettlementForBalance = {
  fromMemberId: string;
  toMemberId: string;
  amount: number;
};

export function computeMemberBalances(
  memberIds: string[],
  expenses: ExpenseForBalance[],
  settlements: SettlementForBalance[]
): Record<string, number> {
  const balance: Record<string, number> = Object.fromEntries(memberIds.map((id) => [id, 0]));

  for (const expense of expenses) {
    balance[expense.paidByMemberId] = (balance[expense.paidByMemberId] ?? 0) + expense.totalAmount;
    for (const split of expense.splits) {
      balance[split.memberId] = (balance[split.memberId] ?? 0) - split.shareAmount;
    }
  }

  for (const settlement of settlements) {
    balance[settlement.fromMemberId] = (balance[settlement.fromMemberId] ?? 0) + settlement.amount;
    balance[settlement.toMemberId] = (balance[settlement.toMemberId] ?? 0) - settlement.amount;
  }

  return balance;
}

export type SimplifiedDebt = { fromMemberId: string; toMemberId: string; amount: number };

export function simplifyDebts(balance: Record<string, number>): SimplifiedDebt[] {
  const debtors = Object.entries(balance)
    .filter(([, amount]) => amount < -0.01)
    .map(([memberId, amount]) => ({ memberId, amount: -amount }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = Object.entries(balance)
    .filter(([, amount]) => amount > 0.01)
    .map(([memberId, amount]) => ({ memberId, amount }))
    .sort((a, b) => b.amount - a.amount);

  const result: SimplifiedDebt[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount);
    result.push({ fromMemberId: debtors[i].memberId, toMemberId: creditors[j].memberId, amount: pay });
    debtors[i].amount -= pay;
    creditors[j].amount -= pay;
    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  return result;
}

export function splitEqually(totalAmount: number, memberIds: string[]): Record<string, number> {
  const base = Math.floor((totalAmount / memberIds.length) * 100) / 100;
  const shares: Record<string, number> = {};
  let allocated = 0;
  memberIds.forEach((id, i) => {
    if (i === memberIds.length - 1) {
      shares[id] = Math.round((totalAmount - allocated) * 100) / 100;
    } else {
      shares[id] = base;
      allocated += base;
    }
  });
  return shares;
}
