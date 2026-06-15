"use client";

import { useState, useRef } from "react";
import { CATEGORIES } from "./AddTransaction";

interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  category: string;
  type: string;
  selected: boolean;
}

interface Props {
  onClose: () => void;
  onImport: () => void;
}

export default function PdfImport({ onClose, onImport }: Props) {
  const [step, setStep] = useState<"upload" | "parsing" | "review" | "importing">("upload");
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") { setError("Please upload a PDF file."); return; }
    setError("");
    setStep("parsing");
    try {
      const fd = new FormData();
      fd.append("pdf", file);
      const res = await fetch("/api/parse-pdf", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Parse failed");
      setTransactions(data.transactions.map((t: Omit<ParsedTransaction, "selected">) => ({ ...t, selected: true })));
      setStep("review");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to parse PDF. Please try again.");
      setStep("upload");
    }
  }

  async function handleImport() {
    const toImport = transactions.filter((t) => t.selected);
    if (!toImport.length) return;
    setStep("importing");
    try {
      await Promise.all(
        toImport.map((t) =>
          fetch("/api/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...t, source: "imported" }),
          })
        )
      );
      onImport();
      onClose();
    } catch {
      setError("Import failed. Please try again.");
      setStep("review");
    }
  }

  function toggleAll(val: boolean) {
    setTransactions((ts) => ts.map((t) => ({ ...t, selected: val })));
  }

  function toggle(i: number) {
    setTransactions((ts) => ts.map((t, idx) => idx === i ? { ...t, selected: !t.selected } : t));
  }

  function updateCategory(i: number, cat: string) {
    setTransactions((ts) => ts.map((t, idx) => idx === i ? { ...t, category: cat } : t));
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Math.abs(n));

  const selected = transactions.filter((t) => t.selected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div
        className="w-full flex flex-col gap-4 rounded-xl p-6"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          maxWidth: step === "review" ? 720 : 480,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <h2 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
            {step === "upload" && "Import Bank Statement"}
            {step === "parsing" && "Parsing PDF…"}
            {step === "review" && `Review Transactions (${transactions.length} found)`}
            {step === "importing" && "Importing…"}
          </h2>
          <button onClick={onClose} className="text-lg leading-none hover:opacity-60" style={{ color: "var(--text-muted)" }}>×</button>
        </div>

        {/* Upload step */}
        {step === "upload" && (
          <div className="flex flex-col gap-4">
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              className="flex flex-col items-center justify-center gap-3 rounded-xl cursor-pointer transition-colors"
              style={{ minHeight: 200, border: "2px dashed var(--border)", background: "var(--surface-2)" }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <polyline points="9 15 12 12 15 15" />
              </svg>
              <div className="text-center">
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Drop your bank statement PDF here</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>or click to select a file</p>
              </div>
              <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>
            <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
              Claude AI will extract your transactions automatically. Nothing is stored except what you import.
            </p>
            {error && <p className="text-xs text-center" style={{ color: "var(--red)" }}>{error}</p>}
          </div>
        )}

        {/* Parsing step */}
        {step === "parsing" && (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Claude is reading your bank statement…</p>
          </div>
        )}

        {/* Review step */}
        {step === "review" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <button onClick={() => toggleAll(true)} className="text-xs hover:opacity-70 transition-opacity" style={{ color: "var(--accent)" }}>Select all</button>
                <button onClick={() => toggleAll(false)} className="text-xs hover:opacity-70 transition-opacity" style={{ color: "var(--text-muted)" }}>Deselect all</button>
              </div>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{selected} selected</span>
            </div>

            <div className="overflow-y-auto flex flex-col gap-2" style={{ maxHeight: "50vh" }}>
              {transactions.map((t, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg transition-colors"
                  style={{
                    background: t.selected ? "var(--surface-2)" : "transparent",
                    border: `1px solid ${t.selected ? "var(--border)" : "transparent"}`,
                    opacity: t.selected ? 1 : 0.45,
                  }}
                >
                  <input type="checkbox" checked={t.selected} onChange={() => toggle(i)} className="mt-0.5 accent-[#F88379]" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold truncate" style={{ color: "var(--foreground)" }}>{t.description}</p>
                      <span className="text-xs font-bold flex-shrink-0" style={{ color: t.type === "income" ? "var(--green)" : "var(--red)" }}>
                        {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{t.date}</span>
                      <select
                        className="text-[11px] rounded px-1.5 py-0.5 border-none outline-none"
                        style={{ background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                        value={t.category}
                        onChange={(e) => updateCategory(i, e.target.value)}
                      >
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {error && <p className="text-xs" style={{ color: "var(--red)" }}>{error}</p>}

            <div className="flex gap-2 pt-1">
              <button onClick={onClose} className="flex-1 py-2 text-xs rounded-lg transition-opacity hover:opacity-70" style={{ background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                Cancel
              </button>
              <button onClick={handleImport} disabled={selected === 0} className="flex-1 py-2 text-xs rounded-lg font-semibold transition-opacity hover:opacity-80 disabled:opacity-40" style={{ background: "var(--accent)", color: "#fff" }}>
                Import {selected} transaction{selected !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        )}

        {/* Importing step */}
        {step === "importing" && (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Saving transactions…</p>
          </div>
        )}
      </div>
    </div>
  );
}
