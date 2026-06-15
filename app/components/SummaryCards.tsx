interface Transaction {
  amount: number;
  type: string;
}

interface Props {
  transactions: Transaction[];
}

export default function SummaryCards({ transactions }: Props) {
  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + Math.abs(t.amount), 0);
  const net = income - expenses;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const cards = [
    { label: "Total Income", value: fmt(income), color: "var(--green)", bg: "var(--green-bg)" },
    { label: "Total Expenses", value: fmt(expenses), color: "var(--red)", bg: "var(--red-bg)" },
    { label: "Net Balance", value: fmt(net), color: net >= 0 ? "var(--green)" : "var(--red)", bg: net >= 0 ? "var(--green-bg)" : "var(--red-bg)" },
    { label: "Transactions", value: transactions.length.toString(), color: "var(--accent)", bg: "var(--accent-bg)" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(({ label, value, color, bg }) => (
        <div
          key={label}
          className="rounded-xl p-4 flex flex-col gap-1"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            {label}
          </span>
          <span className="text-xl font-bold" style={{ color }}>
            {value}
          </span>
          <div className="mt-1 h-1 rounded-full" style={{ background: bg }} />
        </div>
      ))}
    </div>
  );
}
