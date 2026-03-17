"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, TrendingUp, TrendingDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

type LedgerSummaryProps = {
  transactions: any[];
};

export function LedgerSummary({ transactions }: LedgerSummaryProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach(t => {
      const d = new Date(t.transaction_date);
      months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    });
    const sorted = Array.from(months).sort().reverse();
    // Ensure current month is always an option even if no transactions exist yet
    const current = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    if (!sorted.includes(current)) sorted.unshift(current);
    return sorted;
  }, [transactions]);

  const { income, expense, recurringExpense } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    let recExp = 0;

    const [year, month] = selectedMonth.split('-');

    transactions.forEach(t => {
      const d = new Date(t.transaction_date);
      if (d.getFullYear() === parseInt(year) && (d.getMonth() + 1) === parseInt(month)) {
        if (t.transaction_type === 'income') {
          inc += Number(t.amount);
        } else if (t.transaction_type === 'expense') {
          exp += Number(t.amount);
          if (t.is_recurring) recExp += Number(t.amount);
        }
      }
    });

    return { income: inc, expense: exp, recurringExpense: recExp };
  }, [transactions, selectedMonth]);

  const netFlow = income - expense;
  const isPositiveFlow = netFlow >= 0;

  const formatMonth = (ym: string) => {
    const [y, m] = ym.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, 1);
    return date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="w-full bg-zinc-900/40 rounded-3xl border border-white/5 p-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-white text-lg font-medium tracking-tight">Ringkasan Arus Kas</h2>
        
        <div className="relative inline-block w-full sm:w-48">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
          >
            {availableMonths.map(m => (
              <option key={m} value={m}>{formatMonth(m)}</option>
            ))}
          </select>
          <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Income Card */}
        <div className="bg-black/20 rounded-2xl p-4 border border-emerald-500/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowDownRight size={48} className="text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-emerald-400/80 mb-1">Pemasukan Bulan Ini</p>
          <p className="text-2xl font-mono text-emerald-400">Rp {income.toLocaleString('id-ID')}</p>
        </div>

        {/* Expense Card */}
        <div className="bg-black/20 rounded-2xl p-4 border border-rose-500/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowUpRight size={48} className="text-rose-500" />
          </div>
          <p className="text-sm font-medium text-rose-400/80 mb-1">Pengeluaran Bulan Ini</p>
          <p className="text-2xl font-mono text-white">Rp {expense.toLocaleString('id-ID')}</p>
        </div>

        {/* Recurring Expense Breakdown */}
        <div className="bg-black/20 rounded-2xl p-4 border border-blue-500/10 relative overflow-hidden group">
          <p className="text-sm font-medium text-blue-400/80 mb-1">Pengeluaran Rutin</p>
          <p className="text-2xl font-mono text-blue-400">Rp {recurringExpense.toLocaleString('id-ID')}</p>
          <p className="text-xs text-zinc-500 mt-1">
            {expense > 0 ? Math.round((recurringExpense / expense) * 100) : 0}% dari total pengeluaran
          </p>
        </div>

        {/* Net Flow */}
        <div className={cn("rounded-2xl p-4 border relative overflow-hidden group", isPositiveFlow ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20")}>
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
            {isPositiveFlow ? <TrendingUp size={48} className="text-emerald-500" /> : <TrendingDown size={48} className="text-rose-500" />}
          </div>
          <p className={cn("text-sm font-medium mb-1", isPositiveFlow ? "text-emerald-400/80" : "text-rose-400/80")}>Surplus / Defisit Kas</p>
          <p className={cn("text-2xl font-mono", isPositiveFlow ? "text-emerald-400" : "text-rose-400")}>
            {isPositiveFlow ? '+' : '-'}Rp {Math.abs(netFlow).toLocaleString('id-ID')}
          </p>
        </div>
      </div>
    </div>
  );
}
