import PenguinSlot from "@/components/PenguinSlot";

// No Footer here by design — the footer is scoped to every route except home.
export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-gutter py-section sm:px-gutter-lg sm:py-section-lg">
      <p className="text-2xs tracking-ui text-faint">Portfolio — 2026</p>

      <h1 className="mt-8 max-w-4xl text-3xl text-balance sm:text-5xl">
        Design that earns its <span className="text-accent">restraint</span>.
      </h1>

      <p className="mt-8 max-w-xl text-md text-ink-soft text-pretty">
        A sample heading and lede rendered in the new type system — a single
        neutral grotesque, tight tracking throughout, nothing smaller than
        12px anywhere on the site.
      </p>

      <PenguinSlot />
    </main>
  );
}
