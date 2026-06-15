"use client";

import { useState } from "react";
import { CATEGORIES } from "./AddTransaction";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: string;
  source: string;
}

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Math.abs(n));

export default function TransactionList({ transactions, onDelete }: Props) {
  const [filterCat, setFilterCat] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = transactions.filter((t) => {
    if (filterCat !== "All" && t.category !== filterCat) return false;
    if (filterType !== "All" && t.type !== filterType) return false;
    if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-3" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--accent)" }}>Transactions</p>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{filtered.length} shown</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          className="field flex-1 min-w-32"
          style={{ padding: "6px 10px", fontSize: 12 }}
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="field" style={{ padding: "6px 10px", fontSize: 12, width: "auto" }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="All">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select className="field" style={{ padding: "6px 10px", fontSize: 12, width: "auto" }} value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="All">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-xs text-center py-8" style={{ color: "var(--text-muted)" }}>
          {transactions.length === 0 ? "No transactions yet. Add one or import a bank statement." : "No transactions match your filters."}
        </p>
      ) : (
        <div className="flex flex-col divide-y" style={{ borderColor: "var(--border)" }}>
          {filtered.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold truncate" style={{ color: "var(--foreground)" }}>{t.description}</p>
                  {t.source === "imported" && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: "var(--accent-bg)", color: "var(--accent)" }}>PDF</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>{t.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm font-bold" style={{ color: t.type === "income" ? "var(--green)" : "var(--red)" }}>
                  {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                </span>
                <button
                  onClick={() => onDelete(t.id)}
                  className="text-xs px-2 py-1 rounded transition-opacity hover:opacity-70"
                  style={{ background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
