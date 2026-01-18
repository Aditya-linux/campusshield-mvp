"use client";

import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import ThemeToggle from "../components/ThemeToggle";

type ReportDoc = {
  id: string;
  scamType?: string;
  platform?: string;
  description?: string;
  phone?: string;
  upiId?: string;
  url?: string;
  amount?: number | null;
  proofLink?: string;
  status?: string;
  createdAt?: any;
};

function RiskPill({ risk }: { risk: string }) {
  const r = (risk || "").toLowerCase();
  const cls =
    r === "high" ? "pill pill-high" : r === "medium" ? "pill pill-medium" : "pill pill-low";
  return <span className={cls}>{risk || "unknown"}</span>;
}

export default function AdminPage() {
  const [uid, setUid] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [reports, setReports] = useState<ReportDoc[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "/";
        return;
      }
      setUid(user.uid);

      const adminSnap = await getDoc(doc(db, "admin", user.uid));
      setIsAdmin(adminSnap.exists() && adminSnap.data()?.role === "admin");
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    const q = query(
      collection(db, "reports"),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setReports(list);
      },
      (err) => console.error(err)
    );

    return () => unsub();
  }, [isAdmin]);

  const approve = async (r: ReportDoc) => {
    setMsg("");

    const summary =
      (r.description || "Scam report approved. Stay alert.").slice(0, 160);

    const risk = r.amount && r.amount >= 500 ? "high" : "medium";

    await addDoc(collection(db, "alerts"), {
      reportId: r.id,
      scamType: r.scamType || "other",
      summary,
      phone: r.phone || "",
      upiId: r.upiId || "",
      url: r.url || "",
      risk,
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "reports", r.id), { status: "approved" });
    setMsg("Approved and published.");
  };

  const reject = async (r: ReportDoc) => {
    setMsg("");
    await updateDoc(doc(db, "reports", r.id), { status: "rejected" });
    setMsg("Rejected.");
  };

  if (!uid) return <main className="container">Loading...</main>;

  if (!isAdmin) {
    return (
      <main className="container">
        <div className="card">
          <h1>Admin</h1>
          <p className="helper">Access denied. Add your UID doc in /admin.</p>
          <Link href="/alerts">Back</Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <div className="header">
        <div className="container">
          <div className="nav">
            <div className="brand">
              <div className="brand-badge">🛡️</div>
              <div>
                <h1 style={{ fontSize: 18, margin: 0 }}>CampusShield</h1>
                <p style={{ margin: 0, opacity: 0.75, fontSize: 12 }}>Admin review</p>
              </div>
            </div>

            <div className="navlinks">
              <Link href="/alerts">Alerts</Link>
              <Link href="/report">Report</Link>
              <Link href="/check">Check</Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <main className="container">
        <div className="card">
          <h2>Pending reports</h2>
          <p className="helper">Approve to publish a verified alert.</p>
        </div>

        {msg ? (
          <div className="card" style={{ marginTop: 12 }}>
            {msg}
          </div>
        ) : null}

        {reports.length === 0 ? (
          <div className="card" style={{ marginTop: 12 }}>
            No pending reports.
          </div>
        ) : (
          <div className="grid" style={{ marginTop: 12 }}>
            {reports.map((r) => {
              const risk = r.amount && r.amount >= 500 ? "high" : "medium";

              return (
                <div key={r.id} className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <strong>{(r.scamType || "scam").toUpperCase()}</strong>
                      <div className="helper" style={{ marginTop: 4 }}>
                        Platform: {r.platform || "unknown"}
                      </div>
                    </div>
                    <RiskPill risk={risk} />
                  </div>

                  <p style={{ marginTop: 10, marginBottom: 10 }}>{r.description}</p>

                  <div className="helper">
                    {r.phone ? <div>Phone: {r.phone}</div> : null}
                    {r.upiId ? <div>UPI: {r.upiId}</div> : null}
                    {r.url ? <div>URL: {r.url}</div> : null}
                    {typeof r.amount === "number" ? <div>Amount: {r.amount}</div> : null}
                    {r.proofLink ? (
                      <div>
                        Proof:{" "}
                        <a href={r.proofLink} target="_blank" rel="noreferrer">
                          open
                        </a>
                      </div>
                    ) : null}
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                    <button className="btn btn-primary" onClick={() => approve(r)}>
                      Approve
                    </button>
                    <button className="btn" onClick={() => reject(r)}>
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
