"use client";

import { useState } from "react";

export const CATEGORIES = [
  "Food & Dining", "Transportation", "Shopping", "Housing",
  "Utilities", "Entertainment", "Health", "Travel", "Education",
  "Income", "Transfer", "Other",
];

interface Props {
  onClose: () => void;
  onSave: () => void;
}

export default function AddTransaction({ onClose, onSave }: Props) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    description: "",
    amount: "",
    category: "Other",
    type: "expense" as "income" | "expense",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description || !form.amount) { setError("Description and amount are required."); return; }
    setSaving(true);
    try {
      const amount = form.type === "expense" ? -Math.abs(parseFloat(form.amount)) : Math.abs(parseFloat(form.amount));
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount }),
      });
      onSave();
      onClose();
    } catch {
      setError("Failed to save transaction.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="w-full max-w-md rounded-xl p-6 flex flex-col gap-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Add Transaction</h2>
          <button onClick={onClose} className="text-lg leading-none hover:opacity-60" style={{ color: "var(--text-muted)" }}>×</button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          {/* Type toggle */}
          <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set("type", t)}
                className="flex-1 py-2 text-xs font-semibold capitalize transition-colors"
                style={{
                  background: form.type === t ? (t === "expense" ? "var(--red-bg)" : "var(--green-bg)") : "transparent",
                  color: form.type === t ? (t === "expense" ? "var(--red)" : "var(--green)") : "var(--text-muted)",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Date</label>
            <input type="date" className="field" value={form.date} onChange={(e) => set("date", e.target.value)} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Description</label>
            <input className="field" placeholder="e.g. Grocery run" value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Amount ($)</label>
            <input type="number" min="0" step="0.01" className="field" placeholder="0.00" value={form.amount} onChange={(e) => set("amount", e.target.value)} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Category</label>
            <select className="field" value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          {error && <p className="text-xs" style={{ color: "var(--red)" }}>{error}</p>}

          <div className="flex gap-2 mt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 text-xs rounded-lg transition-opacity hover:opacity-70" style={{ background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2 text-xs rounded-lg font-semibold transition-opacity hover:opacity-80 disabled:opacity-50" style={{ background: "var(--accent)", color: "#fff" }}>
              {saving ? "Saving…" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
