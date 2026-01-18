"use client";

import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
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
};

function RiskPill({ risk }: { risk?: string }) {
  const r = (risk || "").toLowerCase();
  const cls =
    r === "high" ? "pill pill-high" : r === "medium" ? "pill pill-medium" : "pill pill-low";
  return <span className={cls}>{risk || "unknown"}</span>;
}

export default function CheckPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<AlertDoc | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) window.location.href = "/";
    });
  }, []);

  const runCheck = async () => {
    setMsg("");
    setResult(null);

    const key = input.trim();
    if (!key) {
      setMsg("Paste phone, UPI, or URL.");
      return;
    }

    const q1 = query(collection(db, "alerts"), where("phone", "==", key));
    const q2 = query(collection(db, "alerts"), where("upiId", "==", key));
    const q3 = query(collection(db, "alerts"), where("url", "==", key));

    const [s1, s2, s3] = await Promise.all([getDocs(q1), getDocs(q2), getDocs(q3)]);
    const docSnap = s1.docs[0] || s2.docs[0] || s3.docs[0];

    if (!docSnap) {
      setMsg("No match found. Stay cautious.");
      return;
    }

    setResult({ id: docSnap.id, ...(docSnap.data() as any) });
  };

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
                  Check before you pay
                </p>
              </div>
            </div>

            <div className="navlinks">
              <Link href="/alerts">Alerts</Link>
              <Link href="/report">Report</Link>
              <Link href="/admin">Admin</Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <main className="container">
        <div className="card">
          <h2>Search an identifier</h2>
          <p className="helper">Exact match search for MVP.</p>

          <div style={{ marginTop: 12 }}>
            <label>
              Phone, UPI ID, or URL
              <input
                className="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="9876543210 or name@upi or https://..."
              />
            </label>

            <button className="btn btn-primary" onClick={runCheck} style={{ marginTop: 10 }}>
              Check
            </button>
          </div>
        </div>

        {msg ? (
          <div className="card" style={{ marginTop: 12 }}>
            {msg}
          </div>
        ) : null}

        {result ? (
          <div className="card" style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <strong>{(result.scamType || "scam").toUpperCase()}</strong>
              <RiskPill risk={result.risk} />
            </div>

            <p style={{ marginTop: 10, marginBottom: 10 }}>{result.summary}</p>

            <div className="helper">
              {result.phone ? <div>Phone: {result.phone}</div> : null}
              {result.upiId ? <div>UPI: {result.upiId}</div> : null}
              {result.url ? <div>URL: {result.url}</div> : null}
            </div>
          </div>
        ) : null}

        <div className="card" style={{ marginTop: 12 }}>
          <h2>Safety checklist</h2>
          <ul style={{ marginTop: 8, marginBottom: 0 }}>
            <li>Never pay registration fees for internships.</li>
            <li>Do not approve UPI collect requests from unknown people.</li>
            <li>Verify company using official website and email domain.</li>
            <li>Do not share OTP, CVV, or screen share.</li>
          </ul>
        </div>
      </main>
    </>
  );
}
