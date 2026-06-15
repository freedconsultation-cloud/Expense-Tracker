"use client";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface Transaction {
  date: string;
  amount: number;
  type: string;
}

interface Props {
  transactions: Transaction[];
  selectedMonth: number | null;
  onMonthSelect: (month: number | null) => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export default function MonthlyBreakdown({ transactions, selectedMonth, onMonthSelect }: Props) {
  const months = Array.from({ length: 12 }, (_, i) => {
    const ms = String(i + 1).padStart(2, "0");
    const monthTxs = transactions.filter((t) => t.date.slice(5, 7) === ms);
    const income = monthTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expenses = monthTxs.filter((t) => t.type === "expense").reduce((s, t) => s + Math.abs(t.amount), 0);
    const net = income - expenses;
    return { income, expenses, net, count: monthTxs.length };
  });

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
          Monthly Breakdown
        </p>
        {selectedMonth !== null && (
          <button
            onClick={() => onMonthSelect(null)}
            className="text-xs px-2.5 py-1 rounded transition-opacity hover:opacity-70"
            style={{ background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
          >
            {MONTHS[selectedMonth]} — clear filter ×
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {months.map((m, i) => {
          const isActive = selectedMonth === i;
          return (
            <button
              key={i}
              onClick={() => onMonthSelect(isActive ? null : i)}
              className="flex flex-col gap-1 p-3 rounded-lg text-left transition-all hover:opacity-90"
              style={{
                background: isActive ? "var(--accent-bg)" : "var(--surface-2)",
                border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
                opacity: m.count === 0 ? 0.45 : 1,
              }}
            >
              <span className="text-[11px] font-bold" style={{ color: isActive ? "var(--accent)" : "var(--foreground)" }}>
                {MONTHS[i]}
              </span>
              {m.count > 0 ? (
                <>
                  <span className="text-[10px]" style={{ color: "var(--green)" }}>{fmt(m.income)}</span>
                  <span className="text-[10px]" style={{ color: "var(--red)" }}>-{fmt(m.expenses)}</span>
                  <span className="text-[10px] font-semibold" style={{ color: m.net >= 0 ? "var(--green)" : "var(--red)" }}>
                    {m.net >= 0 ? "+" : ""}{fmt(m.net)}
                  </span>
                </>
              ) : (
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>No data</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
