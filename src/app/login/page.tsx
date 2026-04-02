"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.ok) {
      router.push("/jobs");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gcg-dark to-gcg-darker p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-gcg-dark mb-2">
            GCG Deal Scout
          </h1>
          <p className="text-gcg-muted text-sm mb-8">
            Intelligente Lead-Generierung für Unternehmensberatung
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gcg-dark mb-1">
                E-Mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="berater@gcg-consulting.de"
                className="w-full px-4 py-2.5 border border-gcg-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gcg-blue text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gcg-dark mb-1">
                Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-gcg-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gcg-blue text-sm"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gcg-blue text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Wird angemeldet..." : "Anmelden"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gcg-border text-center">
            <p className="text-gcg-muted text-xs">
              Demo-Zugang: berater@gcg-consulting.de
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
