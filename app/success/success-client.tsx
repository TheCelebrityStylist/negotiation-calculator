"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";

const UNLOCK_KEY = "negocalc_unlocked_v1";

export default function SuccessClient() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = React.useState<"checking" | "ok" | "fail">(
    "checking"
  );

  React.useEffect(() => {
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setStatus("fail");
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId })
        });

        const data = (await res.json()) as { paid?: boolean };

        if (data.paid) {
          try {
            localStorage.setItem(UNLOCK_KEY, "true");
          } catch {}
          setStatus("ok");
          router.replace("/");
        } else {
          setStatus("fail");
        }
      } catch {
        setStatus("fail");
      }
    })();
  }, [params, router]);

  return (
    <main style={{ padding: 28, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 10px" }}>Payment status</h1>
      {status === "checking" && <p>Verifying your payment…</p>}
      {status === "ok" && <p>Unlocked. Redirecting…</p>}
      {status === "fail" && (
        <>
          <p>Could not verify payment. Please return and try again.</p>
          <a href="/" style={{ color: "white" }}>
            Back
          </a>
        </>
      )}
    </main>
  );
}
