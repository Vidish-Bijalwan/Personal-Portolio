export function StateBadge({ state }: { state: string }) {
  const tone =
    state === "READY"
      ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-200"
      : state === "AWAITING_OPERATOR_REVIEW"
        ? "border-violet-300/30 bg-violet-300/10 text-violet-200"
        : state === "APPROVED_FOR_GENERATION" || state === "GENERATING"
          ? "border-[#c6a15b]/30 bg-[#c6a15b]/10 text-[#c6a15b]"
          : state === "RESULT_UPLOADED" || state === "OPERATOR_QC"
            ? "border-amber-300/30 bg-amber-300/10 text-amber-200"
            : state === "NEEDS_CLARIFICATION" ||
                state === "REJECTED" ||
                state === "REFUND_REQUIRED" ||
                state === "FAILED_PROVIDER" ||
                state === "FAILED_TIMEOUT"
              ? "border-red-300/30 bg-red-300/10 text-red-200"
              : "border-white/[0.14] bg-white/[0.04] text-white/60";
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${tone}`}
    >
      {state.replace(/_/g, " ")}
    </span>
  );
}
