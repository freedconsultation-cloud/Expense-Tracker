"use client";

import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as PieTooltip,
  BarChart, Bar, XAxis, YAxis, Tooltip as BarTooltip, Legend, CartesianGrid,
} from "recharts";

interface Transaction {
  date: string;
  amount: number;
  category: string;
  type: string;
}

interface Props {
  transactions: Transaction[];
}

const COLORS = [
  "#F88379", "#3fb950", "#58a6ff", "#e3b341", "#d2a8ff",
  "#ffa657", "#79c0ff", "#56d364", "#ff7b72", "#a5d6ff",
];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export default function Charts({ transactions }: Props) {
  // Category breakdown (expenses only)
  const catMap: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      catMap[t.category] = (catMap[t.category] ?? 0) + Math.abs(t.amount);
    });
  const pieData = Object.entries(catMap)
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value);

  // Monthly income vs expenses
  const monthMap: Record<string, { income: number; expenses: number }> = {};
  transactions.forEach((t) => {
    const month = t.date.slice(0, 7); // "YYYY-MM"
    if (!monthMap[month]) monthMap[month] = { income: 0, expenses: 0 };
    if (t.type === "income") monthMap[month].income += t.amount;
    else monthMap[month].expenses += Math.abs(t.amount);
  });
  const barData = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, vals]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      Income: Math.round(vals.income * 100) / 100,
      Expenses: Math.round(vals.expenses * 100) / 100,
    }));

  const cardStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: "16px",
  };

  if (transactions.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Category donut */}
      <div style={cardStyle}>
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--accent)" }}>
          Spending by Category
        </p>
        {pieData.length === 0 ? (
          <p className="text-xs text-center py-8" style={{ color: "var(--text-muted)" }}>No expense data</p>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <PieTooltip
                  contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(val) => [fmt(Number(val)), ""]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              {pieData.slice(0, 7).map((entry, i) => (
                <div key={entry.name} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="truncate" style={{ color: "var(--text-muted)" }}>{entry.name}</span>
                  </div>
                  <span className="font-semibold flex-shrink-0" style={{ color: "var(--foreground)" }}>{fmt(entry.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Monthly bar */}
      <div style={cardStyle}>
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--accent)" }}>
          Monthly Overview
        </p>
        {barData.length === 0 ? (
          <p className="text-xs text-center py-8" style={{ color: "var(--text-muted)" }}>No monthly data</p>
        ) : (
          <ResponsiveContainer width="100%" height={196}>
            <BarChart data={barData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <BarTooltip
                contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                formatter={(val) => [fmt(Number(val)), ""]}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-muted)" }} />
              <Bar dataKey="Income" fill="var(--green)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="var(--red)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
