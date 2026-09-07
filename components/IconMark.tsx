/**
 * The site's new v3 logo mark — a dark circular badge with a white "N"
 * monogram (public/brand/logo-mark.svg). In Figma this renders via a custom
 * icon-font glyph inline in text (shows as "◓" when that font isn't loaded);
 * the real vector lives hidden in the nav group. Reused as a small bullet
 * before every eyebrow label (EyebrowTag) as well as the Nav wordmark —
 * never re-embed the glyph as literal text, always this image.
 */
export default function IconMark({ className = "size-[14px]" }: { className?: string }) {
  return (
    <img
      src="/brand/logo-mark.svg"
      alt=""
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    />
  );
}
