"use client";

import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "./lib/firebase";
import ThemeToggle from "./components/ThemeToggle";

export default function Home() {
  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    window.location.href = "/alerts";
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
                <p style={{ margin: 0, opacity: 0.75, fontSize: 12 }}>Check before you pay</p>
              </div>
            </div>
            <div className="navlinks">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <main className="container">
        <div
          className="card"
          style={{
            maxWidth: 520,
            margin: "48px auto 0",
          }}
        >
          <h2 style={{ marginBottom: 6 }}>Campus scam alerts</h2>
          <p className="helper" style={{ marginBottom: 14 }}>
            Students report scams. Admin verifies. Everyone searches before paying.
          </p>

          <div className="grid">
            <button className="btn btn-primary" onClick={login}>
              Sign in with Google
            </button>

            <div className="card">
              <div className="helper" style={{ margin: 0 }}>
                Demo flow
              </div>
              <div style={{ marginTop: 8 }}>
                <div>1. Sign in</div>
                <div>2. Report a scam</div>
                <div>3. Admin approves</div>
                <div>4. Alerts become searchable</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
