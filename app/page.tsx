"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import SummaryCards from "./components/SummaryCards";
import TransactionList from "./components/TransactionList";

const Charts = dynamic(() => import("./components/Charts"), { ssr: false });
const AddTransaction = dynamic(() => import("./components/AddTransaction"), { ssr: false });
const PdfImport = dynamic(() => import("./components/PdfImport"), { ssr: false });

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: string;
  source: string;
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const loadTransactions = useCallback(async () => {
    try {
      const res = await fetch("/api/transactions");
      const data = await res.json();
      setTransactions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  async function deleteTransaction(id: string) {
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    setTransactions((ts) => ts.filter((t) => t.id !== id));
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-4 sm:px-6 py-3 sticky top-0 z-10"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <span className="font-bold font-mono text-sm" style={{ color: "var(--accent)" }}>{"</>"}</span>
          <span className="text-sm font-semibold hidden sm:inline" style={{ color: "var(--foreground)" }}>Expense Tracker</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="text-xs px-3 py-1.5 rounded transition-opacity hover:opacity-80 flex items-center gap-1.5"
            style={{ background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="hidden sm:inline">Import PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="text-xs px-3 py-1.5 rounded font-semibold transition-opacity hover:opacity-80 flex items-center gap-1.5"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            <span>+</span>
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </button>
          <a href="https://freedprojects.vercel.app" className="text-xs hover:opacity-70 transition-opacity hidden sm:inline" style={{ color: "var(--text-muted)" }}>
            ← Portfolio
          </a>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
          </div>
        ) : (
          <>
            <SummaryCards transactions={transactions} />
            <Charts transactions={transactions.map((t) => ({ ...t, date: t.date.slice(0, 10) }))} />
            <TransactionList transactions={transactions} onDelete={deleteTransaction} />
          </>
        )}
      </div>

      {showAdd && <AddTransaction onClose={() => setShowAdd(false)} onSave={loadTransactions} />}
      {showImport && <PdfImport onClose={() => setShowImport(false)} onImport={loadTransactions} />}
    </div>
  );
}
