"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { apiUrl, API_URL } from "@/lib/api";
import { getToken, setToken, clearToken } from "@/lib/auth";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const checkAuth = useCallback(() => {
    setChecking(true);
    setConnectionError(false);

    const url = apiUrl("/api/auth/status");
    console.log(`[AuthGate] Checking auth status at ${url}`);

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          console.error(`[AuthGate] Auth status returned ${res.status}`);
          throw new Error(`Backend returned ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log(`[AuthGate] Auth enabled: ${data.auth_enabled}`);
        if (!data.auth_enabled) {
          setAuthenticated(true);
          setChecking(false);
        } else {
          setAuthRequired(true);
          // Check if we have a cached token that still works
          const token = getToken();
          if (token) {
            fetch(apiUrl("/api/auth/verify"), {
              headers: { Authorization: `Bearer ${token}` },
            }).then((res) => {
              if (res.ok) {
                console.log("[AuthGate] Cached token is valid");
                setAuthenticated(true);
              } else {
                console.log("[AuthGate] Cached token is invalid, clearing");
                clearToken();
              }
              setChecking(false);
            }).catch(() => {
              console.error("[AuthGate] Failed to validate cached token");
              setChecking(false);
            });
          } else {
            setChecking(false);
          }
        }
      })
      .catch((err) => {
        console.error(`[AuthGate] Cannot connect to backend at ${API_URL}:`, err.message);
        setConnectionError(true);
        setChecking(false);
      });
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase }),
      });

      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setAuthenticated(true);
      } else if (res.status === 401) {
        setError("Incorrect passphrase");
      } else {
        const detail = await res.text().catch(() => "");
        setError(`Server error (${res.status})${detail ? `: ${detail}` : ""}`);
      }
    } catch {
      setError("Could not connect to server");
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen carbon-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-f1-border border-t-f1-red rounded-full animate-spin shadow-f1-red" />
          <span className="text-white font-extrabold text-xs uppercase tracking-widest f1-font">Authenticating Paddock Access...</span>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="min-h-screen carbon-bg flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-f1-border shadow-f1-glow mx-auto mb-4">
              <img src="/logo.png" alt="PitWall" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-black text-white f1-font tracking-wide">PITWALL</h1>
          </div>

          <div className="carbon-card border border-f1-border rounded-xl p-6 shadow-2xl f1-stripe-top">
            <h2 className="text-xs font-black text-f1-red uppercase tracking-wider mb-3 f1-font flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-f1-red animate-pulse"></span>
              Backend Telemetry Disconnected
            </h2>
            <p className="text-xs text-f1-muted font-semibold mb-3">
              The frontend failed to reach the API server at:
            </p>
            <code className="block text-xs text-white bg-[#0D0E14] border border-f1-border rounded-lg px-3 py-2 mb-4 break-all font-mono">
              {API_URL || (typeof window !== "undefined" ? window.location.origin : "(same origin)")}
            </code>
            <div className="text-xs text-f1-muted space-y-2 font-medium">
              <p className="font-bold text-white">Troubleshooting Steps:</p>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li>Backend container is initializing</li>
                <li>Verify <code className="text-f1-red">NEXT_PUBLIC_API_URL</code> environment variable</li>
                <li>Check Docker network routing or proxy configuration</li>
              </ul>
            </div>
            <button
              onClick={checkAuth}
              className="w-full mt-6 f1-slant px-4 py-2.5 bg-gradient-to-r from-[#E10600] to-[#FF2A2A] text-white text-xs font-black uppercase tracking-widest rounded-lg hover:brightness-110 transition-all shadow-f1-red"
            >
              <span className="f1-slant-unskew">Reconnect Telemetry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (authenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen carbon-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-f1-border shadow-f1-glow mx-auto mb-4 hover:scale-105 transition-transform">
            <img src="/logo.png" alt="PitWall" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-black text-white f1-font tracking-wide flex items-center justify-center gap-2">
            <span className="text-f1-red">Pit</span>Wall
          </h1>
          <p className="text-xs text-f1-muted font-bold uppercase tracking-widest mt-1">Paddock Telemetry Gate</p>
        </div>

        <form onSubmit={handleSubmit} className="carbon-card border border-f1-border rounded-xl p-6 shadow-2xl f1-stripe-top">
          <label htmlFor="passphrase" className="block text-xs font-black text-f1-muted uppercase tracking-wider mb-2.5 f1-font">
            Security Passphrase Required
          </label>
          <div className="relative">
            <input
              id="passphrase"
              type={showPassphrase ? "text" : "password"}
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              autoFocus
              className="w-full px-3.5 py-2.5 pr-10 bg-[#0D0E14] border border-f1-border rounded-lg text-white text-sm focus:outline-none focus:border-f1-red focus:ring-1 focus:ring-f1-red transition-all font-mono"
              placeholder="Enter Paddock Passcode"
            />
            <button
              type="button"
              onClick={() => setShowPassphrase(!showPassphrase)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-f1-muted hover:text-white transition-colors"
              tabIndex={-1}
            >
              {showPassphrase ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {error && (
            <p className="text-f1-red text-xs font-bold mt-2 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-f1-red"></span>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting || !passphrase}
            className="w-full mt-5 f1-slant px-4 py-2.5 bg-gradient-to-r from-[#E10600] to-[#FF2A2A] text-white text-xs font-black uppercase tracking-widest rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-f1-red"
          >
            <span className="f1-slant-unskew">
              {submitting ? "Authenticating..." : "Access Pit Wall"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
