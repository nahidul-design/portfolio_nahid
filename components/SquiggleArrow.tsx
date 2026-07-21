/** Figma's hand-drawn pointer arrow (96:121/125:105). currentColor so it
 *  works on both light (case studies) and dark (UI Picker) backgrounds. */
export default function SquiggleArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 79 15"
      aria-hidden="true"
      className={`h-auto w-[78px] shrink-0 ${className}`}
      fill="currentColor"
    >
      <path d="M78.7 8.07a1 1 0 0 0 0-1.41L72.34.29a1 1 0 1 0-1.41 1.41l5.65 5.66-5.65 5.66a1 1 0 1 0 1.41 1.41L78.7 8.07ZM0 7.36v1h78v-2H0v1Z" />
    </svg>
  );
}
