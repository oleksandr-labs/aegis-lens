export function DangerChip({ danger }: { danger: number }) {
  const color = danger >= 70 ? "red" : danger >= 40 ? "yellow" : "green";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px]
        ${
          color === "red"
            ? "border-red-500/20 bg-red-500/10 text-red-400"
            : color === "yellow"
              ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
              : "border-green-500/20 bg-green-500/10 text-green-400"
        }`}
      title={`Danger score: ${danger}`}
    >
      <span aria-hidden="true">⚠</span> {danger}
    </span>
  );
}
