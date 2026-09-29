"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function Home() {
  const r = useRouter();
  useEffect(
    () =>
      r.replace(localStorage.getItem("dss_token") ? "/dashboard" : "/login"),
    [r],
  );
  return null;
}
