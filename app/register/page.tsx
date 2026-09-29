"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, saveSession } from "../../lib/api";
export default function Register() {
  const r = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/register", form);
      saveSession(data);
      r.replace("/dashboard");
    } catch (e: any) {
      setError(e.response?.data?.message || "Unable to create account");
    }
  }
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-md card p-8">
        <h1 className="text-2xl font-black">Create your account</h1>
        <p className="text-slate-500 mt-2 mb-7">
          Start signing and benchmarking securely.
        </p>
        {error && (
          <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg">
            {error}
          </div>
        )}
        <label className="text-sm font-semibold">
          Full name
          <input
            className="input mt-2 mb-4"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />
        </label>
        <label className="text-sm font-semibold">
          Email
          <input
            className="input mt-2 mb-4"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>
        <label className="text-sm font-semibold">
          Password
          <div className="relative mt-2 mb-6">
            <input
              className="input w-full pr-14"
              type={showPassword ? "text" : "password"}
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-indigo-600 hover:text-indigo-500"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>
        <button className="btn btn-primary w-full">Create account</button>
        <p className="text-sm text-center mt-5 text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="text-indigo-600 font-bold">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
