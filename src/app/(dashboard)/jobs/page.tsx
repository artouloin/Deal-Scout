"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Loader } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  source: string;
  matchScore?: number;
  industry?: string;
  contractType: string;
  isTemporary: boolean;
  hasPermanentPotential: boolean;
  phone?: string;
  email?: string;
  status: string;
  url: string;
  description: string;
}

interface ApiResponse {
  jobs: Job[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function JobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    industry: "",
    source: "",
    status: "",
    minScore: "",
    contractType: "",
    search: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchJobs = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: "20",
      ...Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== "")
      ),
    });

    try {
      const res = await fetch(`/api/jobs?${params}`);
      const data: ApiResponse = await res.json();
      setJobs(data.jobs);
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const triggerScraper = async () => {
    setScraping(true);
    try {
      await fetch("/api/scraper/run", { method: "POST" });
      // Wait a bit then refresh
      setTimeout(() => {
        fetchJobs();
        setScraping(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to trigger scraper:", error);
      setScraping(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchJobs();
    }
  }, [page, filters, status]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin" size={40} />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gcg-border">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gcg-dark">GCG Deal Scout</h1>
            <p className="text-gcg-muted text-sm mt-1">
              {total} Stellen gefunden · {session?.user?.email}
            </p>
          </div>
          <button
            onClick={triggerScraper}
            disabled={scraping}
            className="flex items-center gap-2 px-4 py-2 bg-gcg-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            <RefreshCw
              size={16}
              className={scraping ? "animate-spin" : ""}
            />
            {scraping ? "Scanne..." : "Jetzt scannen"}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Gesamt", value: total },
            { label: "Neu", value: jobs.filter((j) => j.status === "NEW").length },
            { label: "Call ausstehend", value: jobs.filter((j) => j.status === "CALL_PENDING").length },
            { label: "Anschreiben versendet", value: jobs.filter((j) => j.status === "LETTER_SENT").length },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gcg-border p-4"
            >
              <p className="text-gcg-muted text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-gcg-dark mt-1">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-gcg-border p-4 mb-6 flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Suche..."
            value={filters.search}
            onChange={(e) => {
              setFilters({ ...filters, search: e.target.value });
              setPage(1);
            }}
            className="flex-1 min-w-48 px-3 py-2 border border-gcg-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gcg-blue"
          />
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters({ ...filters, status: e.target.value });
              setPage(1);
            }}
            className="px-3 py-2 border border-gcg-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gcg-blue"
          >
            <option value="">Alle Status</option>
            <option value="NEW">Neu</option>
            <option value="CALL_PENDING">Call ausstehend</option>
            <option value="CALL_DONE">Call erfolgt</option>
            <option value="LETTER_SENT">Gesendet</option>
          </select>
          <select
            value={filters.minScore}
            onChange={(e) => {
              setFilters({ ...filters, minScore: e.target.value });
              setPage(1);
            }}
            className="px-3 py-2 border border-gcg-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gcg-blue"
          >
            <option value="">Alle Scores</option>
            <option value="70">≥ 70 (Grün)</option>
            <option value="40">≥ 40 (Gelb)</option>
          </select>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader className="animate-spin" size={40} />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gcg-muted">Keine Stellen gefunden</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-8">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white border border-gcg-border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gcg-dark line-clamp-1">
                        {job.title}
                      </h3>
                      <p className="text-sm text-gcg-muted">{job.company}</p>
                      <p className="text-xs text-gcg-muted mt-1">
                        {job.location} · {job.source}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.matchScore && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              job.matchScore >= 70
                                ? "bg-green-100 text-green-700"
                                : job.matchScore >= 40
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {job.matchScore}% Match
                          </span>
                        )}
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
                          {job.status.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 text-xs bg-gcg-blue text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
                      >
                        Zur Stelle
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gcg-border rounded-lg text-sm disabled:opacity-50"
              >
                Zurück
              </button>
              <span className="text-sm text-gcg-muted">
                Seite {page} von {Math.ceil(total / 20)}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil(total / 20)}
                className="px-3 py-1 border border-gcg-border rounded-lg text-sm disabled:opacity-50"
              >
                Weiter
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
