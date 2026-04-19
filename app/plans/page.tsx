import { Suspense } from "react";
import PlansContent from "./plans-content";

export default function PlansPage() {
  return (
    <Suspense fallback={<div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10"><p className="text-slate-500">Caricamento...</p></div>}>
      <PlansContent />
    </Suspense>
  );
}
