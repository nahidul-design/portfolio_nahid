/**
 * Reserved space in the bottom-right of the home page for a future penguin.
 * Deliberately empty and non-interactive — drop the penguin in as a child.
 */
export default function PenguinSlot() {
  return (
    <div
      data-slot="penguin"
      aria-hidden
      className="pointer-events-none fixed right-4 bottom-4 z-40 h-24 w-24 sm:right-8 sm:bottom-8 sm:h-32 sm:w-32"
    />
  );
}
