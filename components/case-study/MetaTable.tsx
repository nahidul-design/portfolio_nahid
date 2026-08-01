import Reveal from "../Reveal";

/**
 * Role / Timeline / Category / Year — the four-column meta row under every
 * case-study title (Figma `98:2`, "Meta table", verified against the five
 * real project frames at `260:2`). Values are 20px Barlow at -3% tracking;
 * labels are 16px uppercase with NO tracking, per the sitewide rule that
 * uppercase UI labels don't carry the -3% body tracking (CLAUDE.md).
 */
const FIELDS = [
  { key: "role", label: "Role" },
  { key: "timeline", label: "Timeline" },
  { key: "category", label: "Category" },
  { key: "year", label: "Year" },
] as const;

type MetaValues = Record<(typeof FIELDS)[number]["key"], string>;

export default function MetaTable(values: MetaValues) {
  return (
    <Reveal
      group
      className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 sm:gap-y-0"
    >
      {FIELDS.map(({ key, label }) => (
        <div key={key} className="flex flex-col gap-2">
          <p className="text-base tracking-normal text-ink-muted uppercase">
            {label}
          </p>
          <p className="text-xl tracking-body text-ink">{values[key]}</p>
        </div>
      ))}
    </Reveal>
  );
}
