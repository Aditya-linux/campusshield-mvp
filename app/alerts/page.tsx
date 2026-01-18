"use client";

import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { auth, db } from "../lib/firebase";
import ThemeToggle from "../components/ThemeToggle";

type AlertDoc = {
  id: string;
  scamType?: string;
  summary?: string;
  phone?: string;
  upiId?: string;
  url?: string;
  risk?: string;
  createdAt?: any;
};

function RiskPill({ risk }: { risk?: string }) {
  const r = (risk || "").toLowerCase();
  const cls =
    r === "high" ? "pill pill-high" : r === "medium" ? "pill pill-medium" : "pill pill-low";
  return <span className={cls}>{risk || "unknown"}</span>;
}

export default function AlertsPage() {
  const [userEmail, setUserEmail] = useState<string>("");
  const [alerts, setAlerts] = useState<AlertDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState<"all" | "high" | "medium">("all");

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = "/";
        return;
      }
      setUserEmail(user.email || "");
    });

    const q = query(collection(db, "alerts"), orderBy("createdAt", "desc"));
    const unsubAlerts = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setAlerts(list);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );

    return () => {
      unsubAuth();
      unsubAlerts();
    };
  }, []);

  const filtered = useMemo(() => {
    if (riskFilter === "all") return alerts;
    return alerts.filter((a) => (a.risk || "").toLowerCase() === riskFilter);
  }, [alerts, riskFilter]);

  return (
    <>
      <div className="header">
        <div className="container">
          <div className="nav">
            <div className="brand">
              <div className="brand-badge">🛡️</div>
              <div>
                <h1 style={{ fontSize: 18, margin: 0 }}>CampusShield</h1>
                <p style={{ margin: 0, opacity: 0.75, fontSize: 12 }}>
                  Alerts feed, signed in as {userEmail}
                </p>
              </div>
            </div>

            <div className="navlinks">
              <Link href="/report">Report</Link>
              <Link href="/check">Check</Link>
              <Link href="/admin">Admin</Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <main className="container">
        <div className="card">
          <h2>Verified alerts</h2>
          <p className="helper">Filter by risk. Share alerts with your friends.</p>

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
              marginTop: 12,
            }}
          >
            <button
              className={riskFilter === "all" ? "btn btn-primary" : "btn"}
              onClick={() => setRiskFilter("all")}
            >
              All
            </button>
            <button
              className={riskFilter === "high" ? "btn btn-primary" : "btn"}
              onClick={() => setRiskFilter("high")}
            >
              High
            </button>
            <button
              className={riskFilter === "medium" ? "btn btn-primary" : "btn"}
              onClick={() => setRiskFilter("medium")}
            >
              Medium
            </button>

            <span className="helper" style={{ marginLeft: "auto" }}>
              Showing {filtered.length} alerts
            </span>
          </div>
        </div>

        {loading ? (
          <div className="card" style={{ marginTop: 12 }}>
            Loading alerts...
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ marginTop: 12 }}>
            No alerts yet.
          </div>
        ) : (
          <div className="grid" style={{ marginTop: 12 }}>
            {filtered.map((a) => (
              <div key={a.id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <strong>{(a.scamType || "scam").toUpperCase()}</strong>
                  <RiskPill risk={a.risk} />
                </div>

                <p style={{ marginTop: 10, marginBottom: 10 }}>
                  {a.summary || "No summary"}
                </p>

                <div className="helper">
                  {a.phone ? <div>Phone: {a.phone}</div> : null}
                  {a.upiId ? <div>UPI: {a.upiId}</div> : null}
                  {a.url ? <div>URL: {a.url}</div> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
