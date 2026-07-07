export function GradientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-slate-50 dark:bg-[#0c0918]" />
      <div className="blob left-[-10%] top-[-10%] h-[420px] w-[420px] bg-brand-400" />
      <div className="blob right-[-10%] top-[10%] h-[380px] w-[380px] bg-fuchsia-400 [animation-delay:2s]" />
      <div className="blob bottom-[-15%] left-[20%] h-[460px] w-[460px] bg-indigo-400 [animation-delay:4s]" />
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgb(var(--text)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--text)) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
    </div>
  );
}
