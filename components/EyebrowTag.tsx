/**
 * The small pill label seen above nearly every section (Figma: "intro",
 * "About me", "experience", "education", "quote I like") — uppercase Chivo
 * Mono on a 5%-opacity pill. `dark` flips it for use on the ink-coloured
 * quote panel (white text, 5%-opacity white pill).
 *
 * No icon mark here — an earlier pass carried the "◓" logo glyph into every
 * one of these chips, but the Figma file was updated to drop it; only the
 * Nav wordmark keeps the icon now (see IconMark/Nav.tsx).
 */
export default function EyebrowTag({
  children,
  dark = false,
}: {
  children: string;
  dark?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 font-mono text-[14px] leading-none font-light uppercase ${
        dark ? "bg-white/5 text-white" : "bg-ink/5 text-ink"
      }`}
    >
      {children}
    </span>
  );
}
