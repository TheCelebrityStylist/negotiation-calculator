import { Suspense } from "react";
import SuccessClient from "./SuccessClient";

export default function SuccessPage() {
  return (
    <Suspense fallback={<main style={{ padding: 28 }}>Loading…</main>}>
      <SuccessClient />
    </Suspense>
  );
}
