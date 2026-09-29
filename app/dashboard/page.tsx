"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Shell } from "../../components/Shell";
import { RequireAuth } from "../../components/RequireAuth";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
export default function Dashboard() {
  const q = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard");
      return data;
    },
  });
  const s = q.data?.stats || {};
  const chart = (q.data?.recentBenchmarks || []).map((x: any) => ({
    algorithm: x.algorithm,
    sign: x.signingTime,
    verify: x.verificationTime,
  }));
  return (
    <RequireAuth>
      <Shell>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
          <div>
            <p className="text-indigo-600 font-bold text-sm">OVERVIEW</p>
            <h1 className="text-3xl font-black mt-1">
              Cryptographic workspace
            </h1>
            <p className="text-slate-500 mt-1">
              Monitor documents, signatures and empirical performance.
            </p>
          </div>
          <Link href="/sign" className="btn btn-primary">
            + Sign a document
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            ["Documents", s.documents],
            ["Signatures", s.signatures],
            ["Benchmarks", s.benchmarks],
            ["Valid verifications", s.validVerifications],
          ].map(([a, b]) => (
            <div className="card p-5" key={a as string}>
              <p className="text-slate-500 text-sm">{a}</p>
              <p className="text-3xl font-black mt-2">{b ?? 0}</p>
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="card p-6 lg:col-span-2">
            <div className="flex justify-between mb-5">
              <div>
                <h2 className="font-black text-lg">
                  Recent benchmark performance
                </h2>
                <p className="text-sm text-slate-500">
                  Average milliseconds per operation
                </p>
              </div>
              <Link
                href="/benchmark"
                className="text-indigo-600 font-bold text-sm"
              >
                Run benchmark →
              </Link>
            </div>
            <div className="h-72">
              {chart.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart}>
                    <XAxis dataKey="algorithm" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sign" name="Signing ms" />
                    <Bar dataKey="verify" name="Verification ms" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                  No benchmark data yet.
                </div>
              )}
            </div>
          </div>
          <div className="card p-6">
            <h2 className="font-black text-lg">Workflow</h2>
            <div className="space-y-4 mt-5">
              {[
                "Upload a document",
                "Generate a signature",
                "Verify integrity",
                "Benchmark algorithms",
                "Export research data",
              ].map((x, i) => (
                <div className="flex gap-3" key={x}>
                  <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  <span className="text-sm font-semibold">{x}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Shell>
    </RequireAuth>
  );
}
