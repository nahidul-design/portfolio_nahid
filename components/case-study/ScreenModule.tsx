import Reveal from "../Reveal";
import { withBasePath } from "@/lib/assets";

/**
 * One full-width project screen + caption (Figma `98:2`, "07 Screen — full
 * width", repeated per project). No hairline between consecutive modules or
 * between "What I did" and the first screen — Figma stacks these with
 * spacing alone, not dividers.
 */
export default function ScreenModule({
  image,
  caption,
  alt,
}: {
  image: string;
  caption: string;
  alt: string;
}) {
  return (
    <div className="flex flex-col gap-4 px-gutter py-10 lg:gap-6 lg:px-gutter-lg lg:py-14">
      <Reveal image className="img-radius w-full overflow-hidden">
        <img
          src={withBasePath(image)}
          alt={alt}
          className="aspect-[1200/680] h-auto w-full object-cover"
        />
      </Reveal>
      <Reveal as="p" className="text-base tracking-body text-ink-muted">
        {caption}
      </Reveal>
    </div>
  );
}
