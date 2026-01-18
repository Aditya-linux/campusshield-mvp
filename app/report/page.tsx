"use client";

import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import ThemeToggle from "../components/ThemeToggle";

export default function ReportPage() {
  const [uid, setUid] = useState<string>("");

  const [scamType, setScamType] = useState("internship");
  const [platform, setPlatform] = useState("whatsapp");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [upiId, setUpiId] = useState("");
  const [url, setUrl] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [proofLink, setProofLink] = useState("");
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = "/";
        return;
      }
      setUid(user.uid);
    });
  }, []);

  const submit = async () => {
    setMsg("");

    if (!description.trim()) {
      setMsg("Add description.");
      return;
    }
    if (!phone.trim() && !upiId.trim() && !url.trim()) {
      setMsg("Add phone or UPI or URL.");
      return;
    }

    await addDoc(collection(db, "reports"), {
      scamType,
      platform,
      description: description.trim(),
      phone: phone.trim(),
      upiId: upiId.trim(),
      url: url.trim(),
      amount: amount ? Number(amount) : null,
      proofLink: proofLink.trim(),
      status: "pending",
      createdAt: serverTimestamp(),
      createdByUid: uid,
    });

    setDescription("");
    setPhone("");
    setUpiId("");
    setUrl("");
    setAmount("");
    setProofLink("");
    setMsg("Report submitted. Waiting for approval.");
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
                  Report a scam to protect your campus
                </p>
              </div>
            </div>

            <div className="navlinks">
              <Link href="/alerts">Alerts</Link>
              <Link href="/check">Check</Link>
              <Link href="/admin">Admin</Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <main className="container">
        <div className="card">
          <h2>Submit a report</h2>
          <p className="helper">
            Add a clear description. Add at least one identifier, phone, UPI, or URL.
          </p>
        </div>

        {msg ? (
          <div className="card" style={{ marginTop: 12 }}>
            {msg}
          </div>
        ) : null}

        <div className="card" style={{ marginTop: 12 }}>
          <div className="grid">
            <label>
              Scam type
              <select value={scamType} onChange={(e) => setScamType(e.target.value)}>
                <option value="internship">Internship</option>
                <option value="upi">UPI Fraud</option>
                <option value="phishing">Phishing</option>
                <option value="rental">Rental/PG</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label>
              Platform
              <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                <option value="whatsapp">WhatsApp</option>
                <option value="telegram">Telegram</option>
                <option value="instagram">Instagram</option>
                <option value="call">Call</option>
                <option value="sms">SMS</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label>
              Description
              <textarea
                className="input"
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What happened, what they asked for, what you noticed."
              />
              <span className="helper">
                Example: “They asked 999 for offer letter, sent UPI collect request.”
              </span>
            </label>

            <label>
              Phone (optional)
              <input
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
              />
            </label>

            <label>
              UPI ID (optional)
              <input
                className="input"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="name@upi"
              />
            </label>

            <label>
              URL (optional)
              <input
                className="input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
              />
            </label>

            <label>
              Amount (optional)
              <input
                className="input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="999"
              />
            </label>

            <label>
              Proof link (optional)
              <input
                className="input"
                value={proofLink}
                onChange={(e) => setProofLink(e.target.value)}
                placeholder="Google Drive link"
              />
              <span className="helper">Storage is skipped. Use a link for proof.</span>
            </label>

            <button className="btn btn-primary" onClick={submit}>
              Submit report
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
