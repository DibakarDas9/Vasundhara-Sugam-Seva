"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchMonitoringMetrics,
  type MonitoringMetricsResponse,
  type MonitoringSnapshot,
} from "@/lib/admin";
import {
  ArrowPathIcon,
  BoltIcon,
  ClockIcon,
  SignalIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import { cn, formatDate } from "@/lib/utils";

const AUTO_REFRESH_MS = 60000;
const GATE_KEY = "vasundhara_admin_gate_token";

function formatLatency(value?: number) {
  if (!value && value !== 0) return "N/A";
  if (value < 1) return `${(value * 1000).toFixed(1)}us`;
  if (value < 1000) return `${value.toFixed(1)}ms`;
  return `${(value / 1000).toFixed(2)}s`;
}

function formatSuccessRate(rate?: number) {
  if (typeof rate !== "number") return "N/A";
  return `${(rate * 100).toFixed(1)}%`;
}

function statusBadge(status: string) {
  switch (status) {
    case "success":
      return "bg-emerald-50 text-emerald-700";
    case "failure":
      return "bg-rose-50 text-rose-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function retrainingBadge(status: string) {
  if (status === "completed") return "bg-emerald-50 text-emerald-700";
  if (status === "failed") return "bg-rose-50 text-rose-700";
  return "bg-amber-50 text-amber-700";
}

export default function MonitoringPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === "admin";
  const unauthorized = useMemo(() => !authLoading && !isAdmin, [authLoading, isAdmin]);

  const [metrics, setMetrics] = useState<MonitoringSnapshot | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gateReady, setGateReady] = useState(false);
  const [hasGateAccess, setHasGateAccess] = useState(false);

  const modelEntries = useMemo(() => {
    if (!metrics) return [];
    return Object.entries(metrics.models).sort(([, a], [, b]) => (b?.count ?? 0) - (a?.count ?? 0));
  }, [metrics]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const token = localStorage.getItem(GATE_KEY);
    setHasGateAccess(token === "granted");
    setGateReady(true);
  }, []);

  const loadMetrics = useCallback(
    async (showToast = false) => {
      if (!isAdmin) return;
      setLoading(true);
      setError(null);
      try {
        const snapshot: MonitoringMetricsResponse = await fetchMonitoringMetrics();
        setMetrics(snapshot.metrics);
        setLastUpdated(snapshot.timestamp);
        if (showToast) {
          toast.success("Metrics refreshed");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load metrics";
        setError(message);
        if (showToast) {
          toast.error(message);
        }
      } finally {
        setLoading(false);
      }
    },
    [isAdmin]
  );

  useEffect(() => {
    if (!unauthorized) return;
    toast.error("Admin access required");
  }, [unauthorized]);

  useEffect(() => {
    if (authLoading || !gateReady) {
      return;
    }
    if (unauthorized) {
      return;
    }
    if (!hasGateAccess) {
      router.replace('/admin/access');
      return;
    }
    loadMetrics();
    const interval = setInterval(() => loadMetrics(), AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [authLoading, unauthorized, gateReady, hasGateAccess, loadMetrics, router]);

  if (authLoading || !gateReady || (isAdmin && !hasGateAccess)) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Checking permissions...</p>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="max-w-md space-y-4 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <BoltIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h1 className="text-2xl font-semibold text-gray-900">Admin access required</h1>
          <p className="text-sm text-gray-600">
            This monitoring console is limited to administrator accounts. Please sign in with elevated credentials or return to the main app.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              onClick={() => router.push('/auth')}
              className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
            >
              Sign in
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 sm:w-auto"
            >
              Go home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const inferenceEvents = metrics?.recent_inferences?.slice(-12).reverse() ?? [];
  const retrainingEvents = metrics?.recent_retraining_events?.slice().reverse() ?? [];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="ML Monitoring" subtitle="Live signal from inference traffic and retraining jobs." />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Observability snapshot</p>
              <p className="text-xs text-gray-500">
                Last updated {lastUpdated ? formatDate(lastUpdated) : "just now"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {error && <span className="text-xs text-rose-600">{error}</span>}
              <button
                onClick={() => loadMetrics(true)}
                className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800"
                disabled={loading}
              >
                <ArrowPathIcon className={cn("h-4 w-4", loading && "animate-spin")}
                />
                Refresh
              </button>
            </div>
          </div>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {modelEntries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-sm text-gray-500 lg:col-span-3">
                {loading ? "Loading metrics..." : "No inference data captured yet."}
              </div>
            ) : (
              modelEntries.map(([modelName, summary]) => (
                <article key={modelName} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">{modelName}</p>
                      <p className="text-2xl font-semibold text-gray-900">{summary.count}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-3 text-emerald-600">
                      <BoltIcon className="h-6 w-6" />
                    </div>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-500">
                    <div>
                      <dt className="uppercase tracking-wide">Success rate</dt>
                      <dd className="text-sm font-semibold text-gray-900">{formatSuccessRate(summary.success_rate)}</dd>
                    </div>
                    <div>
                      <dt className="uppercase tracking-wide">Avg latency</dt>
                      <dd className="text-sm font-semibold text-gray-900">{formatLatency(summary.avg_latency_ms)}</dd>
                    </div>
                    <div>
                      <dt className="uppercase tracking-wide">Success</dt>
                      <dd className="flex items-center gap-1 font-semibold text-emerald-600">
                        <ArrowTrendingUpIcon className="h-4 w-4" />
                        {summary.success}
                      </dd>
                    </div>
                    <div>
                      <dt className="uppercase tracking-wide">Failures</dt>
                      <dd className="flex items-center gap-1 font-semibold text-rose-600">
                        <ArrowTrendingDownIcon className="h-4 w-4" />
                        {summary.failure}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))
            )}
          </section>

          <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SignalIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Recent inference activity</h3>
                    <p className="text-sm text-gray-500">Latest {inferenceEvents.length} operations</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">Auto-refresh every {AUTO_REFRESH_MS / 1000}s</span>
              </div>
              <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100">
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Model</th>
                      <th className="px-4 py-3">Operation</th>
                      <th className="px-4 py-3">Latency</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 bg-white">
                    {inferenceEvents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-xs text-gray-500">
                          {loading ? "Streaming metrics..." : "No inference events yet."}
                        </td>
                      </tr>
                    ) : (
                      inferenceEvents.map((event, index) => (
                        <tr key={`${event.timestamp}-${index}`}>
                          <td className="px-4 py-3 font-semibold text-gray-900">{event.model}</td>
                          <td className="px-4 py-3 text-gray-600">{event.operation}</td>
                          <td className="px-4 py-3 text-gray-900">{formatLatency(event.latency_ms)}</td>
                          <td className="px-4 py-3">
                            <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", statusBadge(event.status))}>
                              {event.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">{formatDate(event.timestamp)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-6">
              <div className="flex items-center gap-3">
                <ClockIcon className="h-5 w-5 text-gray-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Retraining log</h3>
                  <p className="text-sm text-gray-500">Lifecycle of recent jobs</p>
                </div>
              </div>
              <ol className="mt-5 space-y-4">
                {retrainingEvents.length === 0 ? (
                  <p className="text-sm text-gray-500">No retraining events recorded yet.</p>
                ) : (
                  retrainingEvents.map((event, index) => (
                    <li key={`${event.timestamp}-${index}`} className="relative pl-5">
                      <span className="absolute left-0 top-2 h-2 w-2 rounded-full bg-gray-300" />
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                        <div className="flex items-center justify-between">
                          <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", retrainingBadge(event.status))}>
                            {event.status}
                          </span>
                          <span className="text-xs text-gray-400">{formatDate(event.timestamp)}</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-700">
                          Initiated by {event.initiated_by || "system"}
                        </p>
                        {event.details?.error && (
                          <p className="mt-1 text-xs text-rose-600">{event.details.error}</p>
                        )}
                      </div>
                    </li>
                  ))
                )}
              </ol>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
